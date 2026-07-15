import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedIdentity } from "@/features/auth/session";
import { getValidDriveCredentials } from "@/features/drive/access";
import { confirmImportSchema } from "@/features/imports/contracts";
import {
  commitValidatedImport,
  getDuplicateDriveFileIds,
} from "@/features/imports/repository";
import { validateSelectedDriveFiles } from "@/features/imports/service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const parsed = confirmImportSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "The audiobook review contains invalid fields." },
      { status: 400 },
    );
  }

  try {
    const fileIds = parsed.data.groups.flatMap((group) => group.fileIds);
    const credentials = await getValidDriveCredentials(identity.id);
    const validation = await validateSelectedDriveFiles(
      fileIds,
      credentials.accessToken,
    );

    if (validation.rejected.length > 0) {
      return NextResponse.json(
        {
          error: "One or more files are no longer available for import.",
          rejected: validation.rejected,
        },
        { status: 422 },
      );
    }

    const duplicateFileIds = await getDuplicateDriveFileIds(
      identity.id,
      fileIds,
    );

    if (duplicateFileIds.length > 0) {
      return NextResponse.json(
        { duplicateFileIds, error: "One or more files were already imported." },
        { status: 409 },
      );
    }

    const validatedFiles = new Map(
      validation.accepted.map((file) => [file.driveFileId, file]),
    );
    const audiobookIds = await commitValidatedImport(
      identity.id,
      parsed.data,
      validatedFiles,
    );

    return NextResponse.json({ audiobookIds }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "The audiobook import could not be completed." },
      { status: 500 },
    );
  }
}

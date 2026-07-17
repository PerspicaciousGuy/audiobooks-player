import { NextResponse, type NextRequest } from "next/server";

import { getValidDriveCredentials } from "@/features/drive/access";
import { getDriveConnection } from "@/features/drive/repository";
import { confirmImportSchema } from "@/features/imports/contracts";
import {
  commitValidatedImport,
  getDuplicateDriveFileIds,
} from "@/features/imports/repository";
import { validateSelectedDriveFiles } from "@/features/imports/service";
import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const access = await authorizeMutation(request, "import_confirm");

  if (access.response) return access.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return problemResponse("Invalid JSON body.", 400);
  }

  const parsed = confirmImportSchema.safeParse(body);

  if (!parsed.success) {
    return problemResponse(
      "The audiobook review contains invalid fields.",
      400,
    );
  }

  try {
    const fileIds = parsed.data.groups.flatMap((group) => group.fileIds);
    const credentials = await getValidDriveCredentials(access.identity.id);
    const connection = await getDriveConnection(access.identity.id);

    if (!connection?.selectedFolder) {
      return problemResponse("Choose the Audiobooks folder again.", 409);
    }

    const validation = await validateSelectedDriveFiles(
      fileIds,
      credentials.accessToken,
      connection.selectedFolder.id,
    );

    if (validation.rejected.length > 0) {
      return problemResponse(
        "One or more files are no longer available for import.",
        422,
        { extensions: { rejected: validation.rejected } },
      );
    }

    const duplicateFileIds = await getDuplicateDriveFileIds(
      access.identity.id,
      fileIds,
    );

    if (duplicateFileIds.length > 0) {
      return problemResponse("One or more files were already imported.", 409, {
        extensions: { duplicateFileIds },
      });
    }

    const validatedFiles = new Map(
      validation.accepted.map((file) => [file.driveFileId, file]),
    );
    const audiobookIds = await commitValidatedImport(
      access.identity.id,
      parsed.data,
      validatedFiles,
    );

    return NextResponse.json({ audiobookIds }, { status: 201 });
  } catch {
    return problemResponse("The audiobook import could not be completed.", 500);
  }
}

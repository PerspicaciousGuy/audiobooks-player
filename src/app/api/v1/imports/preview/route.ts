import { NextResponse, type NextRequest } from "next/server";

import { getAuthenticatedIdentity } from "@/features/auth/session";
import { getValidDriveCredentials } from "@/features/drive/access";
import {
  selectedDriveFilesSchema,
  type ImportPreviewResponse,
} from "@/features/imports/contracts";
import { groupValidatedDriveFiles } from "@/features/imports/grouping";
import { getDuplicateDriveFileIds } from "@/features/imports/repository";
import { validateSelectedDriveFiles } from "@/features/imports/service";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const parsed = selectedDriveFilesSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select between 1 and 25 valid Drive files." },
      { status: 400 },
    );
  }

  try {
    const credentials = await getValidDriveCredentials(identity.id);
    const validation = await validateSelectedDriveFiles(
      parsed.data.fileIds,
      credentials.accessToken,
    );
    const duplicateFileIds = await getDuplicateDriveFileIds(
      identity.id,
      validation.accepted.map(({ driveFileId }) => driveFileId),
    );
    const duplicateSet = new Set(duplicateFileIds);
    const response: ImportPreviewResponse = {
      duplicateFileIds,
      groups: groupValidatedDriveFiles(
        validation.accepted.filter(
          ({ driveFileId }) => !duplicateSet.has(driveFileId),
        ),
      ),
      rejected: validation.rejected,
    };

    return NextResponse.json(response, {
      headers: { "cache-control": "no-store, private" },
    });
  } catch {
    return NextResponse.json(
      { error: "Selected Drive files could not be validated." },
      { status: 502 },
    );
  }
}

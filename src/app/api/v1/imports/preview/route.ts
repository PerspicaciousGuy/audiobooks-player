import { NextResponse, type NextRequest } from "next/server";

import { getValidDriveCredentials } from "@/features/drive/access";
import {
  selectedDriveFilesSchema,
  type ImportPreviewResponse,
} from "@/features/imports/contracts";
import { groupValidatedDriveFiles } from "@/features/imports/grouping";
import { getDuplicateDriveFileIds } from "@/features/imports/repository";
import { validateSelectedDriveFiles } from "@/features/imports/service";
import { authorizeMutation } from "@/lib/security/apiAccess";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const access = await authorizeMutation(request, "import_preview");

  if (access.response) return access.response;

  const parsed = selectedDriveFilesSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select between 1 and 25 valid Drive files." },
      { status: 400 },
    );
  }

  try {
    const credentials = await getValidDriveCredentials(access.identity.id);
    const validation = await validateSelectedDriveFiles(
      parsed.data.fileIds,
      credentials.accessToken,
    );
    const duplicateFileIds = await getDuplicateDriveFileIds(
      access.identity.id,
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

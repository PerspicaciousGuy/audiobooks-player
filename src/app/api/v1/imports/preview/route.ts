import { NextResponse, type NextRequest } from "next/server";

import { getValidDriveCredentials } from "@/features/drive/access";
import {
  DriveFolderError,
  listAudiobooksFolderFileIds,
  validateAudiobooksFolder,
} from "@/features/drive/folders";
import { getDriveConnection } from "@/features/drive/repository";
import {
  importPreviewSourceSchema,
  type ImportPreviewResponse,
} from "@/features/imports/contracts";
import { groupValidatedDriveFiles } from "@/features/imports/grouping";
import { getDuplicateDriveFileIds } from "@/features/imports/repository";
import { validateSelectedDriveFiles } from "@/features/imports/service";
import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";

export async function POST(request: NextRequest): Promise<NextResponse> {
  const access = await authorizeMutation(request, "import_preview");

  if (access.response) return access.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return problemResponse("Invalid JSON body.", 400);
  }

  const parsed = importPreviewSourceSchema.safeParse(body);

  if (!parsed.success) {
    return problemResponse("Select a valid Audiobooks folder.", 400);
  }

  try {
    const credentials = await getValidDriveCredentials(access.identity.id);
    let fileIds: string[];

    if ("folderId" in parsed.data) {
      const connection = await getDriveConnection(access.identity.id);

      if (connection?.selectedFolder?.id !== parsed.data.folderId) {
        return problemResponse("Choose the Audiobooks folder again.", 409);
      }

      await validateAudiobooksFolder(
        parsed.data.folderId,
        credentials.accessToken,
      );
      fileIds = await listAudiobooksFolderFileIds(
        parsed.data.folderId,
        credentials.accessToken,
      );
    } else {
      fileIds = parsed.data.fileIds;
    }

    const validation = await validateSelectedDriveFiles(
      fileIds,
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
  } catch (error) {
    if (error instanceof DriveFolderError) {
      return problemResponse(error.message, 422);
    }

    return problemResponse("Selected Drive files could not be validated.", 502);
  }
}

import { NextResponse, type NextRequest } from "next/server";

import { getValidDriveCredentials } from "@/features/drive/access";
import { selectedDriveFolderInputSchema } from "@/features/drive/contracts";
import {
  DriveFolderError,
  validateAudiobooksFolder,
} from "@/features/drive/folders";
import { saveSelectedDriveFolder } from "@/features/drive/repository";
import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";

export async function PUT(request: NextRequest): Promise<NextResponse> {
  const access = await authorizeMutation(request, "import_preview");

  if (access.response) return access.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return problemResponse("Invalid JSON body.", 400);
  }

  const parsed = selectedDriveFolderInputSchema.safeParse(body);

  if (!parsed.success) {
    return problemResponse("Select a valid Google Drive folder.", 400);
  }

  try {
    const credentials = await getValidDriveCredentials(access.identity.id);
    const folder = await validateAudiobooksFolder(
      parsed.data.folderId,
      credentials.accessToken,
    );
    await saveSelectedDriveFolder(access.identity.id, folder);

    return NextResponse.json(
      { folder },
      { headers: { "cache-control": "no-store, private" } },
    );
  } catch (error) {
    if (error instanceof DriveFolderError) {
      return problemResponse(error.message, 422);
    }

    return problemResponse("The Drive folder could not be saved.", 502);
  }
}

import type { SelectedDriveFolder } from "@/features/drive/contracts";

import type { ImportPreviewResponse } from "./contracts";

export async function selectAudiobooksFolder(
  folderId: string,
): Promise<SelectedDriveFolder> {
  const response = await fetch("/api/v1/drive/folder", {
    body: JSON.stringify({ folderId }),
    headers: { "content-type": "application/json" },
    method: "PUT",
  });
  const payload = (await response.json()) as {
    detail?: string;
    folder?: SelectedDriveFolder;
  };

  if (!response.ok || !payload.folder) {
    throw new Error(payload.detail ?? "The folder could not be saved.");
  }

  return payload.folder;
}

export async function previewAudiobooksFolder(
  folderId: string,
): Promise<ImportPreviewResponse> {
  const response = await fetch("/api/v1/imports/preview", {
    body: JSON.stringify({ folderId }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });
  const payload = (await response.json()) as ImportPreviewResponse & {
    detail?: string;
  };

  if (!response.ok) {
    throw new Error(
      payload.detail ?? "The Audiobooks folder could not be reviewed.",
    );
  }

  return payload;
}

import { z } from "zod";

export const AUDIOBOOKS_FOLDER_NAME = "Audiobooks";
export const GOOGLE_DRIVE_FOLDER_MIME_TYPE =
  "application/vnd.google-apps.folder";

export const driveItemIdSchema = z
  .string()
  .min(10)
  .max(255)
  .regex(/^[A-Za-z0-9_-]+$/);

export const selectedDriveFolderInputSchema = z.object({
  folderId: driveItemIdSchema,
});

export interface SelectedDriveFolder {
  id: string;
  name: string;
}

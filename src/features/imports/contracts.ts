import { z } from "zod";

const driveFileIdSchema = z
  .string()
  .min(10)
  .max(255)
  .regex(/^[A-Za-z0-9_-]+$/);

export const selectedDriveFilesSchema = z.object({
  fileIds: z
    .array(driveFileIdSchema)
    .min(1)
    .max(25)
    .refine((ids) => new Set(ids).size === ids.length, "Duplicate file IDs."),
});

export const importGroupInputSchema = z.object({
  author: z.string().trim().max(300).default(""),
  fileIds: z.array(driveFileIdSchema).min(1).max(25),
  narrator: z.string().trim().max(300).default(""),
  series: z.string().trim().max(300).default(""),
  seriesPosition: z.number().positive().max(99_999).nullable().default(null),
  title: z.string().trim().min(1).max(300),
});

export const confirmImportSchema = z
  .object({ groups: z.array(importGroupInputSchema).min(1).max(25) })
  .superRefine((value, context) => {
    const ids = value.groups.flatMap((group) => group.fileIds);

    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "A selected file can only belong to one audiobook.",
        path: ["groups"],
      });
    }
  });

export interface DetectedAudioMetadata {
  album?: string;
  author?: string;
  chapters?: Array<{
    endMs?: number;
    startMs: number;
    title: string;
  }>;
  narrator?: string;
  title?: string;
}

export interface ValidatedDriveFile {
  byteSize: string;
  detected: DetectedAudioMetadata;
  driveFileId: string;
  driveVersion: string | null;
  md5Checksum: string | null;
  mimeType: string;
  name: string;
}

export interface RejectedDriveFile {
  driveFileId: string;
  name?: string;
  reason: string;
}

export interface ImportPreviewGroup {
  author: string;
  files: ValidatedDriveFile[];
  narrator: string;
  series: string;
  seriesPosition: number | null;
  title: string;
}

export interface ImportPreviewResponse {
  duplicateFileIds: string[];
  groups: ImportPreviewGroup[];
  rejected: RejectedDriveFile[];
}

export type ConfirmImportInput = z.infer<typeof confirmImportSchema>;

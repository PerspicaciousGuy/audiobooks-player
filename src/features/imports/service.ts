import "server-only";

import type { RejectedDriveFile, ValidatedDriveFile } from "./contracts";
import { isValidatedDriveFile, validateDriveFile } from "./driveFiles";

const VALIDATION_CONCURRENCY = 5;

export interface ValidatedSelection {
  accepted: ValidatedDriveFile[];
  rejected: RejectedDriveFile[];
}

export async function validateSelectedDriveFiles(
  fileIds: string[],
  accessToken: string,
  folderId?: string,
): Promise<ValidatedSelection> {
  const accepted: ValidatedDriveFile[] = [];
  const rejected: RejectedDriveFile[] = [];

  for (let index = 0; index < fileIds.length; index += VALIDATION_CONCURRENCY) {
    const batch = fileIds.slice(index, index + VALIDATION_CONCURRENCY);
    const results = await Promise.all(
      batch.map((fileId) => validateDriveFile(fileId, accessToken, folderId)),
    );

    results.forEach((file) => {
      if (isValidatedDriveFile(file)) {
        accepted.push(file);
      } else {
        rejected.push(file);
      }
    });
  }

  return { accepted, rejected };
}

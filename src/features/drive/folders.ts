import "server-only";

import { z } from "zod";

import {
  AUDIOBOOKS_FOLDER_NAME,
  driveItemIdSchema,
  GOOGLE_DRIVE_FOLDER_MIME_TYPE,
  type SelectedDriveFolder,
} from "./contracts";

import { isSupportedDriveAudioFile } from "@/features/imports/driveFiles";

const DRIVE_FILES_URL = "https://www.googleapis.com/drive/v3/files";
const MAX_AUDIO_FILE_COUNT = 25;
const MAX_FOLDER_COUNT = 100;
const PAGE_SIZE = 100;

const driveFolderSchema = z.object({
  id: driveItemIdSchema,
  mimeType: z.string(),
  name: z.string(),
  trashed: z.boolean().default(false),
});

const driveChildSchema = z.object({
  id: driveItemIdSchema,
  mimeType: z.string(),
  name: z.string(),
});

const driveFileListSchema = z.object({
  files: z.array(driveChildSchema).default([]),
  nextPageToken: z.string().optional(),
});

export class DriveFolderError extends Error {}

function authorizationHeaders(accessToken: string): HeadersInit {
  return { authorization: `Bearer ${accessToken}` };
}

async function readDriveFolder(
  folderId: string,
  accessToken: string,
): Promise<z.infer<typeof driveFolderSchema>> {
  const url = new URL(`${DRIVE_FILES_URL}/${encodeURIComponent(folderId)}`);
  url.searchParams.set("fields", "id,name,mimeType,trashed");
  url.searchParams.set("supportsAllDrives", "true");
  const response = await fetch(url, {
    cache: "no-store",
    headers: authorizationHeaders(accessToken),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    throw new DriveFolderError("Google Drive did not allow this folder.");
  }

  const parsed = driveFolderSchema.safeParse(await response.json());

  if (!parsed.success) {
    throw new DriveFolderError("Google Drive returned incomplete folder data.");
  }

  return parsed.data;
}

function folderChildrenUrl(folderId: string, pageToken?: string): URL {
  const url = new URL(DRIVE_FILES_URL);
  url.searchParams.set("corpora", "user");
  url.searchParams.set("fields", "nextPageToken,files(id,name,mimeType)");
  url.searchParams.set("includeItemsFromAllDrives", "true");
  url.searchParams.set("orderBy", "name_natural");
  url.searchParams.set("pageSize", String(PAGE_SIZE));
  url.searchParams.set("q", `'${folderId}' in parents and trashed = false`);
  url.searchParams.set("spaces", "drive");
  url.searchParams.set("supportsAllDrives", "true");

  if (pageToken) url.searchParams.set("pageToken", pageToken);
  return url;
}

async function listFolderChildren(
  folderId: string,
  accessToken: string,
): Promise<Array<z.infer<typeof driveChildSchema>>> {
  const children: Array<z.infer<typeof driveChildSchema>> = [];
  let pageToken: string | undefined;

  do {
    const response = await fetch(folderChildrenUrl(folderId, pageToken), {
      cache: "no-store",
      headers: authorizationHeaders(accessToken),
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      throw new DriveFolderError("The Audiobooks folder could not be scanned.");
    }

    const parsed = driveFileListSchema.safeParse(await response.json());

    if (!parsed.success) {
      throw new DriveFolderError("Google Drive returned an invalid file list.");
    }

    children.push(...parsed.data.files);
    pageToken = parsed.data.nextPageToken;
  } while (pageToken);

  return children;
}

export async function validateAudiobooksFolder(
  folderId: string,
  accessToken: string,
): Promise<SelectedDriveFolder> {
  const folder = await readDriveFolder(folderId, accessToken);

  if (
    folder.trashed ||
    folder.mimeType !== GOOGLE_DRIVE_FOLDER_MIME_TYPE ||
    folder.name !== AUDIOBOOKS_FOLDER_NAME
  ) {
    throw new DriveFolderError(
      `Choose a Google Drive folder named ${AUDIOBOOKS_FOLDER_NAME}.`,
    );
  }

  return { id: folder.id, name: folder.name };
}

export async function listAudiobooksFolderFileIds(
  folderId: string,
  accessToken: string,
): Promise<string[]> {
  const audioFileIds: string[] = [];
  const pendingFolderIds = [folderId];
  const visitedFolderIds = new Set<string>();

  while (pendingFolderIds.length > 0) {
    const currentFolderId = pendingFolderIds.shift();

    if (!currentFolderId || visitedFolderIds.has(currentFolderId)) continue;
    visitedFolderIds.add(currentFolderId);

    if (visitedFolderIds.size > MAX_FOLDER_COUNT) {
      throw new DriveFolderError(
        "The Audiobooks folder has too many subfolders.",
      );
    }

    const children = await listFolderChildren(currentFolderId, accessToken);

    children.forEach((child) => {
      if (child.mimeType === GOOGLE_DRIVE_FOLDER_MIME_TYPE) {
        pendingFolderIds.push(child.id);
      } else if (isSupportedDriveAudioFile(child.name, child.mimeType)) {
        audioFileIds.push(child.id);
      }
    });

    if (audioFileIds.length > MAX_AUDIO_FILE_COUNT) {
      throw new DriveFolderError(
        `Import supports up to ${MAX_AUDIO_FILE_COUNT} audio files at a time.`,
      );
    }
  }

  return audioFileIds;
}

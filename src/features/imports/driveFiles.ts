import "server-only";

import { z } from "zod";

import type { RejectedDriveFile, ValidatedDriveFile } from "./contracts";
import { parseId3Metadata } from "./id3";

const MAX_METADATA_BYTES = 1024 * 1024;
const SUPPORTED_EXTENSIONS = new Set(["aac", "m4a", "m4b", "mp3", "ogg"]);
const SUPPORTED_MIME_TYPES = new Set([
  "application/octet-stream",
  "audio/aac",
  "audio/mp4",
  "audio/mpeg",
  "audio/ogg",
  "audio/x-m4a",
  "audio/x-m4b",
]);

export function isSupportedDriveAudioFile(
  name: string,
  mimeType: string,
): boolean {
  const extension = name.split(".").pop()?.toLowerCase();

  return Boolean(
    extension &&
    SUPPORTED_EXTENSIONS.has(extension) &&
    SUPPORTED_MIME_TYPES.has(mimeType),
  );
}

const driveFileSchema = z.object({
  capabilities: z.object({ canDownload: z.boolean() }).optional(),
  id: z.string().min(1),
  md5Checksum: z.string().optional(),
  mimeType: z.string().min(1),
  name: z.string().min(1),
  size: z.string().regex(/^\d+$/).optional(),
  trashed: z.boolean().default(false),
  version: z.string().optional(),
});

function driveFileUrl(fileId: string, altMedia = false): string {
  const url = new URL(
    `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}`,
  );
  url.searchParams.set("supportsAllDrives", "true");

  if (altMedia) {
    url.searchParams.set("alt", "media");
  } else {
    url.searchParams.set(
      "fields",
      "id,name,mimeType,size,md5Checksum,version,trashed,capabilities(canDownload)",
    );
  }

  return url.toString();
}

async function readBoundedId3(
  fileId: string,
  accessToken: string,
): Promise<ReturnType<typeof parseId3Metadata>> {
  const response = await fetch(driveFileUrl(fileId, true), {
    cache: "no-store",
    headers: {
      authorization: `Bearer ${accessToken}`,
      range: `bytes=0-${MAX_METADATA_BYTES - 1}`,
    },
    signal: AbortSignal.timeout(12_000),
  });

  if (!response.ok || response.status !== 206) {
    return {};
  }

  const contentLength = Number(response.headers.get("content-length"));

  if (!Number.isFinite(contentLength) || contentLength > MAX_METADATA_BYTES) {
    return {};
  }

  return parseId3Metadata(await response.arrayBuffer());
}

function reject(
  driveFileId: string,
  reason: string,
  name?: string,
): RejectedDriveFile {
  return { driveFileId, reason, ...(name ? { name } : {}) };
}

export async function validateDriveFile(
  driveFileId: string,
  accessToken: string,
): Promise<ValidatedDriveFile | RejectedDriveFile> {
  const response = await fetch(driveFileUrl(driveFileId), {
    cache: "no-store",
    headers: { authorization: `Bearer ${accessToken}` },
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    return reject(driveFileId, "Google Drive did not allow this file.");
  }

  const parsed = driveFileSchema.safeParse(await response.json());

  if (!parsed.success) {
    return reject(driveFileId, "Drive metadata was incomplete.");
  }

  const file = parsed.data;
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (
    file.trashed ||
    file.capabilities?.canDownload !== true ||
    !file.size ||
    !extension ||
    !isSupportedDriveAudioFile(file.name, file.mimeType)
  ) {
    return reject(
      driveFileId,
      "The file is unsupported, unavailable, or cannot be downloaded.",
      file.name,
    );
  }

  const detected =
    extension === "mp3" ? await readBoundedId3(driveFileId, accessToken) : {};

  return {
    byteSize: file.size,
    detected,
    driveFileId,
    driveVersion: file.version ?? null,
    md5Checksum: file.md5Checksum ?? null,
    mimeType: file.mimeType,
    name: file.name,
  };
}

export function isValidatedDriveFile(
  file: ValidatedDriveFile | RejectedDriveFile,
): file is ValidatedDriveFile {
  return "byteSize" in file;
}

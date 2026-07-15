"use client";

import type { Audiobook, AudioSource } from "@/types/audiobook";

import { getOfflineDatabase, type OfflineDownloadRecord } from "./database";
import {
  deleteOfflineBlob,
  preferredStorageKind,
  readOfflineBlob,
  writeOfflineResponse,
} from "./storageBackends";

export interface DownloadProgress {
  downloadedBytes: number;
  sourceName: string;
  totalBytes: number;
}

function sourceDownloadUrl(audiobookId: string, sourceId: string): string {
  return `/api/v1/audiobooks/${audiobookId}/download?fileId=${sourceId}`;
}

async function ensureStorageCapacity(requiredBytes: number): Promise<void> {
  if (!navigator.storage?.estimate) return;
  const { quota = 0, usage = 0 } = await navigator.storage.estimate();

  if (quota > 0 && quota - usage < requiredBytes * 1.05) {
    throw new Error("This device does not have enough browser storage.");
  }

  if (navigator.storage.persist) void navigator.storage.persist();
}

async function removeRecord(record: OfflineDownloadRecord): Promise<void> {
  await deleteOfflineBlob(record.sourceId, record.storageKind);
  await getOfflineDatabase().downloads.delete(record.sourceId);
}

export async function downloadAudiobook(
  audiobook: Audiobook,
  signal: AbortSignal,
  onProgress: (progress: DownloadProgress) => void,
): Promise<void> {
  const sources = audiobook.sources ?? [];

  if (sources.length === 0)
    throw new Error("This audiobook has no audio sources.");
  const totalBytes = sources.reduce((sum, source) => sum + source.byteSize, 0);
  await ensureStorageCapacity(totalBytes);
  const storageKind = preferredStorageKind();
  const startedRecords: OfflineDownloadRecord[] = [];
  let completedBeforeSource = 0;

  try {
    for (const source of sources) {
      const record: OfflineDownloadRecord = {
        author: audiobook.author,
        audiobookId: audiobook.id,
        bookTitle: audiobook.title,
        byteSize: source.byteSize,
        downloadedAt: null,
        driveVersion: source.driveVersion,
        mimeType: source.mimeType,
        sequence: source.sequence,
        sourceId: source.id,
        sourceName: source.name,
        status: "partial",
        storageKind,
      };
      startedRecords.push(record);
      await getOfflineDatabase().downloads.put(record);
      const response = await fetch(sourceDownloadUrl(audiobook.id, source.id), {
        cache: "no-store",
        signal,
      });

      if (!response.ok)
        throw new Error("The server could not download this source.");
      let sourceBytes = 0;
      await writeOfflineResponse(
        source.id,
        response,
        storageKind,
        (downloaded) => {
          sourceBytes = downloaded;
          onProgress({
            downloadedBytes: completedBeforeSource + downloaded,
            sourceName: source.name,
            totalBytes,
          });
        },
        signal,
      );

      if (sourceBytes !== source.byteSize) {
        throw new Error("The completed download size did not match Drive.");
      }

      await getOfflineDatabase().downloads.update(source.id, {
        downloadedAt: new Date().toISOString(),
        status: "complete",
      });
      completedBeforeSource += source.byteSize;
    }
  } catch (error) {
    await Promise.all(startedRecords.map(removeRecord));
    throw error;
  }
}

export async function listOfflineDownloads(): Promise<OfflineDownloadRecord[]> {
  const records = await getOfflineDatabase().downloads.toArray();
  const valid: OfflineDownloadRecord[] = [];

  for (const record of records) {
    if (record.status !== "complete") {
      await removeRecord(record);
      continue;
    }

    const blob = await readOfflineBlob(record.sourceId, record.storageKind);
    if (!blob || blob.size !== record.byteSize) {
      await removeRecord(record);
      continue;
    }
    valid.push(record);
  }

  return valid;
}

export async function resolveOfflineSourceUrl(
  source: AudioSource,
): Promise<string | undefined> {
  const record = await getOfflineDatabase().downloads.get(source.id);

  if (
    !record ||
    record.status !== "complete" ||
    record.driveVersion !== source.driveVersion ||
    record.byteSize !== source.byteSize
  ) {
    if (record) await removeRecord(record);
    return undefined;
  }

  const blob = await readOfflineBlob(record.sourceId, record.storageKind);
  if (!blob || blob.size !== source.byteSize) {
    await removeRecord(record);
    return undefined;
  }
  return URL.createObjectURL(blob);
}

export async function createOfflineRecordUrl(
  record: OfflineDownloadRecord,
): Promise<string | undefined> {
  const blob = await readOfflineBlob(record.sourceId, record.storageKind);
  return blob ? URL.createObjectURL(blob) : undefined;
}

export async function removeOfflineAudiobook(
  audiobookId: string,
): Promise<void> {
  const records = await getOfflineDatabase()
    .downloads.where("audiobookId")
    .equals(audiobookId)
    .toArray();
  await Promise.all(records.map(removeRecord));
}

export async function clearOfflineDownloads(): Promise<void> {
  const records = await getOfflineDatabase().downloads.toArray();
  await Promise.all(records.map(removeRecord));
}

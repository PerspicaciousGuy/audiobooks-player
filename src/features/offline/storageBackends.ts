"use client";

import type { OfflineStorageKind } from "./database";

const AUDIO_CACHE = "quiet-library-audio-v1";
const OPFS_DIRECTORY = "quiet-library-audio-v1";

function offlineRequest(sourceId: string): Request {
  return new Request(`/offline-audio/${sourceId}`);
}

async function opfsDirectory(): Promise<FileSystemDirectoryHandle> {
  const storage = navigator.storage as unknown as {
    getDirectory?: () => Promise<FileSystemDirectoryHandle>;
  };

  if (!storage.getDirectory) throw new Error("OPFS is unavailable.");
  const root = await storage.getDirectory();
  return root.getDirectoryHandle(OPFS_DIRECTORY, { create: true });
}

export function preferredStorageKind(): OfflineStorageKind {
  const storage = navigator.storage as unknown as {
    getDirectory?: () => Promise<FileSystemDirectoryHandle>;
  };
  return storage.getDirectory ? "opfs" : "cache";
}

export async function writeOfflineResponse(
  sourceId: string,
  response: Response,
  storageKind: OfflineStorageKind,
  onBytes: (bytes: number) => void,
  signal: AbortSignal,
): Promise<void> {
  if (!response.body) throw new Error("The download response has no body.");

  if (storageKind === "cache") {
    let downloadedBytes = 0;
    const progressStream = new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
        downloadedBytes += chunk.byteLength;
        onBytes(downloadedBytes);
        controller.enqueue(chunk);
      },
    });
    const trackedResponse = new Response(
      response.body.pipeThrough(progressStream),
      {
        headers: response.headers,
        status: response.status,
      },
    );
    const cache = await caches.open(AUDIO_CACHE);
    await cache.put(offlineRequest(sourceId), trackedResponse);
    return;
  }

  const directory = await opfsDirectory();
  const fileHandle = await directory.getFileHandle(`${sourceId}.audio`, {
    create: true,
  });
  const writable = await fileHandle.createWritable();
  const reader = response.body.getReader();
  let downloadedBytes = 0;

  try {
    while (true) {
      if (signal.aborted) throw new DOMException("Cancelled", "AbortError");
      const { done, value } = await reader.read();
      if (done) break;
      await writable.write(value);
      downloadedBytes += value.byteLength;
      onBytes(downloadedBytes);
    }
    await writable.close();
  } catch (error) {
    await writable.abort(error);
    throw error;
  }
}

export async function readOfflineBlob(
  sourceId: string,
  storageKind: OfflineStorageKind,
): Promise<Blob | undefined> {
  try {
    if (storageKind === "cache") {
      const response = await (
        await caches.open(AUDIO_CACHE)
      ).match(offlineRequest(sourceId));
      return response?.blob();
    }

    const directory = await opfsDirectory();
    const handle = await directory.getFileHandle(`${sourceId}.audio`);
    return handle.getFile();
  } catch {
    return undefined;
  }
}

export async function deleteOfflineBlob(
  sourceId: string,
  storageKind: OfflineStorageKind,
): Promise<void> {
  try {
    if (storageKind === "cache") {
      await (await caches.open(AUDIO_CACHE)).delete(offlineRequest(sourceId));
      return;
    }

    const directory = await opfsDirectory();
    await directory.removeEntry(`${sourceId}.audio`);
  } catch {
    // Missing or evicted files are already effectively deleted.
  }
}

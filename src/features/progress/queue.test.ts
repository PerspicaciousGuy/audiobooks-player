import { describe, expect, it } from "vitest";

import {
  enqueueProgress,
  readProgressQueue,
  removeQueuedProgress,
} from "./queue";

function createStorage(): Storage {
  const values = new Map<string, string>();
  return {
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => [...values.keys()][index] ?? null,
    get length() {
      return values.size;
    },
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
}

const BASE_CHECKPOINT = {
  audiobookFileId: "20000000-0000-4000-8000-000000000002",
  audiobookId: "10000000-0000-4000-8000-000000000001",
  chapterId: null,
  clientUpdatedAt: "2026-07-15T12:00:00.000Z",
  expectedVersion: 1,
  isCompleted: false,
  playbackRate: 1,
  positionMs: 10_000,
};

describe("progress queue", () => {
  it("keeps only the newest checkpoint for each audiobook", () => {
    const storage = createStorage();
    enqueueProgress(storage, BASE_CHECKPOINT);
    enqueueProgress(storage, {
      ...BASE_CHECKPOINT,
      clientUpdatedAt: "2026-07-15T12:00:15.000Z",
      positionMs: 25_000,
    });

    expect(readProgressQueue(storage)).toEqual([
      expect.objectContaining({ positionMs: 25_000 }),
    ]);
  });

  it("removes an accepted checkpoint without deleting a newer queued write", () => {
    const storage = createStorage();
    enqueueProgress(storage, BASE_CHECKPOINT);
    removeQueuedProgress(
      storage,
      BASE_CHECKPOINT.audiobookId,
      "2026-07-15T11:59:00.000Z",
    );
    expect(readProgressQueue(storage)).toHaveLength(1);

    removeQueuedProgress(
      storage,
      BASE_CHECKPOINT.audiobookId,
      BASE_CHECKPOINT.clientUpdatedAt,
    );
    expect(readProgressQueue(storage)).toEqual([]);
  });
});

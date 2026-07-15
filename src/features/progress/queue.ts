import { z } from "zod";

import { progressCheckpointSchema } from "./contracts";

const STORAGE_KEY = "quiet-library:pending-progress:v1";
const MAX_QUEUE_ITEMS = 20;

const queuedProgressSchema = progressCheckpointSchema.extend({
  audiobookId: z.string().uuid(),
});
const queueSchema = z.array(queuedProgressSchema);

export type QueuedProgress = z.infer<typeof queuedProgressSchema>;

export function readProgressQueue(storage: Storage): QueuedProgress[] {
  try {
    const value = storage.getItem(STORAGE_KEY);
    return value ? queueSchema.parse(JSON.parse(value)) : [];
  } catch {
    storage.removeItem(STORAGE_KEY);
    return [];
  }
}

export function enqueueProgress(
  storage: Storage,
  checkpoint: QueuedProgress,
): void {
  const validated = queuedProgressSchema.parse(checkpoint);
  const nextQueue = [
    ...readProgressQueue(storage).filter(
      ({ audiobookId }) => audiobookId !== validated.audiobookId,
    ),
    validated,
  ]
    .toSorted((left, right) =>
      left.clientUpdatedAt.localeCompare(right.clientUpdatedAt),
    )
    .slice(-MAX_QUEUE_ITEMS);
  storage.setItem(STORAGE_KEY, JSON.stringify(nextQueue));
}

export function removeQueuedProgress(
  storage: Storage,
  audiobookId: string,
  throughClientUpdatedAt: string,
): void {
  const nextQueue = readProgressQueue(storage).filter(
    (checkpoint) =>
      checkpoint.audiobookId !== audiobookId ||
      checkpoint.clientUpdatedAt > throughClientUpdatedAt,
  );

  if (nextQueue.length === 0) storage.removeItem(STORAGE_KEY);
  else storage.setItem(STORAGE_KEY, JSON.stringify(nextQueue));
}

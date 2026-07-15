import { z } from "zod";

export const progressCheckpointSchema = z.object({
  audiobookFileId: z.string().uuid(),
  chapterId: z.string().uuid().nullable().default(null),
  clientUpdatedAt: z.string().datetime(),
  expectedVersion: z.number().int().positive().nullable().default(null),
  isCompleted: z.boolean().default(false),
  playbackRate: z.number().min(0.5).max(3),
  positionMs: z.number().int().nonnegative(),
});

export const savedProgressSchema = z.object({
  accepted: z.boolean(),
  audiobookFileId: z.string().uuid().nullable(),
  chapterId: z.string().uuid().nullable(),
  clientUpdatedAt: z.string().datetime(),
  isCompleted: z.boolean(),
  playbackRate: z.coerce.number(),
  positionMs: z.coerce.number().int().nonnegative(),
  version: z.coerce.number().int().positive(),
});

export type ProgressCheckpoint = z.infer<typeof progressCheckpointSchema>;
export type SavedProgress = z.infer<typeof savedProgressSchema>;

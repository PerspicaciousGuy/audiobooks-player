import { z } from "zod";

export const createBookmarkSchema = z.object({
  audiobookFileId: z.string().uuid(),
  chapterId: z.string().uuid().nullable().default(null),
  note: z.string().trim().max(2000).nullable().default(null),
  positionMs: z.number().int().nonnegative(),
});

import { z } from "zod";

const cursorSchema = z.object({
  id: z.string().uuid(),
  updatedAt: z.string().datetime(),
});

export const libraryQuerySchema = z.object({
  cursor: z.string().max(500).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const updateAudiobookSchema = z
  .object({
    author: z.string().trim().max(300).nullable().optional(),
    description: z.string().trim().max(10_000).nullable().optional(),
    narrator: z.string().trim().max(300).nullable().optional(),
    title: z.string().trim().min(1).max(300).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, {
    message: "At least one field is required.",
  });

export type LibraryCursor = z.infer<typeof cursorSchema>;

export function encodeLibraryCursor(cursor: LibraryCursor): string {
  return Buffer.from(JSON.stringify(cursor), "utf8").toString("base64url");
}

export function decodeLibraryCursor(
  cursor: string | undefined,
): LibraryCursor | undefined {
  if (!cursor) return undefined;

  try {
    return cursorSchema.parse(
      JSON.parse(Buffer.from(cursor, "base64url").toString("utf8")),
    );
  } catch {
    return undefined;
  }
}

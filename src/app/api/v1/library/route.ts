import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  decodeLibraryCursor,
  encodeLibraryCursor,
  libraryQuerySchema,
} from "@/features/library/contracts";
import {
  audiobookFileRowSchema,
  audiobookRowSchema,
  mapAudiobook,
  progressRowSchema,
} from "@/features/library/mapper";
import { problemResponse } from "@/lib/api/problem";
import { authorizeRateLimitedRequest } from "@/lib/security/apiAccess";

const libraryRowSchema = audiobookRowSchema.extend({
  updated_at: z.string().datetime(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  const access = await authorizeRateLimitedRequest("library_read");

  if (access.response) return access.response;

  const parsed = libraryQuerySchema.safeParse({
    cursor: request.nextUrl.searchParams.get("cursor") ?? undefined,
    limit: request.nextUrl.searchParams.get("limit") ?? undefined,
  });

  if (!parsed.success) {
    return problemResponse("Invalid library query.", 400);
  }

  const cursor = decodeLibraryCursor(parsed.data.cursor);

  if (parsed.data.cursor && !cursor) {
    return problemResponse("Invalid library cursor.", 400);
  }

  let query = access.supabase
    .from("audiobooks")
    .select(
      "id, title, author, narrator, description, total_duration_ms, updated_at",
    )
    .order("updated_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(parsed.data.limit + 1);

  if (cursor) {
    query = query.or(
      `updated_at.lt.${cursor.updatedAt},and(updated_at.eq.${cursor.updatedAt},id.lt.${cursor.id})`,
    );
  }

  const { data, error } = await query;

  if (error) {
    return problemResponse("The library could not be loaded.", 500);
  }

  const pageRows = libraryRowSchema.array().parse(data ?? []);
  const hasNextPage = pageRows.length > parsed.data.limit;
  const rows = pageRows.slice(0, parsed.data.limit);
  const audiobookIds = rows.map(({ id }) => id);
  const [filesResult, progressResult] = await Promise.all([
    audiobookIds.length
      ? access.supabase
          .from("audiobook_files")
          .select(
            "id, audiobook_id, file_name, mime_type, byte_size, drive_version, duration_ms, sequence",
          )
          .in("audiobook_id", audiobookIds)
      : Promise.resolve({ data: [], error: null }),
    audiobookIds.length
      ? access.supabase
          .from("playback_progress")
          .select(
            "audiobook_id, audiobook_file_id, chapter_id, position_ms, playback_rate, is_completed, client_updated_at, version",
          )
          .in("audiobook_id", audiobookIds)
      : Promise.resolve({ data: [], error: null }),
  ]);

  if (filesResult.error || progressResult.error) {
    return problemResponse("The library details could not be loaded.", 500);
  }

  const files = audiobookFileRowSchema.array().parse(filesResult.data ?? []);
  const progress = progressRowSchema.array().parse(progressResult.data ?? []);
  const items = rows.map((row) =>
    mapAudiobook(
      row,
      files.filter((file) => file.audiobook_id === row.id),
      progress.find((checkpoint) => checkpoint.audiobook_id === row.id),
    ),
  );
  const lastRow = rows.at(-1);

  return NextResponse.json(
    {
      items,
      nextCursor:
        hasNextPage && lastRow
          ? encodeLibraryCursor({
              id: lastRow.id,
              updatedAt: lastRow.updated_at,
            })
          : null,
    },
    { headers: { "cache-control": "no-store, private" } },
  );
}

import "server-only";

import { cache } from "react";

import {
  audiobookFileRowSchema,
  audiobookRowSchema,
  bookmarkRowSchema,
  chapterRowSchema,
  mapAudiobook,
  progressRowSchema,
} from "./mapper";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Audiobook } from "@/types/audiobook";

export async function getOwnedAudiobooks(): Promise<Audiobook[] | undefined> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) return undefined;

  const { data: bookData, error: bookError } = await supabase
    .from("audiobooks")
    .select("id, title, author, narrator, description, total_duration_ms")
    .order("updated_at", { ascending: false });

  if (bookError) throw new Error("Unable to load the audiobook library.");
  const books = audiobookRowSchema.array().parse(bookData ?? []);
  const bookIds = books.map(({ id }) => id);

  if (bookIds.length === 0) return [];

  const [filesResult, progressResult] = await Promise.all([
    supabase
      .from("audiobook_files")
      .select("id, audiobook_id, file_name, mime_type, duration_ms, sequence")
      .in("audiobook_id", bookIds),
    supabase
      .from("playback_progress")
      .select(
        "audiobook_id, audiobook_file_id, chapter_id, position_ms, playback_rate, is_completed, client_updated_at, version",
      )
      .in("audiobook_id", bookIds),
  ]);

  if (filesResult.error || progressResult.error) {
    throw new Error("Unable to load audiobook details.");
  }

  const files = audiobookFileRowSchema.array().parse(filesResult.data ?? []);
  const progress = progressRowSchema.array().parse(progressResult.data ?? []);

  return books.map((book) =>
    mapAudiobook(
      book,
      files.filter(({ audiobook_id }) => audiobook_id === book.id),
      progress.find(({ audiobook_id }) => audiobook_id === book.id),
    ),
  );
}

export const getOwnedAudiobook = cache(
  async (audiobookId: string): Promise<Audiobook | null | undefined> => {
    const supabase = await createServerSupabaseClient();

    if (!supabase) return undefined;

    const { data: bookData, error: bookError } = await supabase
      .from("audiobooks")
      .select("id, title, author, narrator, description, total_duration_ms")
      .eq("id", audiobookId)
      .maybeSingle();

    if (bookError) throw new Error("Unable to load the audiobook.");
    if (!bookData) return null;

    const [filesResult, progressResult, chaptersResult, bookmarksResult] =
      await Promise.all([
        supabase
          .from("audiobook_files")
          .select(
            "id, audiobook_id, file_name, mime_type, duration_ms, sequence",
          )
          .eq("audiobook_id", audiobookId),
        supabase
          .from("playback_progress")
          .select(
            "audiobook_id, audiobook_file_id, chapter_id, position_ms, playback_rate, is_completed, client_updated_at, version",
          )
          .eq("audiobook_id", audiobookId)
          .maybeSingle(),
        supabase
          .from("chapters")
          .select("id, audiobook_file_id, title, start_ms, end_ms")
          .eq("audiobook_id", audiobookId)
          .order("sequence"),
        supabase
          .from("bookmarks")
          .select("id, chapter_id, position_ms, note")
          .eq("audiobook_id", audiobookId)
          .order("position_ms"),
      ]);

    if (
      filesResult.error ||
      progressResult.error ||
      chaptersResult.error ||
      bookmarksResult.error
    ) {
      throw new Error("Unable to load audiobook details.");
    }

    return mapAudiobook(
      audiobookRowSchema.parse(bookData),
      audiobookFileRowSchema.array().parse(filesResult.data ?? []),
      progressResult.data
        ? progressRowSchema.parse(progressResult.data)
        : undefined,
      chapterRowSchema.array().parse(chaptersResult.data ?? []),
      bookmarkRowSchema.array().parse(bookmarksResult.data ?? []),
    );
  },
);

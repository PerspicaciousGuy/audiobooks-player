import { z } from "zod";

import type {
  Audiobook,
  AudioSource,
  Bookmark,
  Chapter,
  CoverTone,
} from "@/types/audiobook";

export const audiobookRowSchema = z.object({
  author: z.string().nullable(),
  description: z.string().nullable(),
  id: z.string().uuid(),
  narrator: z.string().nullable(),
  title: z.string(),
  total_duration_ms: z.number().nullable(),
});

export const audiobookFileRowSchema = z.object({
  audiobook_id: z.string().uuid(),
  byte_size: z.coerce.number().int().positive(),
  duration_ms: z.number().nullable(),
  drive_version: z.string().nullable(),
  file_name: z.string(),
  id: z.string().uuid(),
  mime_type: z.string(),
  sequence: z.number(),
});

export const progressRowSchema = z.object({
  audiobook_id: z.string().uuid(),
  audiobook_file_id: z.string().uuid().nullable(),
  chapter_id: z.string().uuid().nullable(),
  client_updated_at: z.string().datetime(),
  is_completed: z.boolean(),
  playback_rate: z.coerce.number(),
  position_ms: z.number(),
  version: z.coerce.number().int().positive(),
});

export const chapterRowSchema = z.object({
  audiobook_file_id: z.string().uuid().nullable(),
  end_ms: z.number().nullable(),
  id: z.string().uuid(),
  start_ms: z.number(),
  title: z.string(),
});

export const bookmarkRowSchema = z.object({
  chapter_id: z.string().uuid().nullable(),
  id: z.string().uuid(),
  note: z.string().nullable(),
  position_ms: z.number(),
});

type AudiobookRow = z.infer<typeof audiobookRowSchema>;
type AudiobookFileRow = z.infer<typeof audiobookFileRowSchema>;
type ProgressRow = z.infer<typeof progressRowSchema>;
type ChapterRow = z.infer<typeof chapterRowSchema>;
type BookmarkRow = z.infer<typeof bookmarkRowSchema>;

const COVER_TONES: CoverTone[] = [
  "amber",
  "forest",
  "ink",
  "plum",
  "rose",
  "sky",
];

function durationLabel(milliseconds: number | null): string {
  if (!milliseconds) return "Duration pending";
  const totalMinutes = Math.round(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return hours > 0 ? `${hours} hr ${minutes} min` : `${minutes} min`;
}

function timestampLabel(milliseconds: number): string {
  const totalSeconds = Math.floor(milliseconds / 1_000);
  const hours = Math.floor(totalSeconds / 3_600);
  const minutes = Math.floor((totalSeconds % 3_600) / 60);
  const seconds = totalSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`
    : `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function coverTone(id: string): CoverTone {
  const index = [...id].reduce(
    (sum, character) => sum + character.charCodeAt(0),
    0,
  );
  return COVER_TONES[index % COVER_TONES.length] ?? "ink";
}

function formatLabel(files: AudiobookFileRow[]): string {
  const extension = files[0]?.file_name.split(".").pop()?.toUpperCase();
  return extension ?? "Audio";
}

export function mapAudiobook(
  row: AudiobookRow,
  files: AudiobookFileRow[],
  progress?: ProgressRow,
  chapterRows: ChapterRow[] = [],
  bookmarkRows: BookmarkRow[] = [],
): Audiobook {
  const progressPercent = progress?.is_completed
    ? 100
    : row.total_duration_ms && progress
      ? Math.min(
          99,
          Math.round((progress.position_ms / row.total_duration_ms) * 100),
        )
      : 0;
  const chapters: Chapter[] = chapterRows.map((chapter) => ({
    ...(chapter.audiobook_file_id
      ? { audiobookFileId: chapter.audiobook_file_id }
      : {}),
    duration: durationLabel(
      chapter.end_ms ? chapter.end_ms - chapter.start_ms : null,
    ),
    ...(chapter.end_ms ? { endMs: chapter.end_ms } : {}),
    id: chapter.id,
    isCurrent: false,
    startTime: timestampLabel(chapter.start_ms),
    startMs: chapter.start_ms,
    title: chapter.title,
  }));
  const chapterTitles = new Map(
    chapterRows.map((chapter) => [chapter.id, chapter.title]),
  );
  const bookmarks: Bookmark[] = bookmarkRows.map((bookmark) => ({
    chapterTitle: bookmark.chapter_id
      ? (chapterTitles.get(bookmark.chapter_id) ?? "Audiobook")
      : "Audiobook",
    id: bookmark.id,
    label: bookmark.note ?? "Saved moment",
    timestamp: timestampLabel(bookmark.position_ms),
  }));
  const sources: AudioSource[] = files
    .toSorted((left, right) => left.sequence - right.sequence)
    .map((file) => ({
      byteSize: file.byte_size,
      driveVersion: file.drive_version,
      durationMs: file.duration_ms,
      id: file.id,
      mimeType: file.mime_type,
      name: file.file_name,
      sequence: file.sequence,
    }));

  return {
    author: row.author ?? "Unknown author",
    bookmarks,
    chapters,
    coverTone: coverTone(row.id),
    currentChapter: chapters[0]?.title ?? "Start",
    description:
      row.description ??
      "An audiobook selected from your private Google Drive.",
    duration: durationLabel(row.total_duration_ms),
    fileCount: files.length,
    format: formatLabel(files),
    id: row.id,
    isDownloaded: false,
    narrator: row.narrator ?? "Unknown narrator",
    progressLabel:
      progressPercent === 100
        ? "Finished"
        : progressPercent > 0
          ? `${progressPercent}% listened`
          : "Not started",
    progressPercent,
    sources,
    title: row.title,
    ...(progress
      ? {
          resume: {
            audiobookFileId: progress.audiobook_file_id,
            chapterId: progress.chapter_id,
            clientUpdatedAt: progress.client_updated_at,
            playbackRate: progress.playback_rate,
            positionMs: progress.position_ms,
            version: progress.version,
          },
        }
      : {}),
  };
}

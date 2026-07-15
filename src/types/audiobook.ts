export type CoverTone = "amber" | "forest" | "ink" | "plum" | "rose" | "sky";

export interface Chapter {
  audiobookFileId?: string;
  id: string;
  title: string;
  duration: string;
  endMs?: number;
  startTime: string;
  isCurrent: boolean;
  startMs?: number;
}

export interface AudioSource {
  durationMs: number | null;
  id: string;
  mimeType: string;
  name: string;
  sequence: number;
}

export interface Bookmark {
  id: string;
  label: string;
  chapterTitle: string;
  timestamp: string;
}

export interface Audiobook {
  id: string;
  title: string;
  author: string;
  narrator: string;
  description: string;
  coverTone: CoverTone;
  progressPercent: number;
  progressLabel: string;
  duration: string;
  currentChapter: string;
  fileCount: number;
  format: string;
  isDownloaded: boolean;
  chapters: readonly Chapter[];
  bookmarks: readonly Bookmark[];
  sources?: readonly AudioSource[];
}

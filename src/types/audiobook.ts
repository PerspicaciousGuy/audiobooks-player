export type CoverTone = "amber" | "forest" | "ink" | "plum" | "rose" | "sky";

export interface Chapter {
  id: string;
  title: string;
  duration: string;
  startTime: string;
  isCurrent: boolean;
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
}

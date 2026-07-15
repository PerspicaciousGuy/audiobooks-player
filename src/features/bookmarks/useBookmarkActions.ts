"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { Audiobook } from "@/types/audiobook";

interface BookmarkSnapshot {
  audiobook: Audiobook | undefined;
  currentTime: number;
  sourceId: string | undefined;
}

export function useBookmarkActions(snapshot: BookmarkSnapshot): {
  addBookmark: () => Promise<void>;
  bookmarkStatus: string | undefined;
} {
  const router = useRouter();
  const [bookmarkStatus, setBookmarkStatus] = useState<string>();

  useEffect(() => {
    if (!bookmarkStatus) return;
    const timeout = window.setTimeout(
      () => setBookmarkStatus(undefined),
      4_000,
    );
    return () => window.clearTimeout(timeout);
  }, [bookmarkStatus]);

  const addBookmark = useCallback(async () => {
    const { audiobook, currentTime, sourceId } = snapshot;

    if (!audiobook || !sourceId) {
      setBookmarkStatus("Start playback before adding a bookmark.");
      return;
    }

    const chapter = audiobook.chapters.findLast(
      (candidate) =>
        candidate.audiobookFileId === sourceId &&
        candidate.startMs !== undefined &&
        currentTime * 1_000 >= candidate.startMs,
    );

    try {
      const response = await fetch(
        `/api/v1/audiobooks/${audiobook.id}/bookmarks`,
        {
          body: JSON.stringify({
            audiobookFileId: sourceId,
            chapterId: chapter?.id ?? null,
            note: null,
            positionMs: Math.round(currentTime * 1_000),
          }),
          headers: { "content-type": "application/json" },
          method: "POST",
        },
      );

      if (!response.ok) throw new Error("Bookmark request failed.");
      setBookmarkStatus("Bookmark saved.");
      router.refresh();
    } catch {
      setBookmarkStatus("Bookmark could not be saved.");
    }
  }, [router, snapshot]);

  return { addBookmark, bookmarkStatus };
}

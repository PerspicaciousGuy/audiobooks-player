"use client";

import Icon from "@/components/ui/Icon";
import { usePlayer } from "@/features/player/context";
import type { Audiobook, Chapter } from "@/types/audiobook";

interface ChapterListProps {
  audiobook: Audiobook;
}

function isActiveChapter(
  chapter: Chapter,
  currentSourceId: string | undefined,
  currentTime: number,
): boolean {
  if (
    chapter.audiobookFileId !== currentSourceId ||
    chapter.startMs === undefined
  ) {
    return false;
  }

  const milliseconds = currentTime * 1_000;
  return (
    milliseconds >= chapter.startMs &&
    (chapter.endMs === undefined || milliseconds < chapter.endMs)
  );
}

export default function ChapterList({ audiobook }: ChapterListProps) {
  const player = usePlayer();
  const { chapters } = audiobook;

  if (chapters.length === 0) {
    return (
      <p className="text-ink-muted rounded-card bg-surface-muted p-5 text-sm">
        No embedded chapter markers were detected. Playback will continue as a
        single track.
      </p>
    );
  }

  return (
    <ol className="divide-border border-border bg-paper-elevated rounded-card divide-y border">
      {chapters.map((chapter) => {
        const isCurrent =
          player.audiobook?.id === audiobook.id &&
          isActiveChapter(chapter, player.currentSourceId, player.currentTime);

        return (
          <li
            className={isCurrent ? "bg-action-soft/60" : undefined}
            key={chapter.id}
          >
            <button
              aria-current={isCurrent ? "true" : undefined}
              className="focus-visible:ring-focus flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left focus-visible:ring-2 focus-visible:outline-none sm:px-5"
              onClick={() => player.playChapter(audiobook, chapter)}
              type="button"
            >
              <span
                className={
                  isCurrent
                    ? "bg-action text-paper-elevated grid size-9 shrink-0 place-items-center rounded-full"
                    : "bg-surface-muted text-ink-muted grid size-9 shrink-0 place-items-center rounded-full"
                }
              >
                <Icon className="size-4" name={isCurrent ? "pause" : "play"} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">
                  {chapter.title}
                </span>
                <span className="text-ink-muted text-xs">
                  {chapter.startTime}
                </span>
              </span>
              <span className="text-ink-muted text-xs">{chapter.duration}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

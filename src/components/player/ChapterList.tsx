import Icon from "@/components/ui/Icon";
import type { Chapter } from "@/types/audiobook";

interface ChapterListProps {
  chapters: readonly Chapter[];
}

export default function ChapterList({ chapters }: ChapterListProps) {
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
      {chapters.map((chapter) => (
        <li
          className={chapter.isCurrent ? "bg-action-soft/60" : undefined}
          key={chapter.id}
        >
          <button
            aria-current={chapter.isCurrent ? "true" : undefined}
            className="focus-visible:ring-focus flex min-h-16 w-full items-center gap-4 px-4 py-3 text-left focus-visible:ring-2 focus-visible:outline-none sm:px-5"
            type="button"
          >
            <span
              className={
                chapter.isCurrent
                  ? "bg-action text-paper-elevated grid size-9 shrink-0 place-items-center rounded-full"
                  : "bg-surface-muted text-ink-muted grid size-9 shrink-0 place-items-center rounded-full"
              }
            >
              <Icon
                className="size-4"
                name={chapter.isCurrent ? "pause" : "play"}
              />
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
      ))}
    </ol>
  );
}

import BookCover from "@/components/library/BookCover";
import Icon from "@/components/ui/Icon";
import { CURRENT_AUDIOBOOK } from "@/lib/mock/library";

export default function NowPlayingBar() {
  return (
    <section
      aria-label="Now playing"
      className="border-border bg-player/95 shadow-player fixed right-0 bottom-20 left-0 z-30 border-t px-4 py-3 backdrop-blur lg:bottom-0 lg:left-72 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 lg:gap-6">
        <BookCover
          author={CURRENT_AUDIOBOOK.author}
          size="mini"
          title={CURRENT_AUDIOBOOK.title}
          tone={CURRENT_AUDIOBOOK.coverTone}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {CURRENT_AUDIOBOOK.title}
          </p>
          <p className="text-ink-muted truncate text-xs">
            {CURRENT_AUDIOBOOK.currentChapter}
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            aria-label="Rewind 15 seconds"
            className="hover:bg-surface-muted focus-visible:ring-focus grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-5" name="rewind" />
          </button>
          <button
            aria-label="Pause The Left Hand of Darkness"
            className="bg-ink text-paper-elevated hover:bg-action-strong focus-visible:ring-focus grid size-12 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-5" name="pause" />
          </button>
          <button
            aria-label="Forward 30 seconds"
            className="hover:bg-surface-muted focus-visible:ring-focus grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-5 rotate-180" name="rewind" />
          </button>
        </div>
        <div className="hidden min-w-40 flex-1 items-center gap-3 lg:flex">
          <span className="text-ink-muted text-xs">34:12</span>
          <div
            aria-label="42% played"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={42}
            className="bg-border h-1.5 flex-1 overflow-hidden rounded-full"
            role="progressbar"
          >
            <div className="bg-action h-full w-2/5 rounded-full" />
          </div>
          <span className="text-ink-muted text-xs">51:08</span>
        </div>
        <button
          aria-label="Play The Left Hand of Darkness"
          className="bg-ink text-paper-elevated focus-visible:ring-focus grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none sm:hidden"
          type="button"
        >
          <Icon className="size-5" name="play" />
        </button>
      </div>
    </section>
  );
}

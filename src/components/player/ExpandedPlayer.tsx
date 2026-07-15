import BookCover from "@/components/library/BookCover";
import Icon from "@/components/ui/Icon";
import type { Audiobook } from "@/types/audiobook";

interface ExpandedPlayerProps {
  audiobook: Audiobook;
}

export default function ExpandedPlayer({ audiobook }: ExpandedPlayerProps) {
  return (
    <section className="bg-ink text-paper-elevated rounded-panel shadow-card grid overflow-hidden lg:grid-cols-[auto_1fr]">
      <div className="bg-paper-elevated/5 flex items-center justify-center p-8 lg:p-12">
        <div className="w-48 sm:w-56">
          <BookCover
            author={audiobook.author}
            size="hero"
            title={audiobook.title}
            tone={audiobook.coverTone}
          />
        </div>
      </div>
      <div className="flex flex-col justify-center gap-7 p-6 sm:p-10 lg:p-12">
        <div className="flex flex-col gap-2 text-center lg:text-left">
          <p className="text-action text-xs font-bold tracking-widest uppercase">
            Now playing
          </p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {audiobook.title}
          </h2>
          <p className="text-paper-elevated/60 text-sm">
            {audiobook.currentChapter}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <input
            aria-label="Playback position"
            className="accent-action h-2 w-full cursor-pointer"
            defaultValue={audiobook.progressPercent}
            max={100}
            min={0}
            type="range"
          />
          <div className="text-paper-elevated/55 flex justify-between text-xs">
            <span>34:12</span>
            <span>-16:56</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-5">
          <button
            aria-label="Set sleep timer"
            className="hover:bg-paper-elevated/10 focus-visible:ring-action grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-5" name="timer" />
          </button>
          <button
            aria-label="Rewind 15 seconds"
            className="hover:bg-paper-elevated/10 focus-visible:ring-action grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-5" name="rewind" />
          </button>
          <button
            aria-label={`Play ${audiobook.title}`}
            className="bg-action text-paper-elevated hover:bg-action-strong focus-visible:ring-paper-elevated grid size-16 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-7" name="play" />
          </button>
          <button
            aria-label="Forward 30 seconds"
            className="hover:bg-paper-elevated/10 focus-visible:ring-action grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-5 rotate-180" name="rewind" />
          </button>
          <button
            aria-label="Add bookmark"
            className="hover:bg-paper-elevated/10 focus-visible:ring-action grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none"
            type="button"
          >
            <Icon className="size-5" name="bookmark" />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <button
            className="border-paper-elevated/20 min-h-11 rounded-full border px-4 text-xs font-bold"
            type="button"
          >
            1× speed
          </button>
          <button
            className="border-paper-elevated/20 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold"
            type="button"
          >
            <Icon className="size-4" name="clock" />
            Sleep timer
          </button>
          <button
            className="border-paper-elevated/20 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold"
            type="button"
          >
            <Icon className="size-4" name="library" />
            Chapters
          </button>
        </div>
      </div>
    </section>
  );
}

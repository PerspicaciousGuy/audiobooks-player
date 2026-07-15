"use client";

import BookCover from "@/components/library/BookCover";
import Icon from "@/components/ui/Icon";
import { formatPlayerTime, usePlayer } from "@/features/player/context";
import { CURRENT_AUDIOBOOK } from "@/lib/mock/library";

export default function NowPlayingBar() {
  const player = usePlayer();
  const audiobook = player.audiobook ?? CURRENT_AUDIOBOOK;
  const isActive = Boolean(player.audiobook);
  const progress =
    player.duration > 0 ? (player.currentTime / player.duration) * 100 : 0;

  return (
    <section
      aria-label="Now playing"
      className="border-border bg-player/95 shadow-player fixed right-0 bottom-20 left-0 z-30 border-t px-4 py-3 backdrop-blur lg:bottom-0 lg:left-72 lg:px-8"
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 lg:gap-6">
        <BookCover
          author={audiobook.author}
          size="mini"
          title={audiobook.title}
          tone={audiobook.coverTone}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{audiobook.title}</p>
          <p className="text-ink-muted truncate text-xs">
            {isActive ? audiobook.currentChapter : "Player ready"}
          </p>
        </div>
        <div className="hidden items-center gap-2 sm:flex">
          <button
            aria-label="Rewind 15 seconds"
            className="hover:bg-surface-muted focus-visible:ring-focus grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
            disabled={!isActive}
            onClick={() => player.skip(-15)}
            type="button"
          >
            <Icon className="size-5" name="rewind" />
          </button>
          <button
            aria-label={`${player.isPlaying ? "Pause" : "Play"} ${audiobook.title}`}
            className="bg-ink text-paper-elevated hover:bg-action-strong focus-visible:ring-focus grid size-12 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
            disabled={!isActive}
            onClick={player.togglePlayback}
            type="button"
          >
            <Icon
              className="size-5"
              name={player.isPlaying ? "pause" : "play"}
            />
          </button>
          <button
            aria-label="Forward 30 seconds"
            className="hover:bg-surface-muted focus-visible:ring-focus grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
            disabled={!isActive}
            onClick={() => player.skip(30)}
            type="button"
          >
            <Icon className="size-5 rotate-180" name="rewind" />
          </button>
        </div>
        <div className="hidden min-w-40 flex-1 items-center gap-3 lg:flex">
          <span className="text-ink-muted text-xs">
            {formatPlayerTime(player.currentTime)}
          </span>
          <div
            aria-label={`${Math.round(progress)}% played`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={Math.round(progress)}
            className="bg-border h-1.5 flex-1 overflow-hidden rounded-full"
            role="progressbar"
          >
            <div
              className="bg-action h-full rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-ink-muted text-xs">
            {formatPlayerTime(player.duration)}
          </span>
        </div>
        <button
          aria-label={`${player.isPlaying ? "Pause" : "Play"} ${audiobook.title}`}
          className="bg-ink text-paper-elevated focus-visible:ring-focus grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40 sm:hidden"
          disabled={!isActive}
          onClick={player.togglePlayback}
          type="button"
        >
          <Icon className="size-5" name={player.isPlaying ? "pause" : "play"} />
        </button>
      </div>
    </section>
  );
}

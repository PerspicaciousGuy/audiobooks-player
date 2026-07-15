"use client";

import BookCover from "@/components/library/BookCover";
import Icon from "@/components/ui/Icon";
import { formatPlayerTime, usePlayer } from "@/features/player/context";
import type { Audiobook } from "@/types/audiobook";

interface ExpandedPlayerProps {
  audiobook: Audiobook;
}

const SLEEP_LABELS = {
  "15": "15 minutes",
  "30": "30 minutes",
  "60": "60 minutes",
  chapter: "End of chapter",
  off: "Sleep timer",
} as const;

export default function ExpandedPlayer({ audiobook }: ExpandedPlayerProps) {
  const player = usePlayer();
  const isActive = player.audiobook?.id === audiobook.id;
  const hasSource = Boolean(audiobook.sources?.length);
  const position = isActive ? player.currentTime : audiobook.progressPercent;
  const maximum = isActive && player.duration > 0 ? player.duration : 100;

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
            {isActive && player.isPlaying ? "Now playing" : "Ready to play"}
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
            className="accent-action h-2 w-full cursor-pointer disabled:cursor-not-allowed"
            disabled={!isActive}
            max={maximum}
            min={0}
            onChange={(event) => player.seek(event.currentTarget.valueAsNumber)}
            type="range"
            value={Math.min(position, maximum)}
          />
          <div className="text-paper-elevated/55 flex justify-between text-xs">
            <span>
              {isActive ? formatPlayerTime(player.currentTime) : "0:00"}
            </span>
            <span>
              {isActive
                ? formatPlayerTime(player.duration)
                : audiobook.duration}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 sm:gap-5">
          <button
            aria-label="Rewind 15 seconds"
            className="hover:bg-paper-elevated/10 focus-visible:ring-action grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
            disabled={!isActive}
            onClick={() => player.skip(-15)}
            type="button"
          >
            <Icon className="size-5" name="rewind" />
          </button>
          <button
            aria-label={`${isActive && player.isPlaying ? "Pause" : "Play"} ${audiobook.title}`}
            className="bg-action text-paper-elevated hover:bg-action-strong focus-visible:ring-paper-elevated grid size-16 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
            disabled={!hasSource}
            onClick={() =>
              isActive
                ? player.togglePlayback()
                : player.playAudiobook(audiobook)
            }
            type="button"
          >
            <Icon
              className="size-7"
              name={isActive && player.isPlaying ? "pause" : "play"}
            />
          </button>
          <button
            aria-label="Forward 30 seconds"
            className="hover:bg-paper-elevated/10 focus-visible:ring-action grid size-11 place-items-center rounded-full focus-visible:ring-2 focus-visible:outline-none disabled:opacity-40"
            disabled={!isActive}
            onClick={() => player.skip(30)}
            type="button"
          >
            <Icon className="size-5 rotate-180" name="rewind" />
          </button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
          <button
            className="border-paper-elevated/20 min-h-11 rounded-full border px-4 text-xs font-bold"
            onClick={player.cyclePlaybackRate}
            type="button"
          >
            {player.playbackRate}× speed
          </button>
          <button
            className="border-paper-elevated/20 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold"
            onClick={player.cycleSleepMode}
            type="button"
          >
            <Icon className="size-4" name="clock" />
            {SLEEP_LABELS[player.sleepMode]}
          </button>
          <label className="border-paper-elevated/20 inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-bold">
            Volume
            <input
              aria-label="Volume"
              className="accent-action w-20"
              max={1}
              min={0}
              onChange={(event) =>
                player.setVolume(event.currentTarget.valueAsNumber)
              }
              step={0.05}
              type="range"
              value={player.volume}
            />
          </label>
        </div>
        {!hasSource ? (
          <p className="text-action text-sm" role="status">
            Connect Drive and import this book to enable playback.
          </p>
        ) : isActive && player.error ? (
          <p className="text-action text-sm" role="alert">
            {player.error}
          </p>
        ) : null}
      </div>
    </section>
  );
}

// @vitest-environment jsdom

import { createRef } from "react";
import { fireEvent, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Audiobook } from "@/types/audiobook";

import PlayerAudio from "./PlayerAudio";

const SOURCE_ID = "20000000-0000-0000-0000-000000000002";
const AUDIOBOOK: Audiobook = {
  author: "Ursula K. Le Guin",
  bookmarks: [],
  chapters: [
    {
      audiobookFileId: SOURCE_ID,
      duration: "30 sec",
      endMs: 30_000,
      id: "30000000-0000-0000-0000-000000000003",
      isCurrent: true,
      startMs: 0,
      startTime: "00:00",
      title: "Opening",
    },
  ],
  coverTone: "sky",
  currentChapter: "Opening",
  description: "A test audiobook.",
  duration: "1 min",
  fileCount: 2,
  format: "MP3",
  id: "10000000-0000-0000-0000-000000000001",
  isDownloaded: false,
  narrator: "Narrator",
  progressLabel: "Not started",
  progressPercent: 0,
  title: "The Dispossessed",
};

function renderAudio(
  overrides: {
    hasNextSource?: boolean;
    sleepMode?: "chapter" | "off";
  } = {},
) {
  const audioRef = createRef<HTMLAudioElement>();
  const callbacks = {
    onAdvanceSource: vi.fn(),
    onCurrentTime: vi.fn(),
    onDuration: vi.fn(),
    onError: vi.fn(),
    onPlaying: vi.fn(),
    onSleepComplete: vi.fn(),
    onSourceEnded: vi.fn(),
  };
  const pendingSeekRef = { current: 12 };
  const shouldAutoplayRef = { current: true };
  const result = render(
    <PlayerAudio
      audioRef={audioRef}
      audiobook={AUDIOBOOK}
      hasNextSource={overrides.hasNextSource ?? false}
      {...callbacks}
      pendingSeekRef={pendingSeekRef}
      playbackRate={1.5}
      shouldAutoplayRef={shouldAutoplayRef}
      sleepMode={overrides.sleepMode ?? "off"}
      sourceId={SOURCE_ID}
      volume={0.75}
    />,
  );
  const audio = result.container.querySelector("audio");
  if (!audio) throw new Error("PlayerAudio must render one audio element.");
  return { audio, callbacks, pendingSeekRef, shouldAutoplayRef };
}

afterEach(() => vi.restoreAllMocks());

describe("PlayerAudio", () => {
  it("applies pending playback state when the source can play", () => {
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue();
    const { audio, pendingSeekRef, shouldAutoplayRef } = renderAudio();

    fireEvent.canPlay(audio);

    expect(audio.currentTime).toBe(12);
    expect(audio.playbackRate).toBe(1.5);
    expect(audio.volume).toBe(0.75);
    expect(play).toHaveBeenCalledOnce();
    expect(pendingSeekRef.current).toBeNull();
    expect(shouldAutoplayRef.current).toBe(false);

    audio.currentTime = 15;
    fireEvent.canPlay(audio);

    expect(audio.currentTime).toBe(15);
    expect(play).toHaveBeenCalledOnce();
  });

  it("pauses and clears an end-of-chapter sleep timer", () => {
    const pause = vi
      .spyOn(HTMLMediaElement.prototype, "pause")
      .mockImplementation(() => undefined);
    const { audio, callbacks } = renderAudio({ sleepMode: "chapter" });
    audio.currentTime = 30;

    fireEvent.timeUpdate(audio);

    expect(pause).toHaveBeenCalledOnce();
    expect(callbacks.onSleepComplete).toHaveBeenCalledOnce();
  });

  it("checkpoints and advances when another source follows", () => {
    const { audio, callbacks } = renderAudio({ hasNextSource: true });

    fireEvent.ended(audio);

    expect(callbacks.onSourceEnded).toHaveBeenCalledOnce();
    expect(callbacks.onAdvanceSource).toHaveBeenCalledOnce();
  });
});

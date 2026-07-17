// @vitest-environment jsdom

import { cleanup, fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Audiobook } from "@/types/audiobook";
import { DEFAULT_USER_PREFERENCES } from "@/features/preferences/contracts";

import { usePlayer } from "./context";
import PlayerProvider from "./PlayerProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}));

vi.mock("@/features/offline/downloads", () => ({
  resolveOfflineSourceUrl: vi.fn().mockResolvedValue(undefined),
}));

const AUDIOBOOK: Audiobook = {
  author: "Ursula K. Le Guin",
  bookmarks: [],
  chapters: [],
  coverTone: "sky",
  currentChapter: "Start",
  description: "Test audiobook",
  duration: "1 hr",
  fileCount: 1,
  format: "MP3",
  id: "10000000-0000-0000-0000-000000000001",
  isDownloaded: false,
  narrator: "Narrator",
  progressLabel: "Not started",
  progressPercent: 0,
  sources: [
    {
      byteSize: 1024,
      driveVersion: "1",
      durationMs: null,
      id: "20000000-0000-0000-0000-000000000002",
      mimeType: "audio/mpeg",
      name: "book.mp3",
      sequence: 0,
    },
  ],
  title: "The Dispossessed",
};

function PlayerProbe() {
  const player = usePlayer();
  return (
    <button onClick={() => player.playAudiobook(AUDIOBOOK)} type="button">
      Start {player.audiobook?.title ?? "nothing"}
    </button>
  );
}

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("PlayerProvider", () => {
  it("owns one audio element and resolves an owned stream URL", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
      () => undefined,
    );
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();

    const { container, getByRole } = render(
      <PlayerProvider preferences={DEFAULT_USER_PREFERENCES}>
        <PlayerProbe />
      </PlayerProvider>,
    );

    fireEvent.click(getByRole("button"));

    await waitFor(() => {
      expect(getByRole("button").textContent).toContain("The Dispossessed");
    });
    const audioElements = container.querySelectorAll("audio");
    expect(audioElements).toHaveLength(1);
    await waitFor(() => {
      expect(audioElements[0]?.src).toContain(
        "/api/v1/audiobooks/10000000-0000-0000-0000-000000000001/stream?fileId=20000000-0000-0000-0000-000000000002",
      );
    });
  });

  it("applies a pending seek only on the first canplay event", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
      () => undefined,
    );
    const play = vi
      .spyOn(HTMLMediaElement.prototype, "play")
      .mockResolvedValue();

    const { container, getByRole } = render(
      <PlayerProvider preferences={DEFAULT_USER_PREFERENCES}>
        <PlayerProbe />
      </PlayerProvider>,
    );

    fireEvent.click(getByRole("button"));
    const audio = container.querySelector("audio");
    expect(audio).not.toBeNull();
    if (!audio) return;
    await waitFor(() => expect(audio.src).toContain("/stream?fileId="));

    fireEvent.canPlay(audio);
    expect(play).toHaveBeenCalledOnce();
    audio.currentTime = 5;
    fireEvent.canPlay(audio);

    expect(audio.currentTime).toBe(5);
    expect(play).toHaveBeenCalledOnce();
  });
});

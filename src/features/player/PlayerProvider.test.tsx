// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Audiobook } from "@/types/audiobook";

import { usePlayer } from "./context";
import PlayerProvider from "./PlayerProvider";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn() }),
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

afterEach(() => vi.restoreAllMocks());

describe("PlayerProvider", () => {
  it("owns one audio element and resolves an owned stream URL", async () => {
    vi.spyOn(HTMLMediaElement.prototype, "load").mockImplementation(
      () => undefined,
    );
    vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();

    const { container } = render(
      <PlayerProvider>
        <PlayerProbe />
      </PlayerProvider>,
    );

    fireEvent.click(screen.getByRole("button"));

    await waitFor(() => {
      expect(screen.getByRole("button").textContent).toContain(
        "The Dispossessed",
      );
    });
    const audioElements = container.querySelectorAll("audio");
    expect(audioElements).toHaveLength(1);
    expect(audioElements[0]?.src).toContain(
      "/api/v1/audiobooks/10000000-0000-0000-0000-000000000001/stream?fileId=20000000-0000-0000-0000-000000000002",
    );
  });
});

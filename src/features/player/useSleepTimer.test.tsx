// @vitest-environment jsdom

import { createRef } from "react";
import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useSleepTimer } from "./useSleepTimer";

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

describe("useSleepTimer", () => {
  it("pauses playback and resets after the selected duration", () => {
    vi.useFakeTimers();
    const audioRef = createRef<HTMLAudioElement>();
    const audio = document.createElement("audio");
    Object.defineProperty(audioRef, "current", { value: audio });
    const pause = vi.spyOn(audio, "pause").mockImplementation(() => undefined);
    const setSleepMode = vi.fn();

    renderHook(() => useSleepTimer(audioRef, "15", setSleepMode));
    vi.advanceTimersByTime(15 * 60_000);

    expect(pause).toHaveBeenCalledOnce();
    expect(setSleepMode).toHaveBeenCalledWith("off");
  });

  it("does not schedule duration work for chapter mode", () => {
    vi.useFakeTimers();
    const audioRef = createRef<HTMLAudioElement>();
    const setSleepMode = vi.fn();

    renderHook(() => useSleepTimer(audioRef, "chapter", setSleepMode));
    vi.runAllTimers();

    expect(setSleepMode).not.toHaveBeenCalled();
  });
});

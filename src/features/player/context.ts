"use client";

import { createContext, useContext } from "react";

import type { Audiobook, Chapter } from "@/types/audiobook";

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 1.75, 2] as const;
export type SleepMode = "off" | "15" | "30" | "60" | "chapter";
export const SLEEP_MODES: SleepMode[] = ["off", "15", "30", "60", "chapter"];

export interface PlayerContextValue {
  addBookmark: () => Promise<void>;
  audiobook?: Audiobook;
  bookmarkStatus?: string;
  currentTime: number;
  currentSourceId?: string;
  cyclePlaybackRate: () => void;
  cycleSleepMode: () => void;
  duration: number;
  error?: string;
  isPlaying: boolean;
  playAudiobook: (audiobook: Audiobook) => void;
  playChapter: (audiobook: Audiobook, chapter: Chapter) => void;
  playbackRate: number;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  skip: (seconds: number) => void;
  sleepMode: SleepMode;
  togglePlayback: () => void;
  volume: number;
}

export const PlayerContext = createContext<PlayerContextValue | undefined>(
  undefined,
);

export function usePlayer(): PlayerContextValue {
  const context = useContext(PlayerContext);

  if (!context) {
    throw new Error("usePlayer must be used within PlayerProvider.");
  }

  return context;
}

export function formatPlayerTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const wholeSeconds = Math.floor(seconds);
  const hours = Math.floor(wholeSeconds / 3_600);
  const minutes = Math.floor((wholeSeconds % 3_600) / 60);
  const remainder = wholeSeconds % 60;
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`
    : `${minutes}:${String(remainder).padStart(2, "0")}`;
}

"use client";

import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import type { SleepMode } from "./context";

export function useSleepTimer(
  audioRef: RefObject<HTMLAudioElement | null>,
  sleepMode: SleepMode,
  setSleepMode: Dispatch<SetStateAction<SleepMode>>,
): void {
  useEffect(() => {
    if (sleepMode === "off" || sleepMode === "chapter") return;
    const timeout = window.setTimeout(
      () => {
        audioRef.current?.pause();
        setSleepMode("off");
      },
      Number(sleepMode) * 60_000,
    );
    return () => window.clearTimeout(timeout);
  }, [audioRef, setSleepMode, sleepMode]);
}

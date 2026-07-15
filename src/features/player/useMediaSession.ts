"use client";

import { useEffect, type RefObject } from "react";

import type { Audiobook } from "@/types/audiobook";

export function useMediaSession(
  audiobook: Audiobook | undefined,
  audioRef: RefObject<HTMLAudioElement | null>,
): void {
  useEffect(() => {
    if (!("mediaSession" in navigator) || !audiobook) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      album: "Quiet Library",
      artist: audiobook.author,
      title: audiobook.title,
    });
    navigator.mediaSession.setActionHandler("play", () => {
      void audioRef.current?.play();
    });
    navigator.mediaSession.setActionHandler("pause", () => {
      audioRef.current?.pause();
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = Math.max(
          0,
          audio.currentTime - (details.seekOffset ?? 15),
        );
      }
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = Math.min(
          audio.duration,
          audio.currentTime + (details.seekOffset ?? 30),
        );
      }
    });

    return () => {
      navigator.mediaSession.metadata = null;
      ["play", "pause", "seekbackward", "seekforward"].forEach((action) => {
        navigator.mediaSession.setActionHandler(
          action as MediaSessionAction,
          null,
        );
      });
    };
  }, [audioRef, audiobook]);
}

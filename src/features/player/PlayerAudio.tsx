"use client";

import type { MutableRefObject, RefObject } from "react";

import type { Audiobook } from "@/types/audiobook";

import type { SleepMode } from "./context";

interface PlayerAudioProps {
  audioRef: RefObject<HTMLAudioElement | null>;
  audiobook: Audiobook | undefined;
  hasNextSource: boolean;
  onAdvanceSource: () => void;
  onCurrentTime: (seconds: number) => void;
  onDuration: (seconds: number) => void;
  onError: () => void;
  onPlaying: (isPlaying: boolean) => void;
  onSourceEnded: () => void;
  onSleepComplete: () => void;
  pendingSeekRef: MutableRefObject<number>;
  playbackRate: number;
  shouldAutoplayRef: MutableRefObject<boolean>;
  sleepMode: SleepMode;
  sourceId: string | undefined;
  volume: number;
}

export default function PlayerAudio({
  audioRef,
  audiobook,
  hasNextSource,
  onAdvanceSource,
  onCurrentTime,
  onDuration,
  onError,
  onPlaying,
  onSourceEnded,
  onSleepComplete,
  pendingSeekRef,
  playbackRate,
  shouldAutoplayRef,
  sleepMode,
  sourceId,
  volume,
}: PlayerAudioProps) {
  return (
    <audio
      onCanPlay={() => {
        const audio = audioRef.current;
        if (!audio) return;
        audio.currentTime = pendingSeekRef.current;
        pendingSeekRef.current = 0;
        audio.playbackRate = playbackRate;
        audio.volume = volume;
        if (shouldAutoplayRef.current) void audio.play().catch(onError);
        shouldAutoplayRef.current = false;
      }}
      onDurationChange={(event) => onDuration(event.currentTarget.duration)}
      onEnded={() => {
        onSourceEnded();
        if (hasNextSource) {
          shouldAutoplayRef.current = true;
          onAdvanceSource();
        }
      }}
      onError={onError}
      onPause={() => onPlaying(false)}
      onPlay={() => onPlaying(true)}
      onTimeUpdate={(event) => {
        const time = event.currentTarget.currentTime;
        onCurrentTime(time);
        if (
          "mediaSession" in navigator &&
          Number.isFinite(event.currentTarget.duration) &&
          event.currentTarget.duration > 0 &&
          time <= event.currentTarget.duration
        ) {
          navigator.mediaSession.setPositionState({
            duration: event.currentTarget.duration,
            playbackRate: event.currentTarget.playbackRate,
            position: time,
          });
        }
        if (sleepMode !== "chapter") return;
        const chapter = audiobook?.chapters.findLast(
          (candidate) =>
            candidate.audiobookFileId === sourceId &&
            candidate.startMs !== undefined &&
            time >= candidate.startMs / 1_000,
        );
        if (chapter?.endMs && time >= chapter.endMs / 1_000) {
          event.currentTarget.pause();
          onSleepComplete();
        }
      }}
      preload="metadata"
      ref={audioRef}
    />
  );
}

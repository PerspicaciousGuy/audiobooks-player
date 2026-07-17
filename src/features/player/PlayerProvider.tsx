"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { useProgressSync } from "@/features/progress/useProgressSync";
import { useBookmarkActions } from "@/features/bookmarks/useBookmarkActions";
import type { UserPreferences } from "@/features/preferences/contracts";
import type { Audiobook } from "@/types/audiobook";

import PlayerAudio from "./PlayerAudio";
import {
  PlayerContext,
  PLAYBACK_RATES,
  SLEEP_MODES,
  defaultSleepMode,
  type PlayerContextValue,
  type SleepMode,
} from "./context";
import { useMediaSession } from "./useMediaSession";
import { useAudioSource } from "./useAudioSource";
import { useSleepTimer } from "./useSleepTimer";
import { useSourceSelection } from "./useSourceSelection";

interface PlayerProviderProps {
  children: ReactNode;
  preferences: UserPreferences;
}

export default function PlayerProvider({
  children,
  preferences,
}: PlayerProviderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingSeekRef = useRef<number | null>(null);
  const shouldAutoplayRef = useRef(false);
  const [audiobook, setAudiobook] = useState<Audiobook>();
  const [sourceIndex, setSourceIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(
    preferences.defaultPlaybackRate,
  );
  const [volume, setVolumeState] = useState(1);
  const [sleepMode, setSleepMode] = useState<SleepMode>("off");
  const [error, setError] = useState<string>();
  const source = audiobook?.sources?.[sourceIndex];
  const { saveCheckpoint } = useProgressSync({
    audiobook,
    currentTime,
    duration,
    isPlaying,
    playbackRate,
    sourceId: source?.id,
  });
  const { addBookmark, bookmarkStatus } = useBookmarkActions({
    audiobook,
    currentTime,
    sourceId: source?.id,
  });

  useMediaSession(
    audiobook,
    audioRef,
    preferences.skipBackSeconds,
    preferences.skipForwardSeconds,
  );
  useSleepTimer(audioRef, sleepMode, setSleepMode);

  useAudioSource({
    audioRef,
    audiobook,
    setCurrentTime,
    setDuration,
    setError,
    source,
  });

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio && Number.isFinite(seconds)) {
      audio.currentTime = Math.max(
        0,
        Math.min(audio.duration || seconds, seconds),
      );
    }
  }, []);

  const skip = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = Math.max(
        0,
        Math.min(
          audio.duration || audio.currentTime + seconds,
          audio.currentTime + seconds,
        ),
      );
    }
  }, []);

  const { playAudiobook: selectAudiobook, playChapter: selectChapter } =
    useSourceSelection({
      audioRef,
      audiobook,
      defaultPlaybackRate: preferences.defaultPlaybackRate,
      pendingSeekRef,
      setAudiobook,
      setError,
      setPlaybackRate,
      setSourceIndex,
      shouldAutoplayRef,
      sourceIndex,
    });

  const value: PlayerContextValue = {
    addBookmark,
    ...(audiobook ? { audiobook } : {}),
    ...(bookmarkStatus ? { bookmarkStatus } : {}),
    currentTime,
    ...(source ? { currentSourceId: source.id } : {}),
    cyclePlaybackRate: () => {
      const index = PLAYBACK_RATES.indexOf(
        playbackRate as (typeof PLAYBACK_RATES)[number],
      );
      const nextRate = PLAYBACK_RATES[(index + 1) % PLAYBACK_RATES.length] ?? 1;
      if (audioRef.current) audioRef.current.playbackRate = nextRate;
      setPlaybackRate(nextRate);
    },
    cycleSleepMode: () => {
      const index = SLEEP_MODES.indexOf(sleepMode);
      setSleepMode(SLEEP_MODES[(index + 1) % SLEEP_MODES.length] ?? "off");
    },
    duration,
    ...(error ? { error } : {}),
    isPlaying,
    playAudiobook: (nextAudiobook) => {
      void saveCheckpoint();
      if (audiobook?.id !== nextAudiobook.id) {
        setSleepMode(defaultSleepMode(preferences.defaultSleepTimerMinutes));
      }
      selectAudiobook(nextAudiobook);
    },
    playChapter: (nextAudiobook, chapter) => {
      void saveCheckpoint();
      selectChapter(nextAudiobook, chapter);
    },
    playbackRate,
    seek,
    setVolume: (nextVolume) => {
      const normalized = Math.max(0, Math.min(1, nextVolume));
      if (audioRef.current) audioRef.current.volume = normalized;
      setVolumeState(normalized);
    },
    skipBackSeconds: preferences.skipBackSeconds,
    skipForwardSeconds: preferences.skipForwardSeconds,
    skip,
    sleepMode,
    togglePlayback: () => {
      const audio = audioRef.current;
      if (!audio) return;
      if (audio.paused) {
        void audio
          .play()
          .catch(() => setError("Playback could not start from Google Drive."));
      } else audio.pause();
    },
    volume,
  };

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <PlayerAudio
        audioRef={audioRef}
        audiobook={audiobook}
        hasNextSource={Boolean(
          audiobook?.sources && sourceIndex < audiobook.sources.length - 1,
        )}
        onAdvanceSource={() => setSourceIndex((current) => current + 1)}
        onCurrentTime={setCurrentTime}
        onDuration={setDuration}
        onError={() =>
          setError("Playback could not continue from Google Drive.")
        }
        onPlaying={setIsPlaying}
        onSleepComplete={() => setSleepMode("off")}
        onSourceEnded={() => void saveCheckpoint()}
        pendingSeekRef={pendingSeekRef}
        playbackRate={playbackRate}
        shouldAutoplayRef={shouldAutoplayRef}
        sleepMode={sleepMode}
        sourceId={source?.id}
        volume={volume}
      />
    </PlayerContext.Provider>
  );
}

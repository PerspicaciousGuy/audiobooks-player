"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { useProgressSync } from "@/features/progress/useProgressSync";
import { useBookmarkActions } from "@/features/bookmarks/useBookmarkActions";
import { resolveOfflineSourceUrl } from "@/features/offline/downloads";
import type { Audiobook } from "@/types/audiobook";

import PlayerAudio from "./PlayerAudio";
import {
  PlayerContext,
  PLAYBACK_RATES,
  SLEEP_MODES,
  type PlayerContextValue,
  type SleepMode,
} from "./context";
import { useMediaSession } from "./useMediaSession";
import { useSleepTimer } from "./useSleepTimer";
import { useSourceSelection } from "./useSourceSelection";

export default function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const pendingSeekRef = useRef(0);
  const shouldAutoplayRef = useRef(false);
  const [audiobook, setAudiobook] = useState<Audiobook>();
  const [sourceIndex, setSourceIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
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

  useMediaSession(audiobook, audioRef);
  useSleepTimer(audioRef, sleepMode, setSleepMode);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audiobook || !source) return;
    let isCancelled = false;
    let offlineUrl: string | undefined;
    void resolveOfflineSourceUrl(source)
      .catch(() => undefined)
      .then((resolvedUrl) => {
        if (isCancelled) {
          if (resolvedUrl) URL.revokeObjectURL(resolvedUrl);
          return;
        }
        offlineUrl = resolvedUrl;
        audio.src =
          resolvedUrl ??
          `/api/v1/audiobooks/${audiobook.id}/stream?fileId=${source.id}`;
        audio.load();
        setCurrentTime(0);
        setDuration(0);
        setError(undefined);
      });
    return () => {
      isCancelled = true;
      if (offlineUrl) URL.revokeObjectURL(offlineUrl);
    };
  }, [audiobook, source]);

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

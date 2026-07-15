"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import type { Audiobook, Chapter } from "@/types/audiobook";

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

  useMediaSession(audiobook, audioRef);
  useSleepTimer(audioRef, sleepMode, setSleepMode);

  useEffect(() => {
    const audio = audioRef.current;

    if (!audio || !audiobook || !source) return;
    audio.src = `/api/v1/audiobooks/${audiobook.id}/stream?fileId=${source.id}`;
    audio.load();
    setCurrentTime(0);
    setDuration(0);
    setError(undefined);
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

  const selectSource = useCallback(
    (
      nextAudiobook: Audiobook,
      nextSourceIndex: number,
      seekSeconds: number,
    ) => {
      if (!nextAudiobook.sources?.length) {
        setError("This preview book does not have a connected audio source.");
        return;
      }

      const audio = audioRef.current;
      const isCurrentSource =
        audiobook?.id === nextAudiobook.id && sourceIndex === nextSourceIndex;

      if (audio && isCurrentSource) {
        audio.currentTime = seekSeconds;
        void audio
          .play()
          .catch(() => setError("Playback could not start from Google Drive."));
        return;
      }

      pendingSeekRef.current = seekSeconds;
      shouldAutoplayRef.current = true;
      setSourceIndex(nextSourceIndex);
      setAudiobook(nextAudiobook);
    },
    [audiobook?.id, sourceIndex],
  );

  const playAudiobook = useCallback(
    (nextAudiobook: Audiobook) => selectSource(nextAudiobook, 0, 0),
    [selectSource],
  );

  const playChapter = useCallback(
    (nextAudiobook: Audiobook, chapter: Chapter) => {
      const nextSourceIndex = Math.max(
        0,
        nextAudiobook.sources?.findIndex(
          ({ id }) => id === chapter.audiobookFileId,
        ) ?? 0,
      );
      selectSource(
        nextAudiobook,
        nextSourceIndex,
        (chapter.startMs ?? 0) / 1_000,
      );
    },
    [selectSource],
  );

  const value: PlayerContextValue = {
    ...(audiobook ? { audiobook } : {}),
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
    playAudiobook,
    playChapter,
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

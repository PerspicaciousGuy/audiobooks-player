"use client";

import {
  useEffect,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from "react";

import { resolveOfflineSourceUrl } from "@/features/offline/downloads";
import type { Audiobook, AudioSource } from "@/types/audiobook";

interface AudioSourceInput {
  audioRef: RefObject<HTMLAudioElement | null>;
  audiobook: Audiobook | undefined;
  setCurrentTime: Dispatch<SetStateAction<number>>;
  setDuration: Dispatch<SetStateAction<number>>;
  setError: Dispatch<SetStateAction<string | undefined>>;
  source: AudioSource | undefined;
}

export function useAudioSource({
  audioRef,
  audiobook,
  setCurrentTime,
  setDuration,
  setError,
  source,
}: AudioSourceInput): void {
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
  }, [audioRef, audiobook, setCurrentTime, setDuration, setError, source]);
}

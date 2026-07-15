"use client";

import {
  useCallback,
  type Dispatch,
  type MutableRefObject,
  type RefObject,
  type SetStateAction,
} from "react";

import type { Audiobook, Chapter } from "@/types/audiobook";

interface SourceSelectionInput {
  audioRef: RefObject<HTMLAudioElement | null>;
  audiobook: Audiobook | undefined;
  pendingSeekRef: MutableRefObject<number>;
  setAudiobook: Dispatch<SetStateAction<Audiobook | undefined>>;
  setError: Dispatch<SetStateAction<string | undefined>>;
  setPlaybackRate: Dispatch<SetStateAction<number>>;
  setSourceIndex: Dispatch<SetStateAction<number>>;
  shouldAutoplayRef: MutableRefObject<boolean>;
  sourceIndex: number;
}

export function useSourceSelection(input: SourceSelectionInput): {
  playAudiobook: (audiobook: Audiobook) => void;
  playChapter: (audiobook: Audiobook, chapter: Chapter) => void;
} {
  const selectSource = useCallback(
    (
      nextAudiobook: Audiobook,
      nextSourceIndex: number,
      seekSeconds: number,
    ) => {
      if (!nextAudiobook.sources?.length) {
        input.setError(
          "This preview book does not have a connected audio source.",
        );
        return;
      }

      const audio = input.audioRef.current;
      const isCurrentSource =
        input.audiobook?.id === nextAudiobook.id &&
        input.sourceIndex === nextSourceIndex;

      if (audio && isCurrentSource) {
        audio.currentTime = seekSeconds;
        void audio
          .play()
          .catch(() =>
            input.setError("Playback could not start from Google Drive."),
          );
        return;
      }

      input.pendingSeekRef.current = seekSeconds;
      input.shouldAutoplayRef.current = true;
      input.setSourceIndex(nextSourceIndex);
      input.setAudiobook(nextAudiobook);
    },
    [input],
  );

  const playAudiobook = useCallback(
    (nextAudiobook: Audiobook) => {
      const resumeSourceIndex = Math.max(
        0,
        nextAudiobook.sources?.findIndex(
          ({ id }) => id === nextAudiobook.resume?.audiobookFileId,
        ) ?? 0,
      );
      if (nextAudiobook.resume) {
        input.setPlaybackRate(nextAudiobook.resume.playbackRate);
      }
      selectSource(
        nextAudiobook,
        resumeSourceIndex,
        (nextAudiobook.resume?.positionMs ?? 0) / 1_000,
      );
    },
    [input, selectSource],
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

  return { playAudiobook, playChapter };
}

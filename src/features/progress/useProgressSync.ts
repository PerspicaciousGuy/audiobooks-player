"use client";

import { useCallback, useEffect, useRef } from "react";

import type { Audiobook } from "@/types/audiobook";

import { savedProgressSchema, type ProgressCheckpoint } from "./contracts";
import {
  enqueueProgress,
  readProgressQueue,
  removeQueuedProgress,
  type QueuedProgress,
} from "./queue";

interface ProgressSnapshot {
  audiobook: Audiobook | undefined;
  currentTime: number;
  duration: number;
  isPlaying: boolean;
  playbackRate: number;
  sourceId: string | undefined;
}

async function sendProgress(
  queued: QueuedProgress,
  keepalive = false,
): Promise<number | undefined> {
  const { audiobookId, ...checkpoint } = queued;
  const response = await fetch(`/api/v1/audiobooks/${audiobookId}/progress`, {
    body: JSON.stringify(checkpoint),
    headers: { "content-type": "application/json" },
    keepalive,
    method: "PUT",
  });
  const payload = savedProgressSchema.safeParse(await response.json());

  if ((response.ok || response.status === 409) && payload.success) {
    return payload.data.version;
  }

  if (response.status >= 400 && response.status < 500) return 0;
  throw new Error("Progress synchronization failed.");
}

export function useProgressSync(snapshot: ProgressSnapshot): {
  saveCheckpoint: (keepalive?: boolean) => Promise<void>;
} {
  const snapshotRef = useRef(snapshot);
  const versionRef = useRef<number | null>(
    snapshot.audiobook?.resume?.version ?? null,
  );
  const wasPlayingRef = useRef(false);
  snapshotRef.current = snapshot;

  useEffect(() => {
    versionRef.current = snapshot.audiobook?.resume?.version ?? null;
  }, [snapshot.audiobook?.id, snapshot.audiobook?.resume?.version]);

  const saveCheckpoint = useCallback(async (keepalive = false) => {
    const current = snapshotRef.current;
    const { audiobook, sourceId } = current;

    if (!audiobook || !sourceId || current.currentTime < 1) return;
    const chapter = audiobook.chapters.findLast(
      (candidate) =>
        candidate.audiobookFileId === sourceId &&
        candidate.startMs !== undefined &&
        current.currentTime * 1_000 >= candidate.startMs,
    );
    const isLastSource = audiobook.sources?.at(-1)?.id === sourceId;
    const isCompleted = Boolean(
      isLastSource &&
      current.duration > 0 &&
      (current.duration - current.currentTime <= 30 ||
        current.currentTime / current.duration >= 0.98),
    );
    const checkpoint: ProgressCheckpoint = {
      audiobookFileId: sourceId,
      chapterId: chapter?.id ?? null,
      clientUpdatedAt: new Date().toISOString(),
      expectedVersion: versionRef.current,
      isCompleted,
      playbackRate: current.playbackRate,
      positionMs: Math.round(current.currentTime * 1_000),
    };
    const queued: QueuedProgress = { audiobookId: audiobook.id, ...checkpoint };
    try {
      enqueueProgress(window.localStorage, queued);
    } catch {
      // Continue with the live request when device storage is unavailable.
    }

    try {
      const version = await sendProgress(queued, keepalive);
      if (version !== undefined) {
        try {
          removeQueuedProgress(
            window.localStorage,
            audiobook.id,
            checkpoint.clientUpdatedAt,
          );
        } catch {
          // A storage failure does not invalidate the accepted server write.
        }
        if (version > 0) versionRef.current = version;
      }
    } catch {
      // The newest checkpoint remains in localStorage for the online retry.
    }
  }, []);

  useEffect(() => {
    if (!snapshot.isPlaying || !snapshot.audiobook) return;
    const interval = window.setInterval(() => void saveCheckpoint(), 15_000);
    return () => window.clearInterval(interval);
  }, [saveCheckpoint, snapshot.audiobook, snapshot.isPlaying]);

  useEffect(() => {
    if (wasPlayingRef.current && !snapshot.isPlaying) void saveCheckpoint();
    wasPlayingRef.current = snapshot.isPlaying;
  }, [saveCheckpoint, snapshot.isPlaying]);

  useEffect(() => {
    async function flushQueue(): Promise<void> {
      for (const queued of readProgressQueue(window.localStorage)) {
        try {
          const version = await sendProgress(queued);
          if (version === undefined) continue;
          removeQueuedProgress(
            window.localStorage,
            queued.audiobookId,
            queued.clientUpdatedAt,
          );
          if (
            version > 0 &&
            queued.audiobookId === snapshotRef.current.audiobook?.id
          ) {
            versionRef.current = version;
          }
        } catch {
          break;
        }
      }
    }

    const handleVisibility = () => {
      if (document.visibilityState === "hidden") void saveCheckpoint(true);
    };
    const handlePageHide = () => void saveCheckpoint(true);
    window.addEventListener("online", flushQueue);
    window.addEventListener("pagehide", handlePageHide);
    document.addEventListener("visibilitychange", handleVisibility);
    if (navigator.onLine) void flushQueue();
    return () => {
      window.removeEventListener("online", flushQueue);
      window.removeEventListener("pagehide", handlePageHide);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [saveCheckpoint]);

  return { saveCheckpoint };
}

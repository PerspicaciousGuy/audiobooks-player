"use client";

import Link from "next/link";
import { useRef, useState } from "react";

import { downloadAudiobook } from "@/features/offline/downloads";
import { formatBytes } from "@/features/offline/format";
import type { Audiobook } from "@/types/audiobook";

export default function OfflineDownloadButton({
  audiobook,
}: {
  audiobook: Audiobook;
}) {
  const controllerRef = useRef<AbortController | undefined>(undefined);
  const [progress, setProgress] = useState(0);
  const [sourceName, setSourceName] = useState<string>();
  const [status, setStatus] = useState<
    "idle" | "downloading" | "done" | "error"
  >("idle");
  const totalBytes =
    audiobook.sources?.reduce((sum, source) => sum + source.byteSize, 0) ?? 0;

  async function handleDownload(): Promise<void> {
    const controller = new AbortController();
    controllerRef.current = controller;
    setStatus("downloading");
    setProgress(0);

    try {
      await downloadAudiobook(audiobook, controller.signal, (nextProgress) => {
        setProgress(nextProgress.downloadedBytes / nextProgress.totalBytes);
        setSourceName(nextProgress.sourceName);
      });
      setStatus("done");
    } catch {
      setStatus("error");
    } finally {
      controllerRef.current = undefined;
    }
  }

  if (status === "done") {
    return (
      <Link
        className="border-border rounded-control inline-flex min-h-12 items-center px-4 text-sm font-semibold"
        href="/app/offline"
      >
        Available offline
      </Link>
    );
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        className="border-border hover:border-action rounded-control min-h-12 border px-4 text-sm font-semibold disabled:opacity-50"
        disabled={totalBytes === 0}
        onClick={() => {
          if (status === "downloading") controllerRef.current?.abort();
          else void handleDownload();
        }}
        type="button"
      >
        {status === "downloading"
          ? `Cancel ${Math.round(progress * 100)}%`
          : `Download ${formatBytes(totalBytes)}`}
      </button>
      {status === "downloading" ? (
        <p className="text-ink-muted max-w-52 truncate text-xs" role="status">
          {sourceName}
        </p>
      ) : status === "error" ? (
        <p className="text-danger text-xs" role="alert">
          Download failed or was cancelled. Partial data was removed.
        </p>
      ) : null}
    </div>
  );
}

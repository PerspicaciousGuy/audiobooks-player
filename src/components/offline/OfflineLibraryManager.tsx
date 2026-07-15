"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import Icon from "@/components/ui/Icon";
import {
  clearOfflineDownloads,
  createOfflineRecordUrl,
  listOfflineDownloads,
  removeOfflineAudiobook,
} from "@/features/offline/downloads";
import type { OfflineDownloadRecord } from "@/features/offline/database";
import { formatBytes } from "@/features/offline/format";

interface StorageEstimate {
  quota: number;
  usage: number;
}

export default function OfflineLibraryManager() {
  const [downloads, setDownloads] = useState<OfflineDownloadRecord[]>([]);
  const [estimate, setEstimate] = useState<StorageEstimate>({
    quota: 0,
    usage: 0,
  });
  const [playlist, setPlaylist] = useState<OfflineDownloadRecord[]>([]);
  const [playlistIndex, setPlaylistIndex] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>();
  const [error, setError] = useState<string>();
  const activeRecord = playlist[playlistIndex];

  const refresh = useCallback(async () => {
    try {
      const [records, storage] = await Promise.all([
        listOfflineDownloads(),
        navigator.storage?.estimate?.() ?? Promise.resolve({}),
      ]);
      setDownloads(records);
      setEstimate({ quota: storage.quota ?? 0, usage: storage.usage ?? 0 });
    } catch {
      setError("Device storage could not be read.");
    }
  }, []);

  useEffect(() => void refresh(), [refresh]);

  useEffect(() => {
    let disposed = false;
    let objectUrl: string | undefined;

    if (activeRecord) {
      void createOfflineRecordUrl(activeRecord).then((url) => {
        if (disposed) {
          if (url) URL.revokeObjectURL(url);
          return;
        }
        objectUrl = url;
        setAudioUrl(url);
        if (!url) setError("This download was evicted and will be reconciled.");
      });
    } else {
      setAudioUrl(undefined);
    }

    return () => {
      disposed = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [activeRecord]);

  const books = useMemo(() => {
    const grouped = new Map<string, OfflineDownloadRecord[]>();
    downloads.forEach((record) => {
      grouped.set(record.audiobookId, [
        ...(grouped.get(record.audiobookId) ?? []),
        record,
      ]);
    });
    return [...grouped.values()].map((records) =>
      records.toSorted((left, right) => left.sequence - right.sequence),
    );
  }, [downloads]);
  const usagePercent = estimate.quota
    ? Math.min(100, (estimate.usage / estimate.quota) * 100)
    : 0;

  return (
    <div className="flex flex-col gap-8">
      <section className="border-border bg-paper-elevated rounded-card flex flex-col gap-5 border p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold">Browser storage estimate</p>
            <p className="text-ink-muted mt-1 text-xs">
              {formatBytes(estimate.usage)} used of{" "}
              {formatBytes(estimate.quota)}
            </p>
          </div>
          <span className="text-ink-muted text-xs">
            {Math.round(usagePercent)}%
          </span>
        </div>
        <div className="bg-surface-muted h-2 overflow-hidden rounded-full">
          <div
            className="bg-action h-full rounded-full"
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <button
          className="border-danger text-danger rounded-control min-h-11 self-start border px-4 text-sm font-semibold"
          disabled={downloads.length === 0}
          onClick={() => void clearOfflineDownloads().then(refresh)}
          type="button"
        >
          Clear all downloads
        </button>
      </section>

      {activeRecord && audioUrl ? (
        <section className="bg-ink text-paper-elevated rounded-card p-5">
          <p className="font-semibold">{activeRecord.bookTitle}</p>
          <p className="text-paper-elevated/60 mt-1 truncate text-xs">
            {activeRecord.sourceName}
          </p>
          <audio
            autoPlay
            className="mt-4 w-full"
            controls
            onEnded={() => {
              if (playlistIndex < playlist.length - 1) {
                setPlaylistIndex((current) => current + 1);
              }
            }}
            src={audioUrl}
          />
        </section>
      ) : null}

      {books.length === 0 ? (
        <p className="text-ink-muted bg-surface-muted rounded-card p-6 text-sm">
          No completed downloads are stored on this device yet.
        </p>
      ) : (
        <div className="grid gap-4">
          {books.map((records) => {
            const first = records[0];
            if (!first) return null;
            const bytes = records.reduce(
              (sum, record) => sum + record.byteSize,
              0,
            );
            return (
              <article
                className="border-border bg-paper-elevated rounded-card flex items-center gap-4 border p-4"
                key={first.audiobookId}
              >
                <span className="bg-action-soft text-action-strong grid size-11 place-items-center rounded-full">
                  <Icon className="size-5" name="download" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">
                    {first.bookTitle}
                  </p>
                  <p className="text-ink-muted truncate text-xs">
                    {first.author} · {records.length} file
                    {records.length === 1 ? "" : "s"} · {formatBytes(bytes)}
                  </p>
                </div>
                <button
                  className="bg-ink text-paper-elevated rounded-control min-h-11 px-3 text-xs font-semibold"
                  onClick={() => {
                    setPlaylist(records);
                    setPlaylistIndex(0);
                  }}
                  type="button"
                >
                  Play
                </button>
                <button
                  aria-label={`Remove ${first.bookTitle} from this device`}
                  className="text-ink-muted hover:text-danger rounded-control min-h-11 px-2 text-xs font-semibold"
                  onClick={() =>
                    void removeOfflineAudiobook(first.audiobookId).then(refresh)
                  }
                  type="button"
                >
                  Remove
                </button>
              </article>
            );
          })}
        </div>
      )}
      {error ? (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

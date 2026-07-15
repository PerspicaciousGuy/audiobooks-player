"use client";

import { useEffect, useMemo, useState } from "react";

import BookCard from "@/components/library/BookCard";
import CollectionState from "@/components/states/CollectionState";
import Icon from "@/components/ui/Icon";
import { listOfflineDownloads } from "@/features/offline/downloads";
import type { Audiobook } from "@/types/audiobook";

type Filter = "all" | "downloaded" | "finished" | "in-progress";
type PreviewState = "empty" | "error" | "loading";

const FILTERS: readonly { label: string; value: Filter }[] = [
  { label: "All books", value: "all" },
  { label: "In progress", value: "in-progress" },
  { label: "Downloaded", value: "downloaded" },
  { label: "Finished", value: "finished" },
];

interface LibraryBrowserProps {
  audiobooks: Audiobook[];
  displayState?: PreviewState;
}

export default function LibraryBrowser({
  audiobooks,
  displayState,
}: LibraryBrowserProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [downloadedIds, setDownloadedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    void listOfflineDownloads()
      .then((records) => {
        if (isMounted) {
          setDownloadedIds(
            new Set(records.map(({ audiobookId }) => audiobookId)),
          );
        }
      })
      .catch(() => undefined);
    return () => {
      isMounted = false;
    };
  }, []);

  const visibleBooks = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();

    return audiobooks.filter((audiobook) => {
      const matchesQuery =
        !normalizedQuery ||
        [audiobook.title, audiobook.author, audiobook.narrator].some((value) =>
          value.toLocaleLowerCase().includes(normalizedQuery),
        );
      const matchesFilter =
        filter === "all" ||
        (filter === "downloaded" && downloadedIds.has(audiobook.id)) ||
        (filter === "finished" && audiobook.progressPercent === 100) ||
        (filter === "in-progress" &&
          audiobook.progressPercent > 0 &&
          audiobook.progressPercent < 100);
      return matchesQuery && matchesFilter;
    });
  }, [audiobooks, downloadedIds, filter, query]);

  if (displayState) return <CollectionState variant={displayState} />;

  return (
    <div className="flex flex-col gap-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-xl">
          <span className="sr-only">Search your library</span>
          <Icon
            className="text-ink-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
            name="search"
          />
          <input
            className="border-border bg-paper-elevated focus:border-action focus:ring-action rounded-control min-h-12 w-full border pr-4 pl-12 text-sm outline-none focus:ring-1"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search title, author, or narrator"
            type="search"
            value={query}
          />
        </label>
        <div
          aria-label="Filter library"
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
        >
          {FILTERS.map((item) => (
            <button
              aria-pressed={filter === item.value}
              className={
                filter === item.value
                  ? "bg-ink text-paper-elevated min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold"
                  : "border-border bg-paper-elevated text-ink-muted hover:text-ink min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold"
              }
              key={item.value}
              onClick={() => setFilter(item.value)}
              type="button"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="sr-only" role="status">
        {visibleBooks.length} audiobook{visibleBooks.length === 1 ? "" : "s"}
        shown.
      </p>
      {visibleBooks.length > 0 ? (
        <section
          aria-label="Audiobooks"
          className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {visibleBooks.map((audiobook) => (
            <BookCard audiobook={audiobook} key={audiobook.id} />
          ))}
        </section>
      ) : (
        <section className="bg-surface-muted rounded-card p-6 text-center">
          <h2 className="font-display text-2xl font-semibold">No matches</h2>
          <p className="text-ink-muted mt-2 text-sm">
            Try another search or choose a different filter.
          </p>
        </section>
      )}
    </div>
  );
}

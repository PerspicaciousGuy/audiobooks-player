"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import Icon from "@/components/ui/Icon";
import type { Bookmark } from "@/types/audiobook";

export default function BookmarkList({
  bookmarks,
}: {
  bookmarks: readonly Bookmark[];
}) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string>();
  const [error, setError] = useState<string>();

  async function deleteBookmark(bookmarkId: string): Promise<void> {
    setDeletingId(bookmarkId);
    setError(undefined);

    try {
      const response = await fetch(`/api/v1/bookmarks/${bookmarkId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Delete failed.");
      router.refresh();
    } catch {
      setError("Bookmark could not be deleted.");
    } finally {
      setDeletingId(undefined);
    }
  }

  if (bookmarks.length === 0) {
    return (
      <p className="text-ink-muted bg-surface-muted rounded-card p-5 text-sm">
        No bookmarks yet. Add one while listening to return to a moment.
      </p>
    );
  }

  return (
    <>
      <ul className="flex flex-col gap-3">
        {bookmarks.map((bookmark) => (
          <li
            className="border-border bg-paper-elevated rounded-card flex gap-3 border p-4"
            key={bookmark.id}
          >
            <Icon
              className="text-action-strong mt-1 size-4 shrink-0"
              name="bookmark"
            />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{bookmark.label}</p>
              <p className="text-ink-muted mt-1 text-xs">
                {bookmark.chapterTitle} · {bookmark.timestamp}
              </p>
            </div>
            <button
              aria-label={`Delete bookmark at ${bookmark.timestamp}`}
              className="text-ink-muted hover:text-danger focus-visible:ring-focus rounded-control min-h-11 px-2 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none disabled:opacity-50"
              disabled={deletingId === bookmark.id}
              onClick={() => void deleteBookmark(bookmark.id)}
              type="button"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
      {error ? (
        <p className="text-danger text-sm" role="alert">
          {error}
        </p>
      ) : null}
    </>
  );
}

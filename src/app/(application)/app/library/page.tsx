import type { Metadata } from "next";

import BookCard from "@/components/library/BookCard";
import CollectionState from "@/components/states/CollectionState";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";
import { MOCK_AUDIOBOOKS } from "@/lib/mock/library";

export const metadata: Metadata = {
  title: "Library",
  description: "Search, filter, and browse your private audiobook collection.",
};

interface LibraryPageProps {
  searchParams: Promise<{ state?: string }>;
}

const FILTERS = ["All books", "In progress", "Downloaded", "Finished"] as const;

function isPreviewState(
  state: string | undefined,
): state is "empty" | "error" | "loading" {
  return state === "empty" || state === "error" || state === "loading";
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { state } = await searchParams;

  return (
    <div className="flex flex-col gap-8 py-8 sm:py-10 lg:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            Six selected books
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Your library
          </h1>
          <p className="text-ink-muted">
            A private collection built from files you chose in Google Drive.
          </p>
        </div>
        <ActionLink
          href="/app/onboarding"
          icon={<Icon className="size-4" name="plus" />}
        >
          Add books
        </ActionLink>
      </header>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <label className="relative block w-full max-w-xl">
          <span className="sr-only">Search your library</span>
          <Icon
            className="text-ink-muted pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2"
            name="search"
          />
          <input
            className="border-border bg-paper-elevated focus:border-action focus:ring-action rounded-control min-h-12 w-full border pr-4 pl-12 text-sm outline-none focus:ring-1"
            name="library-search"
            placeholder="Search title, author, or narrator"
            type="search"
          />
        </label>
        <div
          aria-label="Filter library"
          className="flex gap-2 overflow-x-auto pb-1"
          role="group"
        >
          {FILTERS.map((filter, index) => (
            <button
              aria-pressed={index === 0}
              className={
                index === 0
                  ? "bg-ink text-paper-elevated min-h-11 shrink-0 rounded-full px-4 text-sm font-semibold"
                  : "border-border bg-paper-elevated text-ink-muted hover:text-ink min-h-11 shrink-0 rounded-full border px-4 text-sm font-semibold"
              }
              key={filter}
              type="button"
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {isPreviewState(state) ? (
        <CollectionState variant={state} />
      ) : (
        <section
          aria-label="Audiobooks"
          className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
        >
          {MOCK_AUDIOBOOKS.map((audiobook) => (
            <BookCard audiobook={audiobook} key={audiobook.id} />
          ))}
        </section>
      )}

      <p className="text-ink-muted text-center text-xs">
        Preview states: add <code>?state=empty</code>,{" "}
        <code>?state=loading</code>, or <code>?state=error</code> to this URL.
      </p>
    </div>
  );
}

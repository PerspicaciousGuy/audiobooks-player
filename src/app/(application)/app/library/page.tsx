import type { Metadata } from "next";

import LibraryBrowser from "@/components/library/LibraryBrowser";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";
import { getOwnedAudiobooks } from "@/features/library/repository";
import { MOCK_AUDIOBOOKS } from "@/lib/mock/library";

export const metadata: Metadata = {
  title: "Library",
  description: "Search, filter, and browse your private audiobook collection.",
};

interface LibraryPageProps {
  searchParams: Promise<{ imported?: string; state?: string }>;
}

function isPreviewState(
  state: string | undefined,
): state is "empty" | "error" | "loading" {
  return state === "empty" || state === "error" || state === "loading";
}

export default async function LibraryPage({ searchParams }: LibraryPageProps) {
  const { imported, state } = await searchParams;
  const ownedAudiobooks = await getOwnedAudiobooks();
  const isPreviewMode = ownedAudiobooks === undefined;
  const audiobooks = ownedAudiobooks ?? [...MOCK_AUDIOBOOKS];
  const displayState =
    state ?? (!isPreviewMode && audiobooks.length === 0 ? "empty" : undefined);

  return (
    <div className="flex flex-col gap-8 py-8 sm:py-10 lg:py-12">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            {audiobooks.length} selected book
            {audiobooks.length === 1 ? "" : "s"}
          </p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Your library
          </h1>
          <p className="text-ink-muted">
            A private collection built from files you chose in Google Drive.
          </p>
        </div>
        <ActionLink
          href="/app/import"
          icon={<Icon className="size-4" name="plus" />}
        >
          Add books
        </ActionLink>
      </header>

      {imported ? (
        <p
          className="bg-action-soft rounded-control px-4 py-3 text-sm"
          role="status"
        >
          Imported {imported} audiobook{imported === "1" ? "" : "s"} into your
          library.
        </p>
      ) : null}

      <LibraryBrowser
        audiobooks={audiobooks}
        {...(isPreviewState(displayState) ? { displayState } : {})}
      />

      {isPreviewMode ? (
        <p className="text-ink-muted text-center text-xs">
          Preview states: add <code>?state=empty</code>,{" "}
          <code>?state=loading</code>, or <code>?state=error</code> to this URL.
        </p>
      ) : null}
    </div>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

import BookCover from "@/components/library/BookCover";
import CollectionState from "@/components/states/CollectionState";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { MOCK_AUDIOBOOKS } from "@/lib/mock/library";

export const metadata: Metadata = {
  title: "Offline",
  description: "Manage audiobook downloads stored on this device.",
};

export default function OfflinePage() {
  const downloadedBooks = MOCK_AUDIOBOOKS.filter(
    (audiobook) => audiobook.isDownloaded,
  );

  return (
    <div className="flex flex-col gap-10 py-8 sm:py-10 lg:py-12">
      <SectionHeading
        description="Completed downloads stay on this device and can be removed at any time."
        eyebrow="Device storage"
        title="Listen beyond the signal"
      />

      <section className="border-border bg-paper-elevated rounded-card grid gap-6 border p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center lg:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Quiet Library storage</p>
              <p className="text-ink-muted mt-1 text-xs">
                3.8 GB used of approximately 9.4 GB available
              </p>
            </div>
            <span className="text-ink-muted text-xs">40%</span>
          </div>
          <div
            aria-label="40% of available storage used"
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={40}
            className="bg-surface-muted h-2 overflow-hidden rounded-full"
            role="progressbar"
          >
            <div className="bg-action h-full w-2/5 rounded-full" />
          </div>
          <p className="text-ink-muted text-xs leading-relaxed">
            Browser storage estimates can change. Quiet Library verifies every
            completed download and removes partial files after cancellation.
          </p>
        </div>
        <button
          className="border-danger text-danger hover:bg-danger hover:text-paper-elevated focus-visible:ring-danger rounded-control min-h-11 border px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
          type="button"
        >
          Clear all downloads
        </button>
      </section>

      <section className="flex flex-col gap-6">
        <SectionHeading
          description={`${downloadedBooks.length} books available without a connection`}
          title="On this device"
        />
        <div className="grid gap-4">
          {downloadedBooks.map((audiobook) => (
            <article
              className="border-border bg-paper-elevated rounded-card flex items-center gap-4 border p-4"
              key={audiobook.id}
            >
              <BookCover
                author={audiobook.author}
                size="mini"
                title={audiobook.title}
                tone={audiobook.coverTone}
              />
              <div className="min-w-0 flex-1">
                <Link
                  className="hover:text-action-strong focus-visible:ring-focus rounded-control block w-fit max-w-full truncate text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
                  href={`/app/audiobooks/${audiobook.id}`}
                >
                  {audiobook.title}
                </Link>
                <p className="text-ink-muted truncate text-xs">
                  {audiobook.author} · {audiobook.duration}
                </p>
                <p className="text-success mt-1 flex items-center gap-1 text-xs font-semibold">
                  <Icon className="size-3.5" name="check" />
                  Download verified
                </p>
              </div>
              <button
                aria-label={`Remove ${audiobook.title} from this device`}
                className="text-ink-muted hover:text-danger focus-visible:ring-danger rounded-control grid size-11 place-items-center focus-visible:ring-2 focus-visible:outline-none"
                type="button"
              >
                <span aria-hidden="true" className="text-xl">
                  ×
                </span>
              </button>
            </article>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <h2 className="font-display text-2xl font-semibold">Offline preview</h2>
        <CollectionState variant="offline" />
      </section>
    </div>
  );
}

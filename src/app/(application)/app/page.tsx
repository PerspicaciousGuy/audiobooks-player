import type { Metadata } from "next";
import Link from "next/link";

import BookCard from "@/components/library/BookCard";
import BookCover from "@/components/library/BookCover";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { CURRENT_AUDIOBOOK, MOCK_AUDIOBOOKS } from "@/lib/mock/library";

export const metadata: Metadata = {
  title: "Home",
  description: "Continue listening and browse your recent Quiet Library books.",
};

export default function ApplicationHomePage() {
  const currentDate = new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "long",
    weekday: "long",
  }).format(new Date());

  return (
    <div className="flex flex-col gap-12 py-8 sm:py-10 lg:gap-16 lg:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-ink-muted text-sm">{currentDate}</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">
            Welcome back.
          </h1>
        </div>
        <div className="bg-action-soft text-action-strong flex min-h-11 w-fit items-center gap-2 rounded-full px-4 text-xs font-bold">
          <span className="bg-success size-2 rounded-full" />
          Google Drive connected
        </div>
      </header>

      <section className="bg-ink text-paper-elevated rounded-panel shadow-card relative grid overflow-hidden p-6 sm:p-8 lg:grid-cols-[auto_1fr] lg:gap-10 lg:p-10">
        <div className="bg-action/15 absolute -top-24 -right-16 size-72 rounded-full blur-3xl" />
        <div className="hidden w-48 lg:block">
          <BookCover
            author={CURRENT_AUDIOBOOK.author}
            size="hero"
            title={CURRENT_AUDIOBOOK.title}
            tone={CURRENT_AUDIOBOOK.coverTone}
          />
        </div>
        <div className="relative flex flex-col justify-center gap-6">
          <div className="flex items-start gap-4 lg:hidden">
            <BookCover
              author={CURRENT_AUDIOBOOK.author}
              size="mini"
              title={CURRENT_AUDIOBOOK.title}
              tone={CURRENT_AUDIOBOOK.coverTone}
            />
            <div>
              <p className="text-action text-xs font-bold tracking-widest uppercase">
                Continue listening
              </p>
              <h2 className="font-display text-2xl font-semibold">
                {CURRENT_AUDIOBOOK.title}
              </h2>
            </div>
          </div>
          <div className="hidden flex-col gap-2 lg:flex">
            <p className="text-action text-xs font-bold tracking-widest uppercase">
              Continue listening
            </p>
            <h2 className="font-display text-4xl font-semibold">
              {CURRENT_AUDIOBOOK.title}
            </h2>
            <p className="text-paper-elevated/65">
              {CURRENT_AUDIOBOOK.author} · narrated by{" "}
              {CURRENT_AUDIOBOOK.narrator}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span>{CURRENT_AUDIOBOOK.currentChapter}</span>
              <span className="text-paper-elevated/60">
                {CURRENT_AUDIOBOOK.progressLabel}
              </span>
            </div>
            <div
              aria-label={`${CURRENT_AUDIOBOOK.progressPercent}% listened`}
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={CURRENT_AUDIOBOOK.progressPercent}
              className="bg-paper-elevated/20 h-1.5 overflow-hidden rounded-full"
              role="progressbar"
            >
              <div className="bg-action h-full w-2/5 rounded-full" />
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <ActionLink
              href={`/app/audiobooks/${CURRENT_AUDIOBOOK.id}`}
              icon={<Icon className="size-4" name="play" />}
            >
              Resume listening
            </ActionLink>
            <Link
              className="text-paper-elevated hover:text-action focus-visible:ring-action rounded-control inline-flex min-h-11 items-center px-3 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
              href={`/app/audiobooks/${CURRENT_AUDIOBOOK.id}`}
            >
              View book details
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-7">
        <SectionHeading
          action={
            <ActionLink href="/app/library" variant="text">
              View all books
            </ActionLink>
          }
          description="Stories ready for the next quiet moment."
          title="From your shelves"
        />
        <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {MOCK_AUDIOBOOKS.slice(1).map((audiobook) => (
            <BookCard audiobook={audiobook} key={audiobook.id} />
          ))}
        </div>
      </section>

      <section className="border-border bg-paper-elevated rounded-card flex flex-col gap-5 border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex items-start gap-4">
          <span className="bg-action-soft text-action-strong grid size-12 shrink-0 place-items-center rounded-full">
            <Icon className="size-5" name="plus" />
          </span>
          <div className="flex flex-col gap-1">
            <h2 className="font-display text-2xl font-semibold">
              Add another story
            </h2>
            <p className="text-ink-muted text-sm leading-relaxed">
              Rescan or change your Audiobooks folder without granting access to
              the rest of your Drive.
            </p>
          </div>
        </div>
        <ActionLink href="/app/onboarding" variant="secondary">
          Open Drive import
        </ActionLink>
      </section>
    </div>
  );
}

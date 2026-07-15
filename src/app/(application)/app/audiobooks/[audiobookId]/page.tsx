import type { Metadata } from "next";
import { notFound } from "next/navigation";

import BookCover from "@/components/library/BookCover";
import ChapterList from "@/components/player/ChapterList";
import ExpandedPlayer from "@/components/player/ExpandedPlayer";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";
import { getOwnedAudiobook } from "@/features/library/repository";
import { getAudiobookById } from "@/lib/mock/library";

interface AudiobookPageProps {
  params: Promise<{ audiobookId: string }>;
}

async function resolveAudiobook(audiobookId: string) {
  const ownedAudiobook = await getOwnedAudiobook(audiobookId);
  return ownedAudiobook === undefined
    ? getAudiobookById(audiobookId)
    : (ownedAudiobook ?? undefined);
}

export async function generateMetadata({
  params,
}: AudiobookPageProps): Promise<Metadata> {
  const { audiobookId } = await params;
  const audiobook = await resolveAudiobook(audiobookId);

  if (audiobook === undefined) {
    notFound();
  }

  return {
    title: audiobook.title,
    description: `${audiobook.title} by ${audiobook.author} in your Quiet Library.`,
  };
}

export default async function AudiobookPage({ params }: AudiobookPageProps) {
  const { audiobookId } = await params;
  const audiobook = await resolveAudiobook(audiobookId);

  if (audiobook === undefined) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-12 py-8 sm:py-10 lg:py-12">
      <nav aria-label="Breadcrumb">
        <ActionLink href="/app/library" variant="text">
          <Icon className="size-4" name="chevron-left" />
          Back to library
        </ActionLink>
      </nav>

      <section className="grid gap-8 md:grid-cols-[auto_1fr] md:items-center lg:gap-12">
        <div className="w-40 sm:w-48">
          <BookCover
            author={audiobook.author}
            size="hero"
            title={audiobook.title}
            tone={audiobook.coverTone}
          />
        </div>
        <div className="flex max-w-3xl flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
              {audiobook.format} · {audiobook.fileCount}{" "}
              {audiobook.fileCount === 1 ? "file" : "files"}
            </p>
            <h1 className="font-display text-4xl leading-tight font-semibold sm:text-6xl">
              {audiobook.title}
            </h1>
            <p className="text-ink-muted text-lg">
              {audiobook.author} · narrated by {audiobook.narrator}
            </p>
          </div>
          <p className="text-ink-muted leading-relaxed">
            {audiobook.description}
          </p>
          <div className="flex flex-wrap gap-3">
            <ActionLink
              href="#player"
              icon={<Icon className="size-4" name="play" />}
            >
              {audiobook.progressPercent > 0
                ? "Continue listening"
                : "Start listening"}
            </ActionLink>
            <ActionLink href="/app/offline" variant="secondary">
              <Icon className="size-4" name="download" />
              {audiobook.isDownloaded ? "Downloaded" : "Download"}
            </ActionLink>
          </div>
        </div>
      </section>

      <div id="player">
        <ExpandedPlayer audiobook={audiobook} />
      </div>

      <div className="grid gap-10 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <section className="flex flex-col gap-6">
          <SectionHeading
            description={`${audiobook.duration} total listening time`}
            title="Chapters"
          />
          <ChapterList chapters={audiobook.chapters} />
        </section>
        <aside className="flex flex-col gap-6">
          <SectionHeading title="Bookmarks" />
          {audiobook.bookmarks.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {audiobook.bookmarks.map((bookmark) => (
                <li
                  className="border-border bg-paper-elevated rounded-card flex gap-3 border p-4"
                  key={bookmark.id}
                >
                  <Icon
                    className="text-action-strong mt-1 size-4 shrink-0"
                    name="bookmark"
                  />
                  <div>
                    <p className="text-sm font-semibold">{bookmark.label}</p>
                    <p className="text-ink-muted mt-1 text-xs">
                      {bookmark.chapterTitle} · {bookmark.timestamp}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-ink-muted bg-surface-muted rounded-card p-5 text-sm">
              No bookmarks yet. Add one while listening to return to a moment.
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

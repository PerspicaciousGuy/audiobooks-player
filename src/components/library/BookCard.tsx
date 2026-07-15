import Link from "next/link";

import BookCover from "@/components/library/BookCover";
import Icon from "@/components/ui/Icon";
import type { Audiobook } from "@/types/audiobook";

interface BookCardProps {
  audiobook: Audiobook;
}

export default function BookCard({ audiobook }: BookCardProps) {
  return (
    <article className="group flex min-w-0 flex-col gap-4">
      <Link
        className="focus-visible:ring-focus rounded-card duration-standard relative transition-transform hover:-translate-y-1 focus-visible:ring-2 focus-visible:outline-none motion-reduce:transform-none motion-reduce:transition-none"
        href={`/app/audiobooks/${audiobook.id}`}
      >
        <BookCover
          author={audiobook.author}
          title={audiobook.title}
          tone={audiobook.coverTone}
        />
        <span className="bg-paper-elevated text-action-strong shadow-card absolute right-3 bottom-3 grid size-11 place-items-center rounded-full opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100">
          <Icon className="size-5" name="play" />
          <span className="sr-only">Play {audiobook.title}</span>
        </span>
      </Link>
      <div className="flex min-w-0 flex-col gap-1">
        <Link
          className="hover:text-action-strong focus-visible:ring-focus rounded-control w-fit max-w-full truncate font-semibold focus-visible:ring-2 focus-visible:outline-none"
          href={`/app/audiobooks/${audiobook.id}`}
        >
          {audiobook.title}
        </Link>
        <p className="text-ink-muted truncate text-sm">{audiobook.author}</p>
        <div className="mt-2 flex items-center gap-2">
          <div
            aria-label={`${audiobook.progressPercent}% listened`}
            aria-valuemax={100}
            aria-valuemin={0}
            aria-valuenow={audiobook.progressPercent}
            className="bg-border h-1.5 flex-1 overflow-hidden rounded-full"
            role="progressbar"
          >
            <div
              className={`bg-action h-full rounded-full ${
                audiobook.progressPercent === 0
                  ? "w-0"
                  : audiobook.progressPercent < 25
                    ? "w-1/5"
                    : audiobook.progressPercent < 50
                      ? "w-2/5"
                      : audiobook.progressPercent < 90
                        ? "w-4/5"
                        : "w-full"
              }`}
            />
          </div>
          <span className="text-ink-muted text-xs">
            {audiobook.progressLabel}
          </span>
        </div>
      </div>
    </article>
  );
}

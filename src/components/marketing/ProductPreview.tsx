import BookCover from "@/components/library/BookCover";
import Icon from "@/components/ui/Icon";
import { MOCK_AUDIOBOOKS } from "@/lib/mock/library";

const PREVIEW_BOOKS = MOCK_AUDIOBOOKS.slice(0, 3);

export default function ProductPreview() {
  const primaryBook = PREVIEW_BOOKS[0];

  if (primaryBook === undefined) {
    return null;
  }

  return (
    <div className="relative mx-auto w-full max-w-xl py-8 lg:py-14">
      <div className="bg-action-soft absolute inset-x-8 inset-y-0 -rotate-3 rounded-full opacity-70 blur-3xl" />
      <div className="border-border bg-paper-elevated shadow-float rounded-panel relative overflow-hidden border p-4 sm:p-6">
        <div className="border-border flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2">
            <span className="bg-danger size-2.5 rounded-full" />
            <span className="bg-warning size-2.5 rounded-full" />
            <span className="bg-success size-2.5 rounded-full" />
          </div>
          <span className="text-ink-muted text-xs font-semibold">
            Your library
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 py-6 sm:gap-5">
          {PREVIEW_BOOKS.map((audiobook) => (
            <BookCover
              author={audiobook.author}
              key={audiobook.id}
              title={audiobook.title}
              tone={audiobook.coverTone}
            />
          ))}
        </div>
        <div className="bg-player border-border rounded-card flex items-center gap-3 border p-3 shadow-sm sm:p-4">
          <BookCover
            author={primaryBook.author}
            size="mini"
            title={primaryBook.title}
            tone={primaryBook.coverTone}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">
              {primaryBook.title}
            </p>
            <p className="text-ink-muted truncate text-xs">
              {primaryBook.currentChapter}
            </p>
            <div className="bg-border mt-2 h-1 overflow-hidden rounded-full">
              <div className="bg-action h-full w-2/5 rounded-full" />
            </div>
          </div>
          <span className="bg-ink text-paper-elevated grid size-11 shrink-0 place-items-center rounded-full">
            <Icon className="size-5" name="play" />
          </span>
        </div>
      </div>
      <div className="border-border bg-paper-elevated shadow-card rounded-card absolute -right-2 -bottom-1 flex items-center gap-3 border px-4 py-3 sm:-right-8">
        <span className="bg-action-soft text-action-strong grid size-9 place-items-center rounded-full">
          <Icon className="size-4" name="shield" />
        </span>
        <span className="text-xs font-semibold">Files stay in your Drive</span>
      </div>
    </div>
  );
}

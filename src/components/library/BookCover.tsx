import type { CoverTone } from "@/types/audiobook";

interface BookCoverProps {
  author: string;
  size?: "card" | "hero" | "mini";
  title: string;
  tone: CoverTone;
}

const TONE_CLASSES: Record<CoverTone, string> = {
  amber: "from-cover-amber to-cover-amber-deep text-cover-amber-ink",
  forest: "from-cover-forest to-cover-forest-deep text-paper-elevated",
  ink: "from-cover-ink to-cover-ink-deep text-paper-elevated",
  plum: "from-cover-plum to-cover-plum-deep text-paper-elevated",
  rose: "from-cover-rose to-cover-rose-deep text-cover-rose-ink",
  sky: "from-cover-sky to-cover-sky-deep text-cover-sky-ink",
};

const SIZE_CLASSES = {
  card: "aspect-3/4 w-full rounded-card p-4",
  hero: "aspect-3/4 w-full max-w-64 rounded-panel p-6",
  mini: "size-14 rounded-control p-2",
} as const;

export default function BookCover({
  author,
  size = "card",
  title,
  tone,
}: BookCoverProps) {
  const isMini = size === "mini";

  return (
    <div
      aria-label={`Cover for ${title} by ${author}`}
      className={`${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} shadow-card relative flex shrink-0 flex-col justify-between overflow-hidden bg-linear-to-br`}
      role="img"
    >
      <span className="bg-paper-elevated/35 absolute -top-6 -right-6 size-24 rounded-full" />
      <span className="border-paper-elevated/30 absolute right-4 bottom-4 size-16 rounded-full border" />
      {isMini ? (
        <span className="font-display relative text-sm font-bold">
          {title.charAt(0)}
        </span>
      ) : (
        <>
          <span className="relative text-xs font-semibold tracking-widest uppercase opacity-75">
            Quiet edition
          </span>
          <span className="relative flex flex-col gap-2">
            <span className="font-display text-2xl leading-none font-semibold">
              {title}
            </span>
            <span className="text-xs font-medium opacity-80">{author}</span>
          </span>
        </>
      )}
    </div>
  );
}

import Link from "next/link";

interface BrandMarkProps {
  compact?: boolean;
}

export default function BrandMark({ compact = false }: BrandMarkProps) {
  return (
    <Link
      aria-label="Quiet Library home"
      className="focus-visible:ring-focus rounded-control inline-flex min-h-11 items-center gap-3 focus-visible:ring-2 focus-visible:outline-none"
      href="/"
    >
      <span className="bg-action text-paper-elevated rounded-control font-display grid size-10 place-items-center text-xl font-bold shadow-sm">
        Q
      </span>
      {compact ? null : (
        <span className="font-display text-xl font-semibold tracking-tight">
          Quiet Library
        </span>
      )}
    </Link>
  );
}

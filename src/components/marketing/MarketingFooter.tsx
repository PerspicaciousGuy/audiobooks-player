import Link from "next/link";

import BrandMark from "@/components/brand/BrandMark";

export default function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-border px-page-gutter border-t">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <BrandMark />
        <nav aria-label="Legal links" className="flex items-center gap-5">
          <Link
            className="text-ink-muted hover:text-ink focus-visible:ring-focus rounded-control text-sm focus-visible:ring-2 focus-visible:outline-none"
            href="/privacy"
          >
            Privacy
          </Link>
          <Link
            className="text-ink-muted hover:text-ink focus-visible:ring-focus rounded-control text-sm focus-visible:ring-2 focus-visible:outline-none"
            href="/terms"
          >
            Terms
          </Link>
        </nav>
        <p className="text-ink-muted text-sm">© {currentYear} Quiet Library</p>
      </div>
    </footer>
  );
}

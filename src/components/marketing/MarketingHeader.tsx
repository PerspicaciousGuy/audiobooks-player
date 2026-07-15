import BrandMark from "@/components/brand/BrandMark";
import ActionLink from "@/components/ui/ActionLink";

export default function MarketingHeader() {
  return (
    <header className="px-page-gutter mx-auto flex w-full max-w-7xl items-center justify-between py-5">
      <BrandMark />
      <nav
        aria-label="Public navigation"
        className="flex items-center gap-2 sm:gap-5"
      >
        <a
          className="text-ink-muted hover:text-ink focus-visible:ring-focus rounded-control hidden min-h-11 items-center px-2 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none sm:inline-flex"
          href="#how-it-works"
        >
          How it works
        </a>
        <ActionLink href="/app/onboarding">Connect Drive</ActionLink>
      </nav>
    </header>
  );
}

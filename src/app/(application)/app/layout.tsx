import Link from "next/link";

interface ApplicationLayoutProps {
  children: React.ReactNode;
}

export default function ApplicationLayout({
  children,
}: ApplicationLayoutProps) {
  return (
    <div className="bg-paper text-ink min-h-screen">
      <header className="border-border bg-paper-elevated px-page-gutter border-b py-4">
        <nav
          aria-label="Application navigation"
          className="max-w-content mx-auto flex items-center justify-between gap-4"
        >
          <Link className="font-display text-xl font-semibold" href="/">
            Quiet Library
          </Link>
          <span className="text-ink-muted text-sm">Foundation shell</span>
        </nav>
      </header>
      <main className="max-w-content px-page-gutter mx-auto py-10">
        {children}
      </main>
    </div>
  );
}

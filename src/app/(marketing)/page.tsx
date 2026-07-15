import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Your audiobooks. Your Drive. Your place.",
  description:
    "Quiet Library gives your personal Google Drive audiobooks a private, focused listening home.",
};

export default function LandingPage() {
  return (
    <main className="bg-paper text-ink px-page-gutter min-h-screen py-16">
      <section className="max-w-content mx-auto flex flex-col gap-8">
        <p className="text-action-strong text-sm font-semibold tracking-wide uppercase">
          Phase 0 foundation
        </p>
        <div className="flex max-w-3xl flex-col gap-4">
          <h1 className="font-display text-5xl leading-tight font-semibold sm:text-6xl">
            Your audiobooks. Your Drive. Your place.
          </h1>
          <p className="text-ink-muted max-w-2xl text-lg leading-relaxed">
            The production landing page arrives in Phase 1. This route confirms
            the public shell, typography tokens, and responsive foundation.
          </p>
        </div>
        <Link
          className="bg-action text-paper-elevated hover:bg-action-strong focus-visible:ring-focus rounded-control duration-standard inline-flex min-h-11 w-fit items-center justify-center px-5 font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none"
          href="/app"
        >
          Preview app shell
        </Link>
      </section>
    </main>
  );
}

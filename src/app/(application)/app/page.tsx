import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Library",
  description: "Your private Quiet Library audiobook collection.",
};

export default function ApplicationHomePage() {
  return (
    <section className="border-border bg-paper-elevated shadow-card rounded-card flex max-w-2xl flex-col gap-4 border p-8">
      <p className="text-action-strong text-sm font-semibold tracking-wide uppercase">
        Application route group
      </p>
      <h1 className="font-display text-4xl font-semibold">
        Your library starts here.
      </h1>
      <p className="text-ink-muted leading-relaxed">
        Authentication, Google Drive connection, and the responsive library UI
        are intentionally reserved for their approved implementation phases.
      </p>
    </section>
  );
}

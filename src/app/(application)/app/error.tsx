"use client";

import Icon from "@/components/ui/Icon";

interface ApplicationErrorProps {
  reset: () => void;
}

export default function ApplicationError({ reset }: ApplicationErrorProps) {
  return (
    <section className="border-border bg-paper-elevated rounded-panel mx-auto my-12 flex max-w-2xl flex-col items-center gap-5 border p-8 text-center shadow-sm">
      <span className="bg-action-soft text-action-strong grid size-14 place-items-center rounded-full">
        <Icon className="size-6" name="cloud" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-3xl font-semibold">
          This shelf needs another moment
        </h1>
        <p className="text-ink-muted leading-relaxed">
          The page could not be prepared. Your files and listening progress were
          not changed.
        </p>
      </div>
      <button
        className="bg-action text-paper-elevated hover:bg-action-strong focus-visible:ring-focus rounded-control min-h-11 px-5 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </section>
  );
}

import type { ReactNode } from "react";

interface SectionHeadingProps {
  action?: ReactNode;
  description?: string;
  eyebrow?: string;
  title: string;
}

export default function SectionHeading({
  action,
  description,
  eyebrow,
  title,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        {eyebrow ? (
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-ink-muted leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

import type { ReactNode } from "react";

interface SectionHeadingProps {
  action?: ReactNode;
  description?: string;
  eyebrow?: string;
  level?: 1 | 2;
  title: string;
}

export default function SectionHeading({
  action,
  description,
  eyebrow,
  level = 2,
  title,
}: SectionHeadingProps) {
  const Heading = level === 1 ? "h1" : "h2";

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex max-w-2xl flex-col gap-2">
        {eyebrow ? (
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            {eyebrow}
          </p>
        ) : null}
        <Heading className="font-display text-3xl leading-tight font-semibold sm:text-4xl">
          {title}
        </Heading>
        {description ? (
          <p className="text-ink-muted leading-relaxed">{description}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

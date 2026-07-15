import type { ReactNode } from "react";

import BrandMark from "@/components/brand/BrandMark";
import ActionLink from "@/components/ui/ActionLink";

interface LegalPageProps {
  children: ReactNode;
  description: string;
  title: string;
}

export default function LegalPage({
  children,
  description,
  title,
}: LegalPageProps) {
  return (
    <div className="bg-paper text-ink min-h-screen">
      <header className="px-page-gutter mx-auto flex max-w-5xl items-center justify-between py-6">
        <BrandMark />
        <ActionLink href="/" variant="text">
          Back home
        </ActionLink>
      </header>
      <main className="px-page-gutter mx-auto flex max-w-3xl flex-col gap-10 py-16 sm:py-24">
        <header className="flex flex-col gap-4">
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            Quiet Library
          </p>
          <h1 className="font-display text-5xl font-semibold sm:text-6xl">
            {title}
          </h1>
          <p className="text-ink-muted text-lg leading-relaxed">
            {description}
          </p>
        </header>
        <article className="[&_h2]:font-display [&_p]:text-ink-muted flex flex-col gap-8 [&_h2]:text-2xl [&_h2]:font-semibold [&_p]:leading-relaxed [&_section]:flex [&_section]:flex-col [&_section]:gap-3">
          {children}
        </article>
      </main>
    </div>
  );
}

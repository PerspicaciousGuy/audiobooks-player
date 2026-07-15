import type { Metadata } from "next";

import BrandMark from "@/components/brand/BrandMark";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Sign-in problem",
  description: "A safe authentication failure screen for Quiet Library.",
};

export default function AuthenticationErrorPage() {
  return (
    <main className="bg-paper px-page-gutter grid min-h-screen place-items-center py-12">
      <section className="border-border bg-paper-elevated shadow-card rounded-panel flex w-full max-w-xl flex-col items-center gap-6 border p-8 text-center sm:p-12">
        <BrandMark />
        <span className="bg-action-soft text-action-strong grid size-16 place-items-center rounded-full">
          <Icon className="size-7" name="cloud" />
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-4xl font-semibold">
            Sign-in was not completed
          </h1>
          <p className="text-ink-muted leading-relaxed">
            Nothing was changed. You can try again, or return home and continue
            learning how Quiet Library handles your files.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ActionLink href="/app/onboarding">Try again</ActionLink>
          <ActionLink href="/" variant="secondary">
            Return home
          </ActionLink>
        </div>
      </section>
    </main>
  );
}

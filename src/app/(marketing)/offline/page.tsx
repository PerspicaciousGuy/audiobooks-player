import type { Metadata } from "next";

import BrandMark from "@/components/brand/BrandMark";
import OfflineLibraryManager from "@/components/offline/OfflineLibraryManager";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "You are offline",
  description: "Quiet Library could not reach the network.",
};

export default function PublicOfflinePage() {
  return (
    <main className="bg-paper px-page-gutter flex min-h-screen flex-col items-center justify-center gap-8 py-12">
      <section className="border-border bg-paper-elevated shadow-card rounded-panel flex max-w-xl flex-col items-center gap-6 border p-8 text-center sm:p-12">
        <BrandMark />
        <span className="bg-action-soft text-action-strong grid size-16 place-items-center rounded-full">
          <Icon className="size-7" name="download" />
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-4xl font-semibold">
            A quiet moment offline
          </h1>
          <p className="text-ink-muted leading-relaxed">
            The network is unavailable. Books downloaded on this device remain
            playable from the offline library.
          </p>
        </div>
        <ActionLink href="/" variant="secondary">
          Try the network again
        </ActionLink>
      </section>
      <section className="w-full max-w-3xl py-8">
        <OfflineLibraryManager />
      </section>
    </main>
  );
}

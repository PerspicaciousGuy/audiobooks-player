import type { ReactNode } from "react";

import ApplicationNavigation from "@/components/application/ApplicationNavigation";
import BrandMark from "@/components/brand/BrandMark";
import NowPlayingBar from "@/components/player/NowPlayingBar";
import Icon from "@/components/ui/Icon";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-paper text-ink min-h-screen">
      <a
        className="bg-ink text-paper-elevated focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:px-4 focus:py-3"
        href="#main-content"
      >
        Skip to content
      </a>
      <aside className="border-border bg-paper-elevated fixed inset-y-0 left-0 z-30 hidden w-72 flex-col border-r px-6 py-7 lg:flex">
        <BrandMark />
        <div className="mt-10">
          <ApplicationNavigation mode="desktop" />
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <div className="bg-action-soft rounded-card flex flex-col gap-3 p-4">
            <span className="text-action-strong flex items-center gap-2 text-xs font-bold tracking-wider uppercase">
              <Icon className="size-4" name="cloud" />
              Drive connected
            </span>
            <p className="text-ink-muted text-xs leading-relaxed">
              Six books are available. Your audio remains in Google Drive.
            </p>
          </div>
          <div className="border-border flex items-center gap-3 border-t pt-4">
            <span className="bg-cover-plum text-paper-elevated grid size-10 place-items-center rounded-full text-sm font-bold">
              PG
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">Your library</p>
              <p className="text-ink-muted truncate text-xs">Private account</p>
            </div>
          </div>
        </div>
      </aside>
      <header className="border-border bg-paper/95 sticky top-0 z-20 flex h-18 items-center justify-between border-b px-4 backdrop-blur lg:hidden">
        <BrandMark compact />
        <p className="font-display text-lg font-semibold">Quiet Library</p>
        <button
          aria-label="Open account menu"
          className="focus-visible:ring-focus rounded-control grid size-11 place-items-center focus-visible:ring-2 focus-visible:outline-none"
          type="button"
        >
          <Icon className="size-5" name="menu" />
        </button>
      </header>
      <main
        className="px-page-gutter mx-auto max-w-screen-2xl pb-48 lg:ml-72 lg:pb-36"
        id="main-content"
      >
        {children}
      </main>
      <NowPlayingBar />
      <ApplicationNavigation mode="mobile" />
    </div>
  );
}

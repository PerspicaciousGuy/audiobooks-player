import ActionLink from "@/components/ui/ActionLink";
import Icon, { type IconName } from "@/components/ui/Icon";

type CollectionStateVariant = "empty" | "error" | "loading" | "offline";

interface CollectionStateProps {
  variant: CollectionStateVariant;
}

interface StateCopy {
  action: string;
  description: string;
  href: string;
  icon: IconName;
  title: string;
}

const STATE_COPY: Record<
  Exclude<CollectionStateVariant, "loading">,
  StateCopy
> = {
  empty: {
    action: "Add from Google Drive",
    description:
      "Choose only the audiobook files you want Quiet Library to access. Nothing else in your Drive is scanned.",
    href: "/app/onboarding",
    icon: "plus",
    title: "Your shelves are waiting",
  },
  error: {
    action: "Try again",
    description:
      "We could not load this collection. Your files and saved listening position are still safe.",
    href: "/app/library",
    icon: "cloud",
    title: "The library could not be reached",
  },
  offline: {
    action: "View downloads",
    description:
      "This book is not on this device yet. Reconnect to stream it or choose a downloaded title.",
    href: "/app/offline",
    icon: "download",
    title: "No offline copy found",
  },
};

function LoadingState() {
  return (
    <div
      aria-label="Loading library"
      className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
      role="status"
    >
      {Array.from({ length: 4 }, (_, index) => `skeleton-${index + 1}`).map(
        (skeletonId) => (
          <div
            className="flex animate-pulse flex-col gap-4 motion-reduce:animate-none"
            key={skeletonId}
          >
            <div className="bg-surface-muted rounded-card aspect-3/4" />
            <div className="bg-surface-muted h-4 w-4/5 rounded-full" />
            <div className="bg-surface-muted h-3 w-2/5 rounded-full" />
          </div>
        ),
      )}
      <span className="sr-only">Loading your audiobooks</span>
    </div>
  );
}

export default function CollectionState({ variant }: CollectionStateProps) {
  if (variant === "loading") {
    return <LoadingState />;
  }

  const state = STATE_COPY[variant];

  return (
    <section className="border-border bg-paper-elevated rounded-panel flex min-h-96 flex-col items-center justify-center gap-5 border p-8 text-center shadow-sm">
      <span className="bg-action-soft text-action-strong grid size-14 place-items-center rounded-full">
        <Icon className="size-6" name={state.icon} />
      </span>
      <div className="flex max-w-lg flex-col gap-2">
        <h2 className="font-display text-3xl font-semibold">{state.title}</h2>
        <p className="text-ink-muted leading-relaxed">{state.description}</p>
      </div>
      <ActionLink href={state.href}>{state.action}</ActionLink>
    </section>
  );
}

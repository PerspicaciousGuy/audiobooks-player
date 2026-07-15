import Link from "next/link";

import Icon from "@/components/ui/Icon";
import { signOut } from "@/features/auth/actions";

export default function MobileAccountMenu({ label }: { label: string }) {
  return (
    <details className="group relative">
      <summary className="focus-visible:ring-focus rounded-control grid size-11 cursor-pointer list-none place-items-center focus-visible:ring-2 focus-visible:outline-none [&::-webkit-details-marker]:hidden">
        <span className="sr-only">Open account menu</span>
        <Icon className="size-5" name="menu" />
      </summary>
      <div className="border-border bg-paper-elevated shadow-card rounded-card absolute top-13 right-0 flex w-64 flex-col gap-2 border p-3">
        <p className="text-ink-muted truncate px-3 py-2 text-xs">{label}</p>
        <Link
          className="hover:bg-surface-muted rounded-control min-h-11 px-3 py-3 text-sm font-semibold"
          href="/app/settings"
        >
          Account settings
        </Link>
        <form action={signOut}>
          <button
            className="text-danger hover:bg-danger/10 rounded-control min-h-11 w-full px-3 text-left text-sm font-semibold"
            type="submit"
          >
            Sign out
          </button>
        </form>
      </div>
    </details>
  );
}

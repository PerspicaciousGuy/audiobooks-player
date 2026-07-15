"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import Icon, { type IconName } from "@/components/ui/Icon";

interface ApplicationNavigationProps {
  mode: "desktop" | "mobile";
}

interface NavigationItem {
  href: string;
  icon: IconName;
  label: string;
}

const NAVIGATION_ITEMS: readonly NavigationItem[] = [
  { href: "/app", icon: "home", label: "Home" },
  { href: "/app/library", icon: "library", label: "Library" },
  { href: "/app/offline", icon: "download", label: "Offline" },
  { href: "/app/settings", icon: "settings", label: "Settings" },
];

function isItemActive(pathname: string, href: string): boolean {
  if (href === "/app") {
    return pathname === href;
  }

  return pathname.startsWith(href);
}

export default function ApplicationNavigation({
  mode,
}: ApplicationNavigationProps) {
  const pathname = usePathname();
  const isMobile = mode === "mobile";

  return (
    <nav
      aria-label={isMobile ? "Mobile navigation" : "Primary navigation"}
      className={
        isMobile
          ? "border-border bg-paper-elevated fixed right-0 bottom-0 left-0 z-40 grid h-20 grid-cols-4 border-t px-2 lg:hidden"
          : "flex flex-col gap-1"
      }
    >
      {NAVIGATION_ITEMS.map((item) => {
        const isActive = isItemActive(pathname, item.href);

        return (
          <Link
            aria-current={isActive ? "page" : undefined}
            className={
              isMobile
                ? `${isActive ? "text-action-strong" : "text-ink-muted"} focus-visible:ring-focus rounded-control flex min-h-11 flex-col items-center justify-center gap-1 text-xs font-semibold focus-visible:ring-2 focus-visible:outline-none`
                : `${isActive ? "bg-action-soft text-action-strong" : "text-ink-muted hover:bg-surface-muted hover:text-ink"} focus-visible:ring-focus rounded-control duration-fast flex min-h-11 items-center gap-3 px-4 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none`
            }
            href={item.href}
            key={item.href}
          >
            <Icon className="size-5" name={item.icon} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}

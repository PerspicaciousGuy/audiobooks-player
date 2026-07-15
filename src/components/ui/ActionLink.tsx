import type { ReactNode } from "react";
import Link from "next/link";

type ActionLinkVariant = "primary" | "secondary" | "text";

interface ActionLinkProps {
  children: ReactNode;
  href: string;
  icon?: ReactNode;
  variant?: ActionLinkVariant;
}

const VARIANT_CLASSES: Record<ActionLinkVariant, string> = {
  primary: "bg-action text-paper-elevated shadow-card hover:bg-action-strong",
  secondary:
    "border-border bg-paper-elevated text-ink hover:border-action hover:text-action-strong border",
  text: "text-ink hover:text-action-strong",
};

export default function ActionLink({
  children,
  href,
  icon,
  variant = "primary",
}: ActionLinkProps) {
  return (
    <Link
      className={`${VARIANT_CLASSES[variant]} focus-visible:ring-focus rounded-control duration-standard inline-flex min-h-11 items-center justify-center gap-2 px-5 text-sm font-semibold transition-colors focus-visible:ring-2 focus-visible:outline-none`}
      href={href}
    >
      {children}
      {icon}
    </Link>
  );
}

import type { ReactNode } from "react";

interface SettingRowProps {
  action: ReactNode;
  description: string;
  title: string;
}

export default function SettingRow({
  action,
  description,
  title,
}: SettingRowProps) {
  return (
    <div className="flex min-h-20 items-center justify-between gap-5 py-4">
      <div className="flex max-w-xl flex-col gap-1">
        <h3 className="text-sm font-semibold">{title}</h3>
        <p className="text-ink-muted text-xs leading-relaxed">{description}</p>
      </div>
      {action}
    </div>
  );
}

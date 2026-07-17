import type { SelectedDriveFolder } from "@/features/drive/contracts";

interface SelectedDriveFolderPanelProps {
  folder: SelectedDriveFolder;
}

export default function SelectedDriveFolderPanel({
  folder,
}: SelectedDriveFolderPanelProps) {
  return (
    <section className="border-border bg-paper-elevated rounded-card flex flex-col gap-4 border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">{folder.name}</p>
        <p className="text-ink-muted mt-1 text-xs">
          Google Picker opens here. Select up to 25 audiobook files directly
          inside this folder.
        </p>
      </div>
      <span className="text-action-strong text-sm font-semibold">
        Folder selected
      </span>
    </section>
  );
}

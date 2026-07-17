import type { SelectedDriveFolder } from "@/features/drive/contracts";

interface SelectedDriveFolderPanelProps {
  folder: SelectedDriveFolder;
  isScanning: boolean;
  onScan: () => Promise<void>;
}

export default function SelectedDriveFolderPanel({
  folder,
  isScanning,
  onScan,
}: SelectedDriveFolderPanelProps) {
  return (
    <section className="border-border bg-paper-elevated rounded-card flex flex-col gap-4 border p-5 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm font-semibold">{folder.name}</p>
        <p className="text-ink-muted mt-1 text-xs">
          Only supported audio inside this folder and its subfolders is scanned.
        </p>
      </div>
      <button
        className="border-border hover:border-action rounded-control min-h-11 px-4 text-sm font-semibold disabled:opacity-60"
        disabled={isScanning}
        onClick={() => void onScan()}
        type="button"
      >
        {isScanning ? "Scanning…" : "Scan Audiobooks folder"}
      </button>
    </section>
  );
}

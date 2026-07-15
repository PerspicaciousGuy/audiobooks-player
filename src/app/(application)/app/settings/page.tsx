import type { Metadata } from "next";

import SettingRow from "@/components/settings/SettingRow";
import Icon from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage playback, Drive, privacy, and account preferences.",
};

function PreviewSwitch({
  isEnabled,
  label,
}: {
  isEnabled: boolean;
  label: string;
}) {
  return (
    <button
      aria-label={label}
      aria-pressed={isEnabled}
      className={`${isEnabled ? "bg-action justify-end" : "bg-border justify-start"} focus-visible:ring-focus flex h-7 w-12 shrink-0 items-center rounded-full p-1 focus-visible:ring-2 focus-visible:outline-none`}
      type="button"
    >
      <span className="bg-paper-elevated size-5 rounded-full shadow-sm" />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-10 py-8 sm:py-10 lg:py-12">
      <SectionHeading
        description="Choose how Quiet Library behaves on this device and across your account."
        eyebrow="Preferences"
        title="Make the room your own"
      />

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold">Playback</h2>
        <div className="divide-border border-border bg-paper-elevated rounded-card divide-y border px-5">
          <SettingRow
            action={
              <button
                className="border-border rounded-control min-h-11 border px-3 text-sm font-semibold"
                type="button"
              >
                1×
              </button>
            }
            description="Applied when a book does not have its own saved speed."
            title="Default playback speed"
          />
          <SettingRow
            action={<PreviewSwitch isEnabled label="Sync progress enabled" />}
            description="Keep the latest accepted listening position available on your other devices."
            title="Sync listening progress"
          />
          <SettingRow
            action={<PreviewSwitch isEnabled label="Skip silence enabled" />}
            description="A visual preference preview; audio processing arrives with the player phase."
            title="Skip long silence"
          />
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold">Google Drive</h2>
        <div className="border-border bg-paper-elevated rounded-card flex flex-col gap-5 border p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="bg-action-soft text-action-strong grid size-11 shrink-0 place-items-center rounded-full">
              <Icon className="size-5" name="cloud" />
            </span>
            <div>
              <p className="text-sm font-semibold">Drive connected</p>
              <p className="text-ink-muted mt-1 text-xs leading-relaxed">
                Six selected audiobook records. Source audio remains in Drive.
              </p>
            </div>
          </div>
          <button
            className="border-border hover:border-action rounded-control min-h-11 border px-4 text-sm font-semibold"
            type="button"
          >
            Reconnect
          </button>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl font-semibold">Appearance</h2>
        <div className="divide-border border-border bg-paper-elevated rounded-card divide-y border px-5">
          <SettingRow
            action={
              <PreviewSwitch isEnabled={false} label="Dark theme disabled" />
            }
            description="Use the warm light theme, or switch to the low-light palette."
            title="Dark theme"
          />
          <SettingRow
            action={
              <PreviewSwitch
                isEnabled
                label="Reduced interface motion enabled"
              />
            }
            description="Keeps navigation and player transitions calm and restrained."
            title="Reduce interface motion"
          />
        </div>
      </section>

      <section className="border-danger/35 bg-danger/5 rounded-card flex flex-col gap-5 border p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex max-w-xl flex-col gap-1">
          <h2 className="font-display text-2xl font-semibold">
            Account and privacy
          </h2>
          <p className="text-ink-muted text-sm leading-relaxed">
            Deleting your account removes Quiet Library metadata and revokes
            stored credentials. It never deletes your Google Drive files.
          </p>
        </div>
        <button
          className="border-danger text-danger hover:bg-danger hover:text-paper-elevated focus-visible:ring-danger rounded-control min-h-11 border px-4 text-sm font-semibold focus-visible:ring-2 focus-visible:outline-none"
          type="button"
        >
          Delete account
        </button>
      </section>
    </div>
  );
}

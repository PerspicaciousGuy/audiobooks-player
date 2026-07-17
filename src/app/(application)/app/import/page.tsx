import type { Metadata } from "next";

import DriveImportFlow from "@/components/imports/DriveImportFlow";
import Icon from "@/components/ui/Icon";
import { getAuthenticatedIdentity } from "@/features/auth/session";
import { getDriveConnection } from "@/features/drive/repository";
import { environment } from "@/lib/config/environment";

export const metadata: Metadata = {
  title: "Import audiobooks",
  description: "Choose, review, and import audiobook files from Google Drive.",
};

export default async function ImportPage() {
  const apiKey = environment.googlePickerApiKey;
  const projectNumber = environment.googleCloudProjectNumber;
  const identity = await getAuthenticatedIdentity();
  const driveConnection = identity
    ? await getDriveConnection(identity.id)
    : undefined;
  const selectedFolder = driveConnection?.selectedFolder ?? undefined;

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-8 py-8 sm:py-12">
      <header className="flex flex-col gap-4">
        <span className="bg-action-soft text-action-strong grid size-14 place-items-center rounded-full">
          <Icon className="size-6" name="cloud" />
        </span>
        <div>
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            Google Drive import
          </p>
          <h1 className="font-display mt-2 text-4xl font-semibold sm:text-5xl">
            Bring in your Audiobooks folder
          </h1>
        </div>
        <p className="text-ink-muted max-w-2xl leading-relaxed">
          Create a folder named Audiobooks in Google Drive, select it once, and
          Quiet Library will scan supported audio in that folder and its
          subfolders. Source files are never changed.
        </p>
      </header>

      {apiKey && projectNumber ? (
        <DriveImportFlow
          apiKey={apiKey}
          projectNumber={projectNumber}
          {...(selectedFolder ? { initialFolder: selectedFolder } : {})}
        />
      ) : (
        <p className="border-border bg-paper-elevated rounded-card border p-5 text-sm leading-relaxed">
          Google Picker is unavailable in preview mode. Configure the Drive
          integration values to test a real import.
        </p>
      )}
    </div>
  );
}

import type { Metadata } from "next";

import LegalPage from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Quiet Library handles your files, identity, and listening data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      description="A plain-language preview of the privacy model that will govern the finished product."
      title="Privacy by design"
    >
      <section>
        <h2>Your audio stays yours</h2>
        <p>
          Quiet Library streams only the Google Drive files you explicitly
          select. Source audio is not copied into Quiet Library server storage.
          Offline copies remain on the device where you requested them.
        </p>
      </section>
      <section>
        <h2>What the service stores</h2>
        <p>
          The service stores account details, selected-file metadata, book
          organization, listening progress, bookmarks, preferences, and an
          encrypted credential needed to access the files you selected.
        </p>
      </section>
      <section>
        <h2>Your controls</h2>
        <p>
          You can disconnect Google Drive, clear device downloads, or delete
          your Quiet Library account. Account deletion removes application
          metadata and credentials; it never deletes files from Google Drive.
        </p>
      </section>
    </LegalPage>
  );
}

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
      description="How Quiet Library handles identity, your selected folder, listening data, and device downloads."
      title="Privacy by design"
    >
      <section>
        <h2>Your audio stays yours</h2>
        <p>
          Quiet Library scans only the Google Drive folder you explicitly select
          and streams supported audio found there. Source audio is not copied
          into Quiet Library server storage. Offline copies remain on the device
          where you requested them.
        </p>
      </section>
      <section>
        <h2>What the service stores</h2>
        <p>
          The service stores account details, the selected folder ID, imported
          file metadata, book organization, listening progress, bookmarks,
          preferences, and an encrypted credential needed to access the files
          you selected.
        </p>
      </section>
      <section>
        <h2>Device downloads</h2>
        <p>
          Downloads you request are stored in this browser profile using device
          storage. They are not uploaded to Quiet Library. You can remove one
          book or clear all downloads from the offline page; browser storage
          controls can also remove them.
        </p>
      </section>
      <section>
        <h2>Operational records</h2>
        <p>
          Security and reliability events record an operation, outcome, status,
          and timestamp. They are designed not to include access tokens, Drive
          file names, audiobook titles, email addresses, or listening positions.
          Production log retention must be configured and documented by the
          operator before launch.
        </p>
      </section>
      <section>
        <h2>Your controls</h2>
        <p>
          You can disconnect Google Drive, clear device downloads, or delete
          your Quiet Library account. Account deletion removes application
          metadata and credentials; it never deletes files from Google Drive.
          The live database records are removed through account-cascade rules.
          Any managed backups expire according to the hosting provider’s
          configured retention policy.
        </p>
      </section>
    </LegalPage>
  );
}

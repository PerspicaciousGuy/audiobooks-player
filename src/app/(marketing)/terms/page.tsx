import type { Metadata } from "next";

import LegalPage from "@/components/marketing/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "The preview terms for using Quiet Library.",
};

export default function TermsPage() {
  return (
    <LegalPage
      description="These preview terms describe the intended boundaries of the personal audiobook service."
      title="Terms of use"
    >
      <section>
        <h2>Your files and rights</h2>
        <p>
          Use Quiet Library only with files you are permitted to access and
          play. The service does not sell, license, or provide audiobook files.
        </p>
      </section>
      <section>
        <h2>Service availability</h2>
        <p>
          Playback depends on Google Drive availability, browser media support,
          network conditions, and device storage. Unsupported or protected files
          may not play.
        </p>
      </section>
      <section>
        <h2>Account responsibilities</h2>
        <p>
          Keep your Google account secure and disconnect access if a device or
          session is no longer trusted. Quiet Library provides controls for
          revoking Drive access, clearing device downloads, and deleting stored
          application metadata.
        </p>
      </section>
      <section>
        <h2>Local downloads</h2>
        <p>
          Offline copies are available to anyone who can access the same
          unlocked browser profile or device account. You are responsible for
          the device’s security and for removing downloads before transferring
          or disposing of the device.
        </p>
      </section>
    </LegalPage>
  );
}

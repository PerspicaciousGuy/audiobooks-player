import type { Metadata } from "next";

import OfflineLibraryManager from "@/components/offline/OfflineLibraryManager";
import SectionHeading from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "Offline",
  description: "Manage audiobook downloads stored on this device.",
};

export default function OfflinePage() {
  return (
    <div className="flex flex-col gap-10 py-8 sm:py-10 lg:py-12">
      <SectionHeading
        description="Completed downloads stay on this browser profile and can be removed at any time. Source files remain unchanged in Drive."
        eyebrow="Device storage"
        title="Listen beyond the signal"
      />
      <OfflineLibraryManager />
    </div>
  );
}

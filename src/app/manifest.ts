import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#f8f1e5",
    description:
      "A private audiobook player for books selected from your Google Drive.",
    display: "standalone",
    icons: [
      {
        purpose: "maskable",
        sizes: "192x192",
        src: "/icons/icon-192.svg",
        type: "image/svg+xml",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icons/icon-512.svg",
        type: "image/svg+xml",
      },
    ],
    id: "/app",
    name: "Quiet Library",
    orientation: "any",
    scope: "/",
    short_name: "Quiet Library",
    shortcuts: [
      { name: "My library", url: "/app/library" },
      { name: "Offline books", url: "/app/offline" },
    ],
    start_url: "/app",
    theme_color: "#3f352d",
  };
}

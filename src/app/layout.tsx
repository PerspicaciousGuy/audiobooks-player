import type { Metadata } from "next";

import { environment } from "@/lib/config/environment";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(environment.appUrl),
  title: {
    default: "Quiet Library",
    template: "%s | Quiet Library",
  },
  description:
    "A private, installable audiobook player for books stored in your Google Drive.",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

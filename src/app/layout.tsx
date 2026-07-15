import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";

import PwaManager from "@/components/pwa/PwaManager";
import { environment } from "@/lib/config/environment";

import "./globals.css";

const displayFont = Cormorant_Garamond({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-editorial",
  weight: ["500", "600", "700"],
});

const bodyFont = Manrope({
  display: "swap",
  subsets: ["latin"],
  variable: "--font-interface",
});

export const metadata: Metadata = {
  metadataBase: new URL(environment.appUrl),
  title: {
    default: "Quiet Library",
    template: "%s | Quiet Library",
  },
  description:
    "A private, installable audiobook player for books stored in your Google Drive.",
  icons: {
    icon: "/icons/icon-192.svg",
  },
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#3f352d",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html className={`${displayFont.variable} ${bodyFont.variable}`} lang="en">
      <body>
        {children}
        <PwaManager />
      </body>
    </html>
  );
}

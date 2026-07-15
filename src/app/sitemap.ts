import type { MetadataRoute } from "next";

import { environment } from "@/lib/config/environment";

export default function sitemap(): MetadataRoute.Sitemap {
  const publicRoutes = ["", "/privacy", "/terms"] as const;

  return publicRoutes.map((route) => ({
    changeFrequency: "monthly",
    lastModified: new Date(),
    priority: route === "" ? 1 : 0.5,
    url: `${environment.appUrl}${route}`,
  }));
}

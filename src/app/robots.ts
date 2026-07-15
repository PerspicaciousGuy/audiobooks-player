import type { MetadataRoute } from "next";

import { environment } from "@/lib/config/environment";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        allow: ["/", "/privacy", "/terms"],
        disallow: ["/app/", "/api/", "/auth/"],
        userAgent: "*",
      },
    ],
    sitemap: `${environment.appUrl}/sitemap.xml`,
  };
}

import type { MetadataRoute } from "next";

// Keep in sync with layout.tsx (metadataBase) and sitemap.ts.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.iskconkakinada.org";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

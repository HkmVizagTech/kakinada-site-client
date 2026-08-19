import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://harekrishnavizag.org";
const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/founder`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/sevas`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/gallery`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${SITE_URL}/events`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/blogs`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/daily-schedule`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/important-dates`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${SITE_URL}/subhojanam`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/anna-daan-seva`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/gau-seva`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/gita-daan-seva`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/alankara-vastra-seva`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/donations`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${SITE_URL}/janmashtami`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/privacy-policy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/terms-and-conditions`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/refund-policy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  // Dynamic: published blog posts
  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${API_URL}/blogs?limit=50`, { next: { revalidate: 3600 } });
    if (res.ok) {
      const data = await res.json();
      blogPages = (data.blogs || []).map((b: any) => ({
        url: `${SITE_URL}/blogs/${b.slug}`,
        lastModified: b.updatedAt ? new Date(b.updatedAt) : undefined,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      }));
    }
  } catch {}

  return [...staticPages, ...blogPages];
}

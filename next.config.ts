import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Smaller images for browsers that support them (falls back to webp/original
  // automatically); Next negotiates via the Accept header per request.
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.harekrishnavizag.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "harekrishnavizag.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      // Cloudflare R2 — hkmsite-media bucket public URL (Vizag shared assets)
      {
        protocol: "https",
        hostname: "pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev",
        pathname: "/**",
      },
      // Cloudflare R2 — ISKCON Kakinada bucket
      {
        protocol: "https",
        hostname: "pub-a141ba4729a546b29a5015432b31bd23.r2.dev",
        pathname: "/**",
      },
      // Cloudflare R2 — Temple Images bucket (campaigner pages)
      {
        protocol: "https",
        hostname: "pub-f62a54aab54448388c9e16334109aea9.r2.dev",
        pathname: "/**",
      },
      // Gupt Vrindavan Dham — donor privilege images
      {
        protocol: "https",
        hostname: "guptvrindavandham.org",
        pathname: "/**",
      },
    ],
  },
  // Ensures per-icon tree-shaking for large barrel-export libraries so a
  // page importing 3 icons doesn't pull the whole package into its bundle.
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },
  // SEO: these 6 sevas now have dedicated, purpose-built pages (richer
  // content, proper metadata/H1/structured data) that fully replace their
  // old generic /donate/[slug] listing. Leaving both URLs live for the same
  // content splits search authority between two competing pages instead of
  // consolidating it onto one (keyword cannibalization) — a real-world
  // ranking penalty for exactly the queries we want these pages to win.
  // 301s here merge any existing backlinks/index signal from the old URL
  // into the new page and stop Google indexing both.
  async redirects() {
    return [
      { source: "/donate/gau-seva", destination: "/gau-seva", permanent: true },
      { source: "/donate/anna-daan-seva", destination: "/anna-daan-seva", permanent: true },
      { source: "/donate/gita-daan-seva", destination: "/gita-daan-seva", permanent: true },
      { source: "/donate/vastra-seva", destination: "/alankara-vastra-seva", permanent: true },
    ];
  },
};

export default nextConfig;

import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, Noto_Serif_Devanagari } from "next/font/google";
import VbProviders from "@/components/vanabhojanam/VbProviders";

// Display serif for headings, a clean sans for body copy, and Devanagari for the maha-mantra.
const heading = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-vb-heading",
  display: "swap",
});
const body = Inter({ subsets: ["latin"], variable: "--font-vb-body", display: "swap" });
const deva = Noto_Serif_Devanagari({ subsets: ["devanagari"], weight: ["400", "600"], variable: "--font-vb-deva", display: "swap" });

export const metadata: Metadata = {
  title: "Kartika Vanabhojanam — A Day With Nature & Divine",
  description:
    "Kartika Vanabhojanam by ISKCON Kakinada: a day away from screens with spiritual talks, games, ecstatic kirtan and a shared prasadam feast. Register and get your QR pass on WhatsApp.",
  alternates: { canonical: "/vanabhojanam" },
  openGraph: {
    title: "Kartika Vanabhojanam — A Day With Nature & Divine",
    description: "A day in nature with spiritual talks, games, kirtan and prasadam, by ISKCON Kakinada.",
    images: ["/vanabhojanam/forest-v1.webp"],
  },
};

export default function VanabhojanamLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`vb-root ${heading.variable} ${body.variable} ${deva.variable} font-vb-body min-h-screen bg-vb-page text-gray-800 antialiased`}
      style={{ colorScheme: "light" }}
    >
      <VbProviders>{children}</VbProviders>
    </div>
  );
}

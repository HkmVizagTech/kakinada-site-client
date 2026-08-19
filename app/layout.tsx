import type { Metadata } from "next";
import { Poppins, Playfair_Display } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "@/components/ui/toaster";
import ReduxProvider from "@/components/ReduxProvider";
import MetaPixel from "@/components/MetaPixel";
import ThemeProvider from "@/components/ThemeProvider";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-playfair",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://harekrishnavizag.org";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ISKCON Kakinada | Hare Krishna Movement Kakinada",
    template: "%s · ISKCON Kakinada",
  },
  description: "ISKCON Kakinada (Hare Krishna Movement, Kakinada) — spreading the timeless message of Lord Krishna through devotion, service, and community. Daily darshan, prasadam, festivals, and spiritual programs in Kakinada.",
  keywords: ["ISKCON Kakinada", "Hare Krishna Kakinada", "Hare Krishna Movement Kakinada", "Hare Krishna", "ISKCON", "Kakinada", "Temple", "Spiritual", "Krishna", "Prabhupada"],
  // NOTE: no sitewide `alternates.canonical` here on purpose. It was
  // previously set to "/" at this root level, which Next.js's metadata
  // merging then applied to EVERY page that didn't explicitly override
  // it — meaning every subpage on the site was telling Google "the
  // homepage is the canonical version of this content," actively
  // suppressing them from ranking independently. Confirmed live across
  // multiple pages before this fix. Canonical is now set per-page
  // instead (see app/page.tsx for the homepage's own).
  openGraph: {
    title: "ISKCON Kakinada | Hare Krishna Movement Kakinada",
    description: "ISKCON Kakinada (Hare Krishna Movement, Kakinada) — daily darshan, prasadam, festivals, and spiritual programs.",
    type: "website",
    locale: "en_IN",
    siteName: "ISKCON Kakinada",
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "ISKCON Kakinada | Hare Krishna Movement Kakinada",
    description: "Spreading the timeless message of Lord Krishna through devotion, service, and community.",
  },
  robots: { index: true, follow: true },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "HinduTemple",
  name: "ISKCON Gambheeram Visakhapatnam",
  alternateName: [
    "Hare Krishna Movement Visakhapatnam",
    "Hare Krishna Vaikuntham",
    "ISKCON Gambheeram",
    "ISKCON Vizag",
    "Hare Krishna Movement Vizag",
  ],
  description: "ISKCON Gambheeram Visakhapatnam, also known as Hare Krishna Movement Vizag, is a center of the International Society for Krishna Consciousness serving the Gambheeram area of Visakhapatnam since 2008.",
  url: SITE_URL,
  foundingDate: "2008",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Chaitanya Bhavan, Hare Krishna Vaikuntam Cultural Centre, IIM Rd, opp. Akshaya Patra Foundation, Gambhiram",
    addressLocality: "Visakhapatnam",
    addressRegion: "Andhra Pradesh",
    postalCode: "531163",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 17.8791762,
    longitude: 83.372373,
  },
  telephone: "+91 89777 61187",
  email: "social@hkmvizag.org",
  // Real opening pattern (three blocks — the deities rest midday), not a
  // single continuous window. Matches /daily-schedule exactly.
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "04:30", closes: "05:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "07:15", closes: "12:20" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"], opens: "16:15", closes: "20:15" },
  ],
  // Links Google's Knowledge Graph entity to our real, active social
  // profiles — a genuine local-SEO signal, distinct from (and in support
  // of) claiming/verifying the actual Google Business Profile listing.
  sameAs: [
    "https://www.facebook.com/hkm.vizag/",
    "https://www.instagram.com/harekrishnavizag/",
    "https://www.youtube.com/user/harekrishnavizag",
    "https://x.com/hkm_vizag",
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is this ISKCON Kakinada?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. This is ISKCON Kakinada, also known as Hare Krishna Movement Kakinada. We are a center of the International Society for Krishna Consciousness (ISKCON), serving the community.",
      },
    },
    {
      "@type": "Question",
      name: "Where is ISKCON Kakinada located?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "ISKCON Kakinada is located in Kakinada, Andhra Pradesh.",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
  <html lang="en" className={`h-full antialiased overflow-x-hidden ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XVDQNJK24G"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XVDQNJK24G');
          `}
        </Script>
      </head>
      <body className={`${poppins.className} min-h-full flex flex-col overflow-x-hidden pb-[60px] lg:pb-0`}>
        <MetaPixel />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <ReduxProvider>
          <ThemeProvider>
            <AuthProvider>
              {children}
              <Toaster />
            </AuthProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}

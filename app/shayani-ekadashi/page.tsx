import type { Metadata } from "next";
import ShayaniEkadashiClient from "@/components/ekadashi-campaign/ShayaniEkadashiClient";

export const metadata: Metadata = {
  title: "Shayani Ekadashi Seva | ISKCON Kakinada",
  description:
    "Donate on Shayani Ekadashi (Ashadhi Ekadashi) as Lord Vishnu begins His four months of divine rest. Sponsor seva at the ISKCON Kakinada on one of the year's most sacred days.",
  openGraph: {
    title: "Shayani Ekadashi Seva — ISKCON Kakinada",
    description:
      "Offer seva on Shayani Ekadashi at the ISKCON Kakinada. Your donation sustains daily worship, sacred bhog, and festive arrangements during Chaturmas.",
    type: "website",
    images: [
      {
        url: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/ekadashi-posters/ad%20poster%201%2016-9%20%20final%20.jpg.webp",
        width: 1200,
        height: 630,
        alt: "Shayani Ekadashi Seva — ISKCON Kakinada",
      },
    ],
  },
};

export default function ShayaniEkadashiPage() {
  return <ShayaniEkadashiClient />;
}

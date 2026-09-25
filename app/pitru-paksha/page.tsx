import { Suspense } from "react";
import PitruPakshaClient from "@/components/pitru-paksha/PitruPakshaClient";

export const metadata = {
  title: "Pitru Paksha Sevas | ISKCON Kakinada",
  description:
    "Honour your ancestors this Pitru Paksha — offer Annadana, Sadhu Bhojan and Gau Seva online at ISKCON Kakinada.",
  alternates: { canonical: "/pitru-paksha" },
  openGraph: {
    title: "Pitru Paksha Sevas — ISKCON Kakinada",
    description:
      "Pay homage to your forefathers this Pitru Paksha. Offer Annadana, Sadhu Bhojan and Gau Seva with devotion at ISKCON Kakinada.",
    images: [
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1790235076658-1790235074922-pitru-paksha-desk.webp",
    ],
  },
};

export default function PitruPakshaPage() {
  return (
    <Suspense fallback={null}>
      <PitruPakshaClient />
    </Suspense>
  );
}

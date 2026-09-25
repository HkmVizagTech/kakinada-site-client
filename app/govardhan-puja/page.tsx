import { Suspense } from "react";
import GovardhanPujaClient from "@/components/govardhan-puja/GovardhanPujaClient";

export const metadata = {
  title: "Sri Govardhan Puja | ISKCON Kakinada",
  description:
    "Offer sacred Govardhan Puja sevas online — Govardhan, Gau, Bhog, Alankar, Annakoot and Vaishnav Bhojan Seva at ISKCON Kakinada.",
  alternates: { canonical: "/govardhan-puja" },
  openGraph: {
    title: "Sri Govardhan Puja Sevas — ISKCON Kakinada",
    description:
      "Celebrate the divine day of Govardhan Puja with sacred sevas at ISKCON Kakinada. Govardhan, Gau, Bhog, Alankar, Annakoot and Vaishnav Bhojan Seva.",
    images: [
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1789476038584-1789476037499-govardhan-desk.webp",
    ],
  },
};

export default function GovardhanPujaPage() {
  return (
    <Suspense fallback={null}>
      <GovardhanPujaClient />
    </Suspense>
  );
}

import type { Metadata } from "next";
import LandingPage from "@/components/vanabhojanam/public/LandingPage";

export const metadata: Metadata = {
  title: "Kartika Vanabhojanam | ISKCON Kakinada",
  description:
    "Join Kartika Vanabhojanam in Kakinada: a day in nature with Bhagavad-gita talks, games, ecstatic kirtan and a shared prasadam feast, organised by ISKCON Kakinada. Register online and get your QR pass on WhatsApp.",
  keywords: ["Vanabhojanam", "Kartika Vanabhojanam", "Vanabhojanam Kakinada", "ISKCON Kakinada youth festival", "Kartika masam Kakinada"],
  alternates: { canonical: "/vanabhojanam" },
};

export default function VanabhojanamPage() {
  return <LandingPage />;
}

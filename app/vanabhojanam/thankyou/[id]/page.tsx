import type { Metadata } from "next";
import ThankYou from "@/components/vanabhojanam/public/ThankYou";

export const metadata: Metadata = {
  title: "Registration status | Kartika Vanabhojanam",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYou />;
}

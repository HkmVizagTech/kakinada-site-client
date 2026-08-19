import type { Metadata } from "next";
import ThankYouClient from "@/components/ekadashi-campaign/ThankYouClient";

export const metadata: Metadata = {
  title: "Thank You | Shayani Ekadashi Seva — Hare Krishna Vaikuntham Temple",
  description:
    "Thank you for your generous Shayani Ekadashi donation to the Hare Krishna Vaikuntham Temple. Your seva has been received.",
  openGraph: {
    title: "Thank You — Shayani Ekadashi Seva",
    description:
      "Your Ekadashi seva offering has been received. Hare Krishna!",
    type: "website",
  },
};

export default function ThankYouPage() {
  return <ThankYouClient />;
}

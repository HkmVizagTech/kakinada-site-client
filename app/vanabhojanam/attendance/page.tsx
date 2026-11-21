import type { Metadata } from "next";
import QrLookup from "@/components/vanabhojanam/public/QrLookup";

export const metadata: Metadata = {
  title: "View my QR code | Kartika Vanabhojanam",
  description: "Enter your WhatsApp number to see the entry QR codes for Kartika Vanabhojanam, ISKCON Kakinada.",
  robots: { index: false, follow: true },
};

export default function AttendancePage() {
  return <QrLookup />;
}

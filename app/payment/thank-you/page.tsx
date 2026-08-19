import { Suspense } from "react";
import ThankYouPageClient from "@/components/payment/ThankYouPageClient";

export const metadata = {
  title: "Thank You | Hare Krishna Movement",
  description: "Your donation or seva payment was received successfully.",
};

export default function PaymentThankYouPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}> 
      <ThankYouPageClient />
    </Suspense>
  );
}

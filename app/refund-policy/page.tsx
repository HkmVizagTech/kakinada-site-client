import PageLayout from "@/components/PageLayout";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Refund & Cancellation Policy · Hare Krishna Movement Visakhapatnam",
  description: "Refund and cancellation policy for donations and event registrations at Hare Krishna Movement Visakhapatnam.",
};

const sections = [
  {
    h: "Donations",
    p: "Donations made to Hare Krishna Movement Visakhapatnam are voluntary contributions to charitable and religious causes and are generally non-refundable once processed.",
  },
  {
    h: "Erroneous or Duplicate Transactions",
    p: "If a donation was made in error — such as a duplicate payment, an incorrect amount due to a technical issue, or an unauthorised transaction — please write to us at social@hkmvizag.org within 7 days of the transaction with your payment reference number. Genuine cases will be reviewed and, where approved, refunded to the original payment method within 7–10 working days.",
  },
  {
    h: "80G Receipt Implications",
    p: "If an 80G tax-exemption receipt has already been issued for a donation, a refund may not be possible, as issued receipts are reported to tax authorities. Please verify donation details carefully before completing payment.",
  },
  {
    h: "Event Registrations",
    p: "Where a paid event or program is cancelled by the temple, registered participants will be offered a full refund or the option to transfer their registration to a future event. Participant-initiated cancellations are handled per the specific event's terms communicated at registration.",
  },
  {
    h: "Failed Transactions",
    p: "If your payment was debited but the donation/registration was not confirmed, the amount is typically auto-reversed by your bank within 5–7 working days. If it is not, contact us with the transaction reference and we will assist in tracing it with our payment gateway.",
  },
  {
    h: "How to Request a Refund",
    p: "Email social@hkmvizag.org with: your full name, date of transaction, amount, payment reference/UTR number, and reason for the request. We aim to respond within 3 working days.",
  },
];

export default function RefundPolicy() {
  return (
    <PageLayout>
      <PageHero title="Refund & Cancellation Policy" subtitle="Our policy on refunds for donations and registrations" breadcrumb="Refund Policy" />
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-3xl">
          <p className="text-sm text-muted-foreground mb-10">Last updated: July 2026</p>
          {sections.map((s) => (
            <div key={s.h} className="mb-9">
              <h2 className="font-heading text-xl font-bold text-foreground mb-3">{s.h}</h2>
              <p className="text-muted-foreground leading-relaxed">{s.p}</p>
            </div>
          ))}
        </div>
      </section>
    </PageLayout>
  );
}

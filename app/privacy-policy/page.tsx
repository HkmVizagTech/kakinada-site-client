import PageLayout from "@/components/PageLayout";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Privacy Policy · Hare Krishna Movement Visakhapatnam",
  description: "How Hare Krishna Movement Visakhapatnam collects, uses, and protects your personal information.",
};

const sections = [
  {
    h: "Information We Collect",
    p: "When you donate, register for events, or contact us, we may collect your name, email address, phone number, postal address, and PAN number (for 80G tax-exemption receipts). Payment card details are processed directly by our payment gateway (Razorpay) and are never stored on our servers.",
  },
  {
    h: "How We Use Your Information",
    p: "We use your information to process donations and issue receipts, register you for events and programs, send prasadam or donation acknowledgements to your address, communicate temple updates and festival invitations (only if you opt in), and comply with legal and tax obligations under Indian law including the Income Tax Act, 1961.",
  },
  {
    h: "Payment Processing",
    p: "All online payments are processed securely through Razorpay, a PCI-DSS-compliant payment gateway. Your card, UPI, and banking credentials are transmitted directly to Razorpay over encrypted channels. We receive only a payment confirmation and transaction reference.",
  },
  {
    h: "Data Sharing",
    p: "We do not sell, rent, or trade your personal information. Data is shared only with: our payment gateway (to process transactions), our donor-management system (to issue 80G receipts), and government authorities where required by law.",
  },
  {
    h: "Data Security",
    p: "We employ industry-standard measures — encrypted connections (HTTPS), access controls, and secure cloud infrastructure — to protect your data. While no system is completely immune, we continuously work to safeguard your information.",
  },
  {
    h: "Cookies",
    p: "Our website uses essential cookies to keep you signed in and remember preferences. We may use analytics cookies to understand site usage; these do not personally identify you.",
  },
  {
    h: "Your Rights",
    p: "You may request access to, correction of, or deletion of your personal data at any time by writing to us at social@hkmvizag.org. Note that donation records tied to 80G receipts must be retained as required by law.",
  },
  {
    h: "Changes to This Policy",
    p: "We may update this policy periodically. The latest version will always be available on this page. Continued use of the website constitutes acceptance of the updated policy.",
  },
  {
    h: "Contact Us",
    p: "For any privacy-related questions, contact: Chaitanya Bhavan, Hare Krishna Vaikuntam Cultural Centre, IIM Rd, Gambhiram, Visakhapatnam, Andhra Pradesh 531163. Email: social@hkmvizag.org",
  },
];

export default function PrivacyPolicy() {
  return (
    <PageLayout>
      <PageHero title="Privacy Policy" subtitle="How we collect, use, and protect your information" breadcrumb="Privacy Policy" />
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

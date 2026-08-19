import PageLayout from "@/components/PageLayout";
import PageHero from "@/components/PageHero";

export const metadata = {
  title: "Terms & Conditions · Hare Krishna Movement Visakhapatnam",
  description: "Terms governing the use of the Hare Krishna Movement Visakhapatnam website, donations, and event registrations.",
};

const sections = [
  {
    h: "Acceptance of Terms",
    p: "By accessing this website, making a donation, or registering for an event, you agree to these Terms & Conditions. If you do not agree, please refrain from using the website.",
  },
  {
    h: "About Us",
    p: "This website is operated by Hare Krishna Movement, Visakhapatnam (Hare Krishna Vaikuntham), a spiritual and charitable organisation located in Visakhapatnam, Andhra Pradesh, India.",
  },
  {
    h: "Donations",
    p: "All donations made through this website are voluntary contributions towards the temple's charitable, religious, and community activities including Anna Daan (food distribution), Gau Seva (cow protection), temple construction, and festival services. Donations are processed in Indian Rupees (INR) through Razorpay.",
  },
  {
    h: "80G Tax Exemption",
    p: "Eligible donations qualify for tax exemption under Section 80G of the Income Tax Act, 1961. To receive an 80G receipt, you must provide accurate PAN details at the time of donation. Receipts are issued to the name and PAN provided; corrections after issuance may not be possible.",
  },
  {
    h: "Event Registrations",
    p: "Event registrations are confirmed subject to availability. The temple reserves the right to modify event schedules, venues, or programs due to circumstances beyond our control. Registered participants will be notified of significant changes.",
  },
  {
    h: "Website Content",
    p: "All content on this website — text, images, logos, and design — is the property of Hare Krishna Movement Visakhapatnam or used with permission. Content may be shared for personal, non-commercial devotional purposes with attribution. Commercial use requires written permission.",
  },
  {
    h: "User Conduct",
    p: "You agree not to misuse the website, attempt unauthorised access, submit false information, or use the platform for any unlawful purpose.",
  },
  {
    h: "Limitation of Liability",
    p: "The website is provided on an 'as is' basis. While we strive for accuracy, we do not warrant that all information is error-free. To the maximum extent permitted by law, Hare Krishna Movement Visakhapatnam shall not be liable for indirect or consequential damages arising from website use.",
  },
  {
    h: "Governing Law",
    p: "These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts of Visakhapatnam, Andhra Pradesh.",
  },
  {
    h: "Contact",
    p: "Questions about these terms may be directed to social@hkmvizag.org.",
  },
];

export default function TermsAndConditions() {
  return (
    <PageLayout>
      <PageHero title="Terms & Conditions" subtitle="Terms governing use of this website and our services" breadcrumb="Terms & Conditions" />
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

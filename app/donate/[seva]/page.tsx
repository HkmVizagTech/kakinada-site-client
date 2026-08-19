"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ChevronRight,
  ChevronDown, Copy, Check, Building2, UtensilsCrossed, FileCheck2, Landmark, Sparkles,
} from "lucide-react";
import { getSevaBySlug, sevas, getSevaHref } from "@/lib/sevaConfig";
import Ornament from "@/components/Ornament";
import PageLayout from "@/components/PageLayout";
import UpiQrCard from "@/components/UpiQrCard";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import DonationForm from "@/components/DonationForm";

import { Suspense } from "react";

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

interface Donor {
  name: string;
  amount: number;
  time: string;
}

// Shown on every seva page — matches the Square Foot Seva campaign privileges.
const SEVA_PRIVILEGES = [
  { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam as a blessing for your seva (within India)." },
  { icon: Sparkles, title: "Deity Blessings", text: "Your name is included in the sankalpa offered to Their Lordships." },
  { icon: FileCheck2, title: "Email Receipt", text: "An instant receipt for every donation, the moment payment succeeds." },
  { icon: Landmark, title: "80G Tax Exemption", text: "Donations qualify for exemption under Section 80G of the Income Tax Act." },
];

const BANK_DETAILS = {
  beneficiaryName: "HARE KRISHNA MOVEMENT INDIA",
  bankName: "IDFC FIRST BANK LTD",
  accountNumber: "10091415313",
  ifsc: "IDFB0080412",
};

const FAQS = [
  {
    q: "Will I receive a donation receipt?",
    a: "Yes. An email receipt is sent automatically the moment your payment is confirmed. If you request an 80G certificate during checkout, that follows separately once your PAN is verified.",
  },
  {
    q: "Is this donation eligible for tax exemption?",
    a: "Yes, donations to Hare Krishna Movement Visakhapatnam qualify for tax exemption under Section 80G of the Income Tax Act. Check the '80G receipt' box during checkout and provide your PAN.",
  },
  {
    q: "Is it safe to donate online here?",
    a: "Yes. All payments are processed through Razorpay, a PCI-DSS-compliant payment gateway used by thousands of Indian organizations. We never see or store your card details.",
  },
  {
    q: "Can I donate via bank transfer instead of card/UPI?",
    a: "Yes — see the bank transfer details below. Please email us your transaction reference and PAN (if you need an 80G receipt) after transferring.",
  },
  {
    q: "Can I donate from outside India?",
    a: "Yes, international cards are accepted through the same checkout. For large international transfers, please contact us directly for wire transfer details.",
  },
];

function DonateSevaPageInner({ params }: { params: Promise<{ seva: string }> }) {
  const { seva: slug } = use(params);
  const seva = getSevaBySlug(slug);
  const searchParams = useSearchParams();

  const [donors, setDonors] = useState<Donor[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    const form = document.getElementById("donation-form");
    if (!form) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const amountParam = searchParams.get("amount");

  useEffect(() => {
    if (!seva) return;
    (async () => {
      try {
        const res = await fetch(
          `${apiBase()}/seva-stats?sevaName=${encodeURIComponent(seva.title)}&category=${encodeURIComponent(seva.category)}&limit=10`
        );
        if (res.ok) {
          const data = await res.json();
          setDonors(data.donors || []);
        }
      } catch {}
    })();
  }, [seva]);

  if (!seva) {
    notFound();
  }
  if (seva.externalHref) {
    redirect(seva.externalHref);
  }

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const otherSevas = sevas.filter((s) => s.slug !== seva.slug);

  return (
    <PageLayout>
      <WhatsAppFloatButton />
    <main className="bg-white dark:bg-background">
      {/* Hero */}
      {seva.heroImageDesktop && seva.heroImageMobile ? (
        // Dedicated, fully-designed banner (title/CTA baked into the image
        // itself) — shown plain and clear, no dark overlay or duplicate
        // heading on top, since that would fight the banner's own text.
        <section className="relative overflow-hidden pt-[88px] md:pt-[104px] rounded-b-3xl">
          <h1 className="sr-only">{seva.title}</h1>
          <nav className="flex items-center gap-1.5 bg-card px-4 py-2.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{seva.title}</span>
          </nav>
          <button
            onClick={() => document.getElementById("donation-form")?.scrollIntoView({ behavior: "smooth" })}
            className="block w-full text-left"
            aria-label={`Donate to ${seva.title}`}
          >
            <div className="relative hidden w-full md:block" style={{ aspectRatio: "1925 / 817" }}>
              <Image src={seva.heroImageDesktop} alt={seva.title} fill priority sizes="100vw" className="object-cover" />
            </div>
            <div className="relative w-full md:hidden" style={{ aspectRatio: "941 / 1672" }}>
              <Image src={seva.heroImageMobile} alt={seva.title} fill priority sizes="100vw" className="object-cover" />
            </div>
          </button>
        </section>
      ) : (
        <section className="relative overflow-hidden pt-[88px] md:pt-[104px] rounded-b-3xl">
          <h1 className="sr-only">{seva.title}</h1>
          <nav className="flex items-center gap-1.5 bg-card px-4 py-2.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-primary">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{seva.title}</span>
          </nav>
          <div className="relative aspect-[16/7] w-full md:aspect-[21/7]">
            <Image src={seva.image} alt={seva.title} fill priority sizes="100vw" className="object-cover" />
          </div>
        </section>
      )}

      <div className="container mx-auto grid gap-10 px-4 py-14 lg:grid-cols-[1fr_420px]">
        {/* Left column — description + supplementary content. order-2 on
            mobile so the payment form (right column) appears first, right
            after the hero, instead of requiring a long scroll past this. */}
        <div className="order-2 lg:order-1">
          <Ornament className="mb-5 !justify-start" />
          <h2 className="mb-4 font-heading text-2xl font-bold">About This Seva</h2>
          <p className="mb-8 leading-relaxed text-muted-foreground">{seva.description}</p>

          {/* Live Donor Wall — real data */}
          {donors.length > 0 && (
            <div className="mb-10">
              <div className="mb-4 flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-green-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Live
                </span>
                <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
                  Recent Devotees Supporting This Seva
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {donors.slice(0, 6).map((d, i) => (
                  <motion.div
                    key={`${d.name}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card px-3.5 py-2.5"
                  >
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[hsl(42,92%,56%,0.15)] text-xs font-bold text-gold">
                      {d.name.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">{d.name}</p>
                      <p className="text-[11px] text-muted-foreground">Donated ₹{d.amount.toLocaleString("en-IN")} · {d.time}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Other sevas */}
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Other Ways to Serve
          </h3>
          <div className="mb-12 flex flex-wrap gap-2">
            {otherSevas.map((s) => (
              <Link
                key={s.slug}
                href={getSevaHref(s)}
                className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
              >
                {s.icon} {s.shortTitle}
              </Link>
            ))}
          </div>

          {/* Offline payment options: UPI QR + Bank transfer */}
          <div className="mb-12 grid gap-4 md:grid-cols-2">
            <UpiQrCard />
            <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-heading text-lg font-bold">
              <Building2 className="h-5 w-5 text-primary" /> Prefer a Direct Bank Transfer?
            </h3>
            <p className="mb-4 text-sm text-muted-foreground">
              You can also donate via NEFT/RTGS/UPI directly to our temple account. Please email us your
              transaction reference and PAN (if you need an 80G receipt) to <a href="mailto:social@hkmvizag.org" className="text-primary underline">social@hkmvizag.org</a>.
            </p>
            <div className="space-y-2 rounded-xl bg-muted/40 p-4 text-sm">
              {Object.entries({
                "Beneficiary Name": BANK_DETAILS.beneficiaryName,
                "Bank Name": BANK_DETAILS.bankName,
                "Account Number": BANK_DETAILS.accountNumber,
                "IFSC Code": BANK_DETAILS.ifsc,
              }).map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <span className="text-muted-foreground">{label}</span>
                  <button
                    type="button"
                    onClick={() => handleCopy(label, value)}
                    className="flex items-center gap-1.5 font-semibold text-foreground hover:text-primary"
                  >
                    {value}
                    {copiedField === label ? (
                      <Check className="h-3.5 w-3.5 text-green-500" />
                    ) : (
                      <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            </div>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="mb-4 font-heading text-lg font-bold">Frequently Asked Questions</h3>
            <div className="space-y-2">
              {FAQS.map((faq, i) => (
                <div key={faq.q} className="overflow-hidden rounded-xl border border-border">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left text-sm font-semibold"
                  >
                    {faq.q}
                    <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform ${openFaq === i ? "rotate-180" : ""}`} />
                  </button>
                  {openFaq === i && (
                    <div className="border-t border-border px-4 py-3.5 text-sm leading-relaxed text-muted-foreground">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: sticky donation form. order-1 on mobile so this (and the
            amount tiers below) appears right after the hero, not after the
            long description/donor-wall/FAQ content in the left column. */}
        <div id="donation-form" className="order-1 scroll-mt-24 lg:order-2 lg:sticky lg:top-24 lg:self-start">
          <DonationForm
            seva={seva}
            sourcePage={`/donate/${seva.slug}`}
            initialAmount={amountParam ? Number(amountParam) : undefined}
            onSuccess={(donor) => setDonors((d) => [donor, ...d])}
          />
        </div>
      </div>

      {/* Donor privileges — moved below the payment form */}
      <section className="border-t border-border bg-white dark:bg-background">
        <div className="container mx-auto grid grid-cols-2 gap-4 px-4 py-8 lg:grid-cols-4">
          {SEVA_PRIVILEGES.map((p) => (
            <div key={p.title} className="flex items-start gap-3">
              <p.icon className="mt-0.5 h-6 w-6 shrink-0 text-gold" />
              <div>
                <p className="text-sm font-bold text-primary">{p.title}</p>
                <p className="text-xs leading-relaxed text-muted-foreground">{p.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sticky mobile donate bar — the form sits below the fold on phones */}
      {showSticky && (
      <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 pt-1 lg:hidden">
        <button
          onClick={() => document.getElementById("donation-form")?.scrollIntoView({ behavior: "smooth" })}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold text-[hsl(220,60%,12%)] shadow-gold"
        >
          🪔 Donate Now
        </button>
      </div>
      )}
    </main>
    </PageLayout>
  );
}

export default function DonateSevaPage({ params }: { params: Promise<{ seva: string }> }) {
  return (
    <Suspense fallback={null}>
      <DonateSevaPageInner params={params} />
    </Suspense>
  );
}

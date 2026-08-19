"use client";

/**
 * Special Occasion Seva — celebrate a birthday, anniversary, or any special
 * day by sponsoring a seva instead of (or alongside) a conventional
 * celebration. Hero images are fully-designed banners supplied directly
 * (text/CTA baked in) — rendered at their native aspect ratio, no text
 * overlay needed. Reuses the site's real seva catalog (lib/sevaConfig) so
 * every seva picked here is backed by the same live Razorpay + DCC +
 * WhatsApp receipt pipeline as the rest of the site.
 */

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ShieldCheck, Loader2, ChevronDown, Gift, Cake, Heart,
  PartyPopper, Home, Briefcase, Sparkles, UtensilsCrossed, Building2,
  FileCheck2, Clock3,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import Ornament from "@/components/Ornament";
import { sevas, getSevaHref, type Seva } from "@/lib/sevaConfig";
import { useAttribution } from "@/lib/useAttribution";
import DonorExtrasFields from "@/components/DonorExtrasFields";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const OCCASIONS = [
  { label: "Birthday", icon: Cake },
  { label: "Anniversary", icon: Heart },
  { label: "Wedding", icon: Sparkles },
  { label: "New Job / Promotion", icon: Briefcase },
  { label: "Housewarming", icon: Home },
  { label: "Other Celebration", icon: PartyPopper },
];

const HERO_DESKTOP = "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784005845291-1784005844212-ChatGPTImageJul142026104033AM.png";
const HERO_MOBILE = "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1784005846012-1784005844988-ChatGPTImageJul142026104020AM.png";

const FAQS = [
  {
    q: "How does a Special Occasion seva work?",
    a: "Choose the seva you'd like to sponsor in honour of your birthday, anniversary, or any celebration, make your offering, and receive prasadam and a certificate acknowledging your seva — done fully online in a few minutes.",
  },
  {
    q: "Which sevas can I sponsor for my occasion?",
    a: "Any of our regular sevas — Anna Daan, Gau Seva, Gita Daan, Vastra & Alankara, Brick Seva, or Square Foot Seva for the temple's construction. Pick whichever resonates with your celebration.",
  },
  {
    q: "Is this eligible for 80G tax exemption?",
    a: "Yes. Every Special Occasion seva qualifies for tax exemption under Section 80G of the Income Tax Act — select the option during checkout and provide your PAN.",
  },
  {
    q: "Can I dedicate the seva to someone else, like a family member's birthday?",
    a: "Yes — simply note their name and the occasion in the message field, and we'll keep it on record as a seva offered in their honour.",
  },
  {
    q: "Will I get a receipt and confirmation?",
    a: "Yes. You'll receive an instant confirmation, and a receipt with your seva details once processed — sent to the email and phone number you provide.",
  },
];

// Fades content in on mount — deliberately NOT scroll-gated (no
// whileInView/useInView). A near-identical pattern on this site's
// homepage left blog cards permanently invisible because their
// IntersectionObserver trigger fired before the cards existed in the
// DOM; mount-based animation can't have that failure mode; every
// section is guaranteed to become visible shortly after the page loads.
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 16 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: Math.min(delay, 0.4) }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// A handful of drifting sparkles over the hero — the one place this page
// spends its "one bold move": a quiet celebratory shimmer, not confetti
// clutter, that reads as festive without fighting the photograph beneath it.
function HeroSparkles() {
  const reduce = useReducedMotion();
  if (reduce) return null;
  const sparkles = [
    { left: "8%", top: "18%", size: 5, delay: 0 },
    { left: "14%", top: "62%", size: 3, delay: 0.8 },
    { left: "22%", top: "38%", size: 4, delay: 1.6 },
    { left: "6%", top: "78%", size: 3, delay: 2.4 },
    { left: "27%", top: "12%", size: 3, delay: 1.1 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {sparkles.map((s, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full bg-gold"
          style={{ left: s.left, top: s.top, width: s.size, height: s.size }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.3, 0.5], y: [0, -14, 0] }}
          transition={{ duration: 3.5, delay: s.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

const BENEFITS = [
  { icon: UtensilsCrossed, title: "Anna Daan", text: "Feed devotees and the underprivileged with sanctified prasadam" },
  { icon: Heart, title: "Gau Seva", text: "Care for the temple's cows through fodder, shelter, and medicine" },
  { icon: Building2, title: "Temple Rising", text: "Become part of the Hare Krishna Vaikuntham Temple, brick by brick" },
];

const TRUST_BADGES = [
  { icon: FileCheck2, label: "80G Tax Exemption" },
  { icon: UtensilsCrossed, label: "Mahaprasadam Sent" },
  { icon: Clock3, label: "Instant Confirmation" },
  { icon: ShieldCheck, label: "Secure Razorpay Checkout" },
];

export default function SpecialOccasionClient() {
  const reduce = useReducedMotion();
  const attribution = useAttribution("/special-occasion");
  const razorpayReady = useRazorpayPreload();

  const [occasion, setOccasion] = useState<string>("Birthday");
  const [selectedSeva, setSelectedSeva] = useState<Seva>(sevas[2]); // Anna Daan Seva default
  const [amount, setAmount] = useState<number>(sevas[2].tiers[1].amount);
  const [useCustom, setUseCustom] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [want80G, setWant80G] = useState(false);
  const [panNumber, setPanNumber] = useState("");
  const [dedication, setDedication] = useState("");
  const [sevakName, setSevakName] = useState("");
  const [dob, setDob] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const finalAmount = useCustom ? Number(customAmount) || 0 : amount;

  const scrollToForm = () => {
    document.getElementById("occasion-form")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  };

  const pickSeva = (seva: Seva) => {
    setSelectedSeva(seva);
    setUseCustom(false);
    setAmount(seva.tiers[1]?.amount || seva.tiers[0].amount);
    scrollToForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (finalAmount < 100) {
      setStatus({ type: "error", message: "Minimum contribution is ₹100." });
      return;
    }
    if (!form.name.trim()) {
      setStatus({ type: "error", message: "Please fill in your name and phone number." });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setStatus({ type: "error", message: "Please enter a valid 10-digit mobile number." });
      return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus({ type: "error", message: "Please enter a valid email address, or leave it blank." });
      return;
    }
    if (want80G && !panNumber.trim()) {
      setStatus({ type: "error", message: "PAN number is required for an 80G receipt." });
      return;
    }

    setSubmitting(true);
    try {
      const orderRes = await fetch(`${apiBase()}/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          account: selectedSeva.account,
          sourcePage: "/special-occasion",
          sevaName: selectedSeva.title,
          message: `Special Occasion: ${occasion}${dedication ? ` — ${dedication}` : ""}`,
          name: form.name.trim(),
          email: form.email.trim().toLowerCase(),
          mobile: form.mobile.trim(),
          amount: finalAmount,
          certificate: want80G,
          panNumber: want80G ? panNumber.trim() : undefined,
          sevakName: sevakName.trim() || undefined,
          dob: dob || undefined,
          utm: attribution.payload().utm,
        }),
      });

      if (!orderRes.ok) throw new Error("Unable to create payment order. Please try again.");
      const order = await orderRes.json();

      await razorpayReady();
      const win = window as unknown as { Razorpay?: RazorpayConstructor };
      if (!win.Razorpay) throw new Error("Razorpay checkout is unavailable.");

      new win.Razorpay({
        key: order.key,
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        name: "Hare Krishna Movement Kakinada",
        description: `Special Occasion Seva — ${selectedSeva.title}`,
        order_id: order.orderId,
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        notes: { sourcePage: "/special-occasion", sevaName: selectedSeva.title, occasion },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch(`${apiBase()}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: order.donationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (!verifyRes.ok) throw new Error("Payment verification failed.");
            window.location.assign(`/payment/thank-you?type=seva&seva=${encodeURIComponent(selectedSeva.title)}&amount=${finalAmount}&source=${encodeURIComponent(`the ${occasion.toLowerCase()} celebration seva programme`)}`);
          } catch (err) {
            setStatus({ type: "error", message: err instanceof Error ? err.message : "Payment verification failed." });
          } finally {
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
        theme: { color: "#D69E2E" },
      }).open();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <WhatsAppFloatButton />
      <main className="bg-white dark:bg-background">
        {/* ---------- Hero — fully-designed banners, native aspect ratio ---------- */}
        <section className="relative overflow-hidden pt-20">
          <button onClick={scrollToForm} className="relative block w-full text-left" aria-label="Sponsor a seva for your special occasion">
            <div className="relative hidden w-full md:block" style={{ aspectRatio: "2006 / 784" }}>
              <Image src={HERO_DESKTOP} alt="Special Occasion — sponsor a seva for your celebration" fill priority sizes="100vw" className="object-cover" />
              <HeroSparkles />
            </div>
            <div className="relative w-full md:hidden" style={{ aspectRatio: "941 / 1672" }}>
              <Image src={HERO_MOBILE} alt="Special Occasion — sponsor a seva for your celebration" fill priority sizes="100vw" className="object-cover" />
              <HeroSparkles />
            </div>
          </button>
        </section>

        {/* ---------- Trust strip ---------- */}
        <section className="border-y-2 border-gold/60 bg-[hsl(220,90%,10%)] py-3.5" style={{ backgroundImage: "radial-gradient(ellipse 60% 120% at 50% 0%, hsl(42 92% 56% / 0.12), transparent)" }}>
          <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4">
            {TRUST_BADGES.map((b) => (
              <span key={b.label} className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/90 md:text-sm">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gold/15 ring-1 ring-gold/40">
                  <b.icon className="h-3 w-3 text-gold" />
                </span>
                {b.label}
              </span>
            ))}
          </div>
        </section>

        {/* ---------- Shloka band — the offering verse ---------- */}
        <section className="relative overflow-hidden bg-[hsl(348,55%,13%)] py-14 md:py-16">
          <div aria-hidden className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse 50% 80% at 50% 50%, hsl(42 92% 56% / 0.14), transparent), radial-gradient(circle at 12% 20%, hsl(42 92% 56% / 0.08), transparent 30%), radial-gradient(circle at 88% 80%, hsl(42 92% 56% / 0.08), transparent 30%)" }} />
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-gold/70 to-transparent" />
          <Reveal className="container relative mx-auto max-w-3xl px-4 text-center">
            <p className="mb-4 font-heading text-lg italic leading-relaxed text-gold md:text-2xl">
              patraṁ puṣpaṁ phalaṁ toyaṁ<br />yo me bhaktyā prayacchati
            </p>
            <p className="mx-auto mb-3 max-w-xl text-xs leading-relaxed text-white/75 md:text-sm">
              &ldquo;If one offers Me with love and devotion a leaf, a flower, fruit or water, I will accept it.&rdquo;
            </p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-gold/70">Bhagavad Gita 9.26</p>
            <Ornament className="mt-6 text-gold" />
          </Reveal>
        </section>

        {/* ---------- Occasion picker ---------- */}
        <section className="relative bg-white dark:bg-background py-12 md:py-16" style={{ backgroundImage: "radial-gradient(ellipse 70% 50% at 50% 0%, hsl(42 92% 56% / 0.06), transparent)" }}>
          <div className="container mx-auto max-w-4xl px-4 text-center">
            <Reveal>
              <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Step One</p>
              <h2 className="mb-2 font-heading text-2xl font-bold text-primary md:text-3xl">What Are You Celebrating?</h2>
              <Ornament className="mb-8 mt-3" />
            </Reveal>
            <div className="flex flex-wrap justify-center gap-3 md:gap-4">
              {OCCASIONS.map((o, i) => {
                const active = occasion === o.label;
                return (
                  <Reveal key={o.label} delay={i * 0.05}>
                    <button
                      onClick={() => setOccasion(o.label)}
                      className={`group relative flex w-32 flex-col items-center gap-2.5 rounded-2xl border-2 px-3 py-5 text-center transition-all md:w-36 ${
                        active
                          ? "border-gold bg-gradient-gold shadow-gold scale-105"
                          : "border-gold/25 bg-background hover:-translate-y-1 hover:border-gold/60 hover:shadow-elevated"
                      }`}
                    >
                      <span aria-hidden className={`pointer-events-none absolute left-1.5 top-1.5 h-2 w-2 rounded-tl-lg border-l-2 border-t-2 ${active ? "border-[hsl(220,90%,12%)]/40" : "border-gold/40"}`} />
                      <span aria-hidden className={`pointer-events-none absolute bottom-1.5 right-1.5 h-2 w-2 rounded-br-lg border-b-2 border-r-2 ${active ? "border-[hsl(220,90%,12%)]/40" : "border-gold/40"}`} />
                      <span className={`flex h-12 w-12 items-center justify-center rounded-full ring-2 transition-colors ${active ? "bg-white/25 ring-white/40" : "bg-gold/10 ring-gold/30 group-hover:bg-gold/20"}`}>
                        <o.icon className={`h-6 w-6 ${active ? "text-[hsl(220,90%,12%)]" : "text-gold"}`} />
                      </span>
                      <span className={`text-xs font-bold leading-tight ${active ? "text-[hsl(220,90%,12%)]" : "text-foreground"}`}>{o.label}</span>
                    </button>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Why celebrate with seva ---------- */}
        <section className="relative overflow-hidden bg-white dark:bg-background py-12 md:py-16">
          <div aria-hidden className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 0% 30%, hsl(42 92% 56% / 0.05), transparent 35%), radial-gradient(circle at 100% 70%, hsl(220 90% 20% / 0.05), transparent 35%)" }} />
          <div className="container relative mx-auto max-w-4xl px-4 text-center">
            <Reveal>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">A Different Kind of Celebration</p>
              <h1 className="mb-4 font-heading text-2xl font-bold text-primary md:text-4xl">
                Mark Your Special Day with an Offering to the Lord
              </h1>
              <p className="mx-auto mb-3 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                A birthday, anniversary, or milestone is a moment of gratitude. Instead of — or alongside —
                the usual celebration, sponsor a seva at the Hare Krishna Vaikuntham Temple in that spirit
                of thanksgiving.
              </p>
              <Ornament className="my-8" />
            </Reveal>

            <div className="grid gap-5 sm:grid-cols-3">
              {BENEFITS.map((b, i) => (
                <Reveal key={b.title} delay={i * 0.1}>
                  <div className="group relative h-full rounded-2xl border-2 border-gold/25 bg-card p-[3px] transition-all hover:-translate-y-1 hover:border-gold/60 hover:shadow-elevated">
                    <div className="h-full rounded-xl border border-gold/15 bg-card px-5 py-7 text-center">
                      <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold shadow-gold">
                        <b.icon className="h-7 w-7 text-[hsl(220,90%,12%)]" />
                      </span>
                      <h3 className="mb-1.5 font-heading text-base font-bold text-primary">{b.title}</h3>
                      <p className="text-xs leading-relaxed text-muted-foreground">{b.text}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>

            <Reveal delay={0.2}>
              <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                Every Special Occasion seva comes with mahaprasadam, an 80G tax-exemption receipt, and the
                quiet satisfaction that your celebration became someone else&apos;s blessing too.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------- Seva cards — GVD-style rich photo cards ---------- */}
        <section className="relative overflow-hidden bg-[hsl(220,90%,10%)] py-12 md:py-16">
          <div aria-hidden className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse 70% 60% at 50% 0%, hsl(42 92% 56% / 0.12), transparent), radial-gradient(circle at 8% 90%, hsl(42 92% 56% / 0.07), transparent 30%), radial-gradient(circle at 92% 90%, hsl(42 92% 56% / 0.07), transparent 30%)" }} />
          <div className="container relative mx-auto max-w-6xl px-4">
            <Reveal>
              <div className="mb-12 text-center">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Step Two</p>
                <h2 className="font-heading text-2xl font-bold text-white md:text-4xl">Choose a Seva for Your Occasion</h2>
                <Ornament className="mt-4 text-gold" />
              </div>
            </Reveal>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sevas.map((seva, i) => {
                const active = selectedSeva.slug === seva.slug;
                return (
                  <Reveal key={seva.slug} delay={Math.min(i * 0.07, 0.35)}>
                    <div
                      className={`group relative h-full overflow-hidden rounded-2xl p-[3px] transition-all hover:-translate-y-1.5 ${
                        active ? "bg-gradient-gold shadow-gold" : "bg-gold/25 hover:bg-gold/60 hover:shadow-elevated"
                      }`}
                    >
                      <div className="flex h-full flex-col overflow-hidden rounded-xl bg-[hsl(220,80%,14%)]">
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image src={seva.image} alt={seva.title} fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-110" />
                          <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[hsl(220,80%,14%)] via-transparent to-transparent" />
                          {active && (
                            <span className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-gold text-xs font-bold text-[hsl(220,90%,12%)] shadow-gold ring-2 ring-white/50">✓</span>
                          )}
                        </div>
                        <div className="flex flex-1 flex-col px-5 pb-5 pt-3 text-center">
                          <h3 className="mb-1 font-heading text-lg font-bold text-white">{seva.title}</h3>
                          <p className="mb-4 flex-1 text-xs leading-relaxed text-white/70">{seva.tagline}</p>
                          <button
                            onClick={() => pickSeva(seva)}
                            className={`mx-auto w-full max-w-[220px] rounded-full py-2.5 text-sm font-bold transition-all ${
                              active
                                ? "bg-gradient-gold text-[hsl(220,90%,12%)] shadow-gold"
                                : "border-2 border-gold/60 text-gold hover:bg-gradient-gold hover:text-[hsl(220,90%,12%)] hover:shadow-gold"
                            }`}
                          >
                            {active ? "Selected — Continue ↓" : `Sponsor for ${occasion}`}
                          </button>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ---------- Donation form — gold-framed offering panel ---------- */}
        <section id="occasion-form" className="relative scroll-mt-20 overflow-hidden bg-white dark:bg-background py-12 md:py-16" style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 100%, hsl(42 92% 56% / 0.07), transparent)" }}>
          <div className="container mx-auto max-w-2xl px-4">
            <Reveal>
              <div className="mb-10 text-center">
                <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.3em] text-gold">Step Three</p>
                <h2 className="mb-2 font-heading text-2xl font-bold text-primary md:text-4xl">Complete Your Offering</h2>
                <p className="text-sm text-muted-foreground md:text-base">
                  {selectedSeva.title} · for your {occasion.toLowerCase()}
                </p>
                <Ornament className="mt-4" />
              </div>
            </Reveal>

            <Reveal delay={0.1}>
            <div className="overflow-hidden rounded-3xl bg-gradient-gold p-[3px] shadow-elevated">
            <div className="overflow-hidden rounded-[calc(1.5rem-3px)] bg-card">
              <div className="relative bg-[hsl(220,90%,12%)] px-6 py-5 text-center" style={{ backgroundImage: "radial-gradient(ellipse 80% 100% at 50% 0%, hsl(42 92% 56% / 0.15), transparent)" }}>
                <p className="font-heading text-lg font-bold text-white md:text-xl">{selectedSeva.icon} {selectedSeva.title}</p>
                <p className="mt-0.5 text-xs text-gold">{selectedSeva.tagline}</p>
              </div>
            <form onSubmit={handleSubmit} className="p-5 md:p-8">
              <p className="mb-3 text-sm font-semibold text-foreground">Choose a seva</p>
              <div className="mb-6 flex flex-wrap gap-2">
                {sevas.map((seva) => (
                  <button
                    type="button"
                    key={seva.slug}
                    onClick={() => pickSeva(seva)}
                    className={`rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-colors ${
                      selectedSeva.slug === seva.slug ? "border-gold bg-gold/10 text-primary" : "border-border text-muted-foreground hover:border-gold/50"
                    }`}
                  >
                    {seva.icon} {seva.shortTitle}
                  </button>
                ))}
              </div>

              <p className="mb-3 text-sm font-semibold text-foreground">Choose an amount</p>
              <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {selectedSeva.tiers.map((tier) => (
                  <button
                    type="button"
                    key={tier.label}
                    onClick={() => { setUseCustom(false); setAmount(tier.amount); }}
                    className={`rounded-xl border-2 px-2 py-3 text-center transition-all ${
                      !useCustom && amount === tier.amount ? "border-gold bg-gradient-gold shadow-gold" : "border-gold/25 bg-background hover:border-gold/60"
                    }`}
                  >
                    <span className={`block text-sm font-bold ${!useCustom && amount === tier.amount ? "text-[hsl(220,90%,12%)]" : "text-gold"}`}>₹{tier.amount.toLocaleString("en-IN")}</span>
                    <span className={`mt-0.5 block text-[10px] ${!useCustom && amount === tier.amount ? "text-[hsl(220,90%,12%)]/80" : "text-muted-foreground"}`}>{tier.label.split("/")[1]?.trim() || tier.label}</span>
                  </button>
                ))}
              </div>

              <div className={`mb-6 flex items-center gap-2 rounded-xl border-2 bg-background px-3 py-2.5 transition-colors ${useCustom ? "border-gold" : "border-gold/25"}`}>
                <label htmlFor="custom-amt" className="whitespace-nowrap text-xs font-semibold text-muted-foreground">Other amount ₹:</label>
                <input
                  id="custom-amt"
                  type="number"
                  min={100}
                  placeholder="100+"
                  value={customAmount}
                  onFocus={() => setUseCustom(true)}
                  onChange={(e) => { setUseCustom(true); setCustomAmount(e.target.value); }}
                  className="w-full bg-transparent text-sm font-semibold outline-none"
                />
              </div>

              <div className="mb-4 grid gap-3 sm:grid-cols-2">
                <input type="text" required placeholder="Full name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                <input type="tel" required maxLength={10} inputMode="numeric" placeholder="Mobile number *" value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })} className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold" />
                <input type="email" placeholder="Email address (optional)" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold sm:col-span-2" />
                <input type="text" placeholder="Dedicate to / occasion note (optional)" value={dedication} onChange={(e) => setDedication(e.target.value)} className="rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-gold sm:col-span-2" />
              </div>

              <DonorExtrasFields
                sevakName={sevakName}
                dob={dob}
                onSevakNameChange={setSevakName}
                onDobChange={setDob}
                collapsible
              />

              <label className="mb-3 flex cursor-pointer items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={want80G} onChange={(e) => setWant80G(e.target.checked)} className="h-4 w-4 accent-[hsl(42,92%,46%)]" />
                I need an 80G tax exemption receipt
              </label>
              {want80G && (
                <input type="text" placeholder="PAN number *" value={panNumber} onChange={(e) => setPanNumber(e.target.value.toUpperCase())} className="mb-4 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm uppercase outline-none focus:border-gold" />
              )}

              {status && (
                <p className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${status.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"}`}>
                  {status.message}
                </p>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-4 text-base font-bold text-[hsl(220,90%,12%)] shadow-gold transition-transform hover:scale-[1.02] disabled:opacity-60"
              >
                {submitting ? (<><Loader2 className="h-5 w-5 animate-spin" /> Processing…</>) : (<>🪔 Offer ₹{finalAmount > 0 ? finalAmount.toLocaleString("en-IN") : "—"} for your {occasion}</>)}
              </button>
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-gold" /> Secure payment via Razorpay · 80G receipt available
              </p>
            </form>
            </div>
            </div>
            </Reveal>
          </div>
        </section>

        {/* ---------- FAQ ---------- */}
        <section className="bg-white dark:bg-background py-12 md:py-16">
          <div className="container mx-auto max-w-3xl px-4">
            <Reveal>
              <div className="mb-8 text-center">
                <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl">Frequently Asked Questions</h2>
                <Ornament className="mt-4" />
              </div>
            </Reveal>
            <div className="space-y-3">
              {FAQS.map((f, i) => (
                <Reveal key={f.q} delay={Math.min(i * 0.05, 0.3)}>
                <div className={`overflow-hidden rounded-xl border-2 bg-background transition-colors ${openFaq === i ? "border-gold/50" : "border-border"}`}>
                  <button type="button" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
                    <span className="text-sm font-semibold text-foreground md:text-base">{f.q}</span>
                    <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full transition-all ${openFaq === i ? "bg-gradient-gold" : "bg-gold/10"}`}>
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${openFaq === i ? "rotate-180 text-[hsl(220,90%,12%)]" : "text-gold"}`} />
                    </span>
                  </button>
                  {openFaq === i && <p className="border-t border-gold/20 px-5 py-4 text-sm leading-relaxed text-muted-foreground">{f.a}</p>}
                </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ---------- Cross-promo: Square Foot Seva ---------- */}
        <section className="relative overflow-hidden bg-[hsl(220,90%,10%)] py-16 text-center md:py-24">
          <div aria-hidden className="absolute inset-0" style={{ backgroundImage: "radial-gradient(ellipse 60% 80% at 50% 100%, hsl(42 92% 56% / 0.15), transparent)" }} />
          <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
          <div className="container relative mx-auto max-w-2xl px-4">
            <Reveal>
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-gold shadow-gold">
              <Gift className="h-7 w-7 text-[hsl(220,90%,12%)]" />
            </span>
            <h2 className="mb-4 font-heading text-2xl font-bold text-white md:text-3xl">
              Make your celebration part of something permanent
            </h2>
            <p className="mb-6 text-sm text-white/80 md:text-base">
              Sponsor a Square Foot of the Hare Krishna Vaikuntham Temple&apos;s foundation in honour of your special day.
            </p>
            <Link href={getSevaHref(sevas[0])} className="inline-block rounded-full bg-gradient-gold px-10 py-3.5 text-base font-bold text-[hsl(220,90%,12%)] shadow-gold transition-transform hover:scale-105">
              Explore Square Foot Seva
            </Link>
            </Reveal>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

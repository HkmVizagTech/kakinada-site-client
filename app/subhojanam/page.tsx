"use client";

import PageLayout from "@/components/PageLayout";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";
import Ornament from "@/components/Ornament";
import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import TouchstoneCharitiesLogo from "@/assets/TouchstoneCharitiesLogo.png";
import HKMLogoBlack from "@/assets/HKMLogoBlack.jpg";
import {
  Utensils, Hospital, Users, Clock, Heart, Phone, Mail,
  ChevronRight, ShieldCheck, X, CheckCircle2, Loader2, Quote
} from "lucide-react";
import { newEventId, getMetaBrowserData, trackInitiateCheckout, trackPurchase } from "@/lib/metaPixel";
import { useAttribution } from "@/lib/useAttribution";

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };
const apiBase = () => (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const stats = [
  { icon: Utensils, value: "3,000+", label: "Meals Served Daily", sub: "Hot, nutritious, hygienic" },
  { icon: Hospital, value: "2", label: "Government Hospitals", sub: "KGH Vizag · GGH Kakinada" },
  { icon: Users, value: "10,95,000+", label: "Annual Beneficiaries", sub: "Patients & attendants" },
  { icon: Clock, value: "365", label: "Days a Year", sub: "No holidays, no breaks" },
];

const donationTiers = [
  { meals: "500 Meals", amount: "₹12,500", amountValue: 12500, popular: false, icon: "🍱" },
  { meals: "400 Meals", amount: "₹10,000", amountValue: 10000, popular: true, icon: "⭐" },
  { meals: "300 Meals", amount: "₹7,500", amountValue: 7500, popular: false, icon: "🍱" },
  { meals: "200 Meals", amount: "₹5,000", amountValue: 5000, popular: false, icon: "🍱" },
  { meals: "100 Meals", amount: "₹2,500", amountValue: 2500, popular: false, icon: "🍱" },
];

const mealProcess = [
  { step: "01", title: "Kitchen Preparation", desc: "Every morning, our trained cooks prepare fresh, hygienic meals in our dedicated kitchen following strict quality standards." },
  { step: "02", title: "Quality Check", desc: "Each batch is inspected for nutrition, hygiene and taste before it is packaged and prepared for distribution." },
  { step: "03", title: "Hospital Distribution", desc: "Volunteers carry the meals to KGH Visakhapatnam and GGH Kakinada and distribute directly to patients and their families." },
  { step: "04", title: "Consistent Service", desc: "This cycle runs every single day of the year — 365 days, without exception, rain or shine." },
];

const testimonials = [
  {
    quote: "When my mother was admitted at KGH, we couldn't afford both food and medicine. The Subhojanam meals were a blessing from God.",
    name: "Ramesh K.",
    role: "Patient Attendant · KGH Visakhapatnam",
  },
  {
    quote: "I've been volunteering for two years. Seeing the gratitude in people's eyes when they receive a warm meal is the most fulfilling experience of my life.",
    name: "Priya S.",
    role: "Volunteer · Subhojanam Programme",
  },
  {
    quote: "The nutritious food helped my father recover faster. We are forever grateful to the Hare Krishna Movement for this noble service.",
    name: "Suresh M.",
    role: "Patient Family · GGH Kakinada",
  },
];

export default function SubhojanamPage() {
  const ref1 = useRef(null); const ref2 = useRef(null);
  const ref3 = useRef(null); const ref4 = useRef(null);
  const ref5 = useRef(null); const ref6 = useRef(null);
  const inView1 = useInView(ref1, { once: true, margin: "-80px" });
  const inView2 = useInView(ref2, { once: true, margin: "-80px" });
  const inView3 = useInView(ref3, { once: true, margin: "-80px" });
  const inView4 = useInView(ref4, { once: true, margin: "-80px" });
  const inView5 = useInView(ref5, { once: true, margin: "-80px" });
  const inView6 = useInView(ref6, { once: true, margin: "-80px" });

  const [checkoutTier, setCheckoutTier] = useState<{ meals: string; amountValue: number } | null>(null);
  const [form, setForm] = useState({ name: "", email: "", mobile: "" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const attribution = useAttribution("/subhojanam");
  const razorpayReady = useRazorpayPreload();

  const closeCheckout = () => { if (!submitting) { setCheckoutTier(null); setStatus(null); setForm({ name: "", email: "", mobile: "" }); } };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setStatus(null);
    if (!checkoutTier) return;
    if (!form.name.trim()) {
      setStatus({ type: "error", message: "Please fill in your name and phone number." }); return;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setStatus({ type: "error", message: "Please enter a valid 10-digit mobile number." }); return;
    }
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setStatus({ type: "error", message: "Please enter a valid email address, or leave it blank." }); return;
    }
    setSubmitting(true);
    try {
      const metaEventId = newEventId();
      const metaBrowser = getMetaBrowserData();
      const orderRes = await fetch(`${apiBase()}/payments/order`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account: "touchstone", sourcePage: "/subhojanam", utm: attribution.payload().utm, sevaName: "Subhojanam", name: form.name.trim(), email: form.email.trim().toLowerCase(), mobile: form.mobile.trim(), amount: checkoutTier.amountValue, metaEventId, metaFbp: metaBrowser.fbp, metaFbc: metaBrowser.fbc }),
      });
      if (!orderRes.ok) { const body = await orderRes.json().catch(() => ({})); throw new Error(body.message || "Unable to create payment order."); }
      const order = await orderRes.json();
      await razorpayReady();
      const win = window as unknown as { Razorpay?: RazorpayConstructor };
      if (!win.Razorpay) throw new Error("Razorpay checkout is unavailable.");
      new win.Razorpay({
        key: order.key, amount: Math.round(checkoutTier.amountValue * 100), currency: "INR",
        name: "Touchstone Charities", description: `Subhojanam — ${checkoutTier.meals}`,
        order_id: order.orderId, prefill: { name: form.name, email: form.email, contact: form.mobile },
        notes: { sourcePage: "/subhojanam", sevaName: "Subhojanam" },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch(`${apiBase()}/payments/verify`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ donationId: order.donationId, razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature }),
            });
            if (!verifyRes.ok) throw new Error("Payment verification failed.");
            trackPurchase({ value: checkoutTier.amountValue, eventId: metaEventId, content_name: "Subhojanam" });
            window.location.assign(`/payment/thank-you?type=donation&seva=${encodeURIComponent("Subhojanam")}&amount=${checkoutTier.amountValue}&source=${encodeURIComponent("the Subhojanam meal programme")}`);
          } catch (err) { setStatus({ type: "error", message: err instanceof Error ? err.message : "Payment verification failed." }); }
          finally { setSubmitting(false); }
        },
        modal: { ondismiss: () => setSubmitting(false) }, theme: { color: "#D69E2E" },
      }).open();
    } catch (err) { setStatus({ type: "error", message: err instanceof Error ? err.message : "Something went wrong." }); setSubmitting(false); }
  };

  return (
    <PageLayout>
      <WhatsAppFloatButton />

      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex flex-col justify-end overflow-hidden pt-20">
        <div className="absolute inset-0">
          <Image
            src="https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg"
            alt="Subhojanam meal distribution at hospital"
            fill priority sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,85%,6%)] via-[hsl(220,85%,8%,0.6)] to-transparent" />
        </div>
        {/* Floating trust badge */}
        <div className="absolute top-28 right-6 md:right-10 z-10 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur-md">
          <ShieldCheck className="h-4 w-4 text-green-400" />
          <span className="text-xs font-semibold text-white/90">Under Touchstone Charities</span>
        </div>
        <div className="relative z-10 container mx-auto px-4 pb-16 md:pb-24">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-white/60">
            <Link href="/" className="hover:text-white">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-white/90">Subhojanam</span>
          </nav>
          <div className="max-w-3xl">
            <p className="mb-4 text-sm font-semibold uppercase tracking-[0.25em] text-gold">Free Hospital Meal Programme</p>
            <h1 className="font-heading text-4xl font-bold leading-tight text-white md:text-6xl mb-6">
              No patient should<br />choose between<br />
              <span className="text-gold">food and medicine.</span>
            </h1>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-white/75">
              Subhojanam provides free, hygienic, and nutritious meals every day to patients
              and their attendants at government hospitals in Visakhapatnam and Kakinada.
            </p>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => document.getElementById("donate-section")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full bg-gradient-gold px-7 py-3.5 text-sm font-bold text-[hsl(220,60%,12%)] shadow-gold transition hover:opacity-90"
              >
                Sponsor a Meal
              </button>
              <button
                onClick={() => document.getElementById("about-section")?.scrollIntoView({ behavior: "smooth" })}
                className="rounded-full border border-white/30 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                Learn More
              </button>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative z-10 border-t border-white/10 bg-white/5 backdrop-blur-md">
          <div className="container mx-auto grid grid-cols-2 divide-x divide-white/10 md:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center px-4 py-5 text-center">
                <span className="font-heading text-2xl font-bold text-gold md:text-3xl">{s.value}</span>
                <span className="mt-0.5 text-xs font-semibold text-white">{s.label}</span>
                <span className="text-[10px] text-white/50">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT THE PROGRAMME ──────────────────────────────────── */}
      <section id="about-section" className="py-12 md:py-16 bg-white dark:bg-background" ref={ref1}>
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-14 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }} animate={inView1 ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8 }}
            >
              <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">The Programme</p>
              <Ornament className="mb-5 !justify-start" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6">Feeding Hope, One Meal at a Time</h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Annadana is one of the greatest forms of charity. Our Subhojanam Programme provides free, hygienic,
                and nutritious meals to underprivileged patients and their attendants in government hospitals.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Many families stay hungry to save money for medicine. Our programme ensures they never have
                to make that impossible choice. Every meal is prepared with love in hygienic kitchens following
                strict quality standards, and served with devotion.
              </p>
              <div className="flex flex-col gap-3">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <Hospital className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">KGH Hospital, Visakhapatnam</p>
                    <p className="text-xs text-muted-foreground">Up to 500 meals served daily</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-card p-4">
                  <Hospital className="h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-foreground">GGH Hospital, Kakinada</p>
                    <p className="text-xs text-muted-foreground">Up to 500 meals served daily</p>
                  </div>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }} animate={inView1 ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/10 to-gold/10 -rotate-1" />
              <Image
                src="https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg"
                alt="Volunteers serving meals at hospital" width={600} height={440}
                className="relative rounded-2xl shadow-elevated w-full object-cover"
              />
              <div className="absolute -bottom-4 -right-4 rounded-2xl bg-gradient-gold px-5 py-4 shadow-gold text-center">
                <p className="font-heading text-3xl font-bold text-[hsl(220,60%,12%)]">365</p>
                <p className="text-xs font-semibold text-[hsl(220,60%,20%)] uppercase tracking-wide">Days a Year</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref2}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={inView2 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Our Process</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">From Kitchen to Patient</h2>
          </motion.div>
          <div className="max-w-5xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mealProcess.map((p, i) => (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 30 }} animate={inView2 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 * i }}
                className="relative bg-background rounded-2xl border border-border p-6"
              >
                <span className="font-heading text-5xl font-bold text-primary/10 absolute top-4 right-5 select-none">{p.step}</span>
                <p className="font-heading text-xs font-bold uppercase tracking-widest text-gold mb-3">{p.step}</p>
                <h3 className="font-heading text-base font-bold text-foreground mb-2">{p.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref3}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={inView3 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Real Stories</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">Voices of Gratitude</h2>
          </motion.div>
          <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }} animate={inView3 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.2 + i * 0.15 }}
                className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
              >
                <Quote className="h-8 w-8 text-gold/40" />
                <p className="text-sm leading-relaxed text-muted-foreground italic flex-1">{t.quote}</p>
                <div className="pt-4 border-t border-border">
                  <p className="font-heading font-semibold text-foreground text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DONATE ───────────────────────────────────────────────── */}
      <section id="donate-section" className="py-24 bg-[hsl(220,60%,10%)]" ref={ref4}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={inView4 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Support Us</p>
            <Ornament className="mb-5" />
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4">Choose Your Contribution</h2>
            <p className="text-white/60 max-w-xl mx-auto">
              Every rupee you donate goes directly to providing nutritious meals for patients and their families.
              ₹25 sponsors one meal. Your generosity saves families from impossible choices.
            </p>
          </motion.div>
          <div className="max-w-4xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {donationTiers.map((tier, i) => (
              <motion.button
                key={tier.meals}
                onClick={() => { setCheckoutTier({ meals: tier.meals, amountValue: tier.amountValue }); trackInitiateCheckout({ value: tier.amountValue, content_name: "Subhojanam" }); }}
                initial={{ opacity: 0, y: 20 }} animate={inView4 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.5, delay: 0.1 * i }}
                whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
                className={`relative flex flex-col items-center rounded-2xl border p-5 text-center transition-all ${
                  tier.popular
                    ? "bg-gradient-gold border-transparent shadow-gold text-[hsl(220,60%,12%)]"
                    : "bg-white/5 border-white/10 text-white hover:bg-white/10"
                }`}
              >
                {tier.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[hsl(220,60%,12%)] px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gold whitespace-nowrap">
                    Most Popular
                  </span>
                )}
                <span className="text-2xl mb-2 mt-1">{tier.icon}</span>
                <p className={`font-heading text-xl font-bold ${tier.popular ? "" : "text-gold"}`}>{tier.amount}</p>
                <p className={`text-xs mt-1 ${tier.popular ? "opacity-75" : "text-white/60"}`}>for {tier.meals}</p>
                <div className={`mt-4 w-full rounded-full py-2 text-xs font-bold ${
                  tier.popular ? "bg-[hsl(220,60%,12%)] text-gold" : "bg-gold/20 text-gold"
                }`}>
                  Donate Now
                </div>
              </motion.button>
            ))}
          </div>
          <p className="text-center text-xs text-white/40 mt-8">
            ₹25 = 1 Meal · All donations go to Touchstone Charities for Subhojanam
          </p>
        </div>
      </section>

      {/* ── TRUST & TRANSPARENCY ─────────────────────────────────── */}
      <section className="py-12 md:py-16 border-y border-border bg-white dark:bg-background" ref={ref5}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={inView5 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7 }}
            className="max-w-3xl mx-auto"
          >
            <p className="text-center text-gold text-xs tracking-[0.2em] uppercase font-medium mb-8">Run Under</p>
            <div className="flex flex-wrap items-center justify-center gap-10 mb-8">
              <Image src={TouchstoneCharitiesLogo} alt="Touchstone Charities" width={220} height={220} className="h-20 w-auto object-contain" />
              <span className="hidden h-14 w-px bg-border sm:block" aria-hidden />
              <Image src={HKMLogoBlack} alt="Srila Prabhupada's Hare Krishna Movement Visakhapatnam" width={300} height={162} className="h-14 w-auto object-contain" />
            </div>
            <div className="rounded-2xl border border-border bg-background p-6 text-center">
              <p className="text-sm leading-relaxed text-muted-foreground">
                Subhojanam is a charitable programme run under{" "}
                <span className="font-semibold text-foreground">Touchstone Charities</span>, an initiative
                by <span className="font-semibold text-foreground">Hare Krishna Movement Visakhapatnam</span> —
                one of the trusts of Srila Prabhupada&apos;s ISKCON Gambheeram Visakhapatnam.
              </p>
              <div className="mt-4 flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-green-500" /> FCRA Registered Trust</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-green-500" /> 80G Tax Exemption Available</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-green-500" /> Serving since 2018</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── GET INVOLVED ─────────────────────────────────────────── */}
      <section className="py-12 md:py-16 bg-white dark:bg-background" ref={ref6}>
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={inView6 ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Get Involved</p>
              <Ornament className="mb-5" />
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">You Can Make a Difference</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Shoulder the social responsibility of providing nutritious food to those battling health issues.
                Your generosity earns their prayers and brings immense happiness to your family.
              </p>
            </div>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                { icon: Heart, title: "Donate", desc: "Sponsor meals directly. Every ₹25 feeds one person.", cta: "Donate Now", action: () => document.getElementById("donate-section")?.scrollIntoView({ behavior: "smooth" }) },
                { icon: Users, title: "Volunteer", desc: "Join our kitchen or distribution team. No experience needed.", cta: "Join Us", action: () => window.location.href = "/contact" },
                { icon: Phone, title: "Contact Us", desc: "Call +91 89777 61187 or write to social@hkmvizag.org", cta: "Get in Touch", action: () => window.location.href = "/contact" },
              ].map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }} animate={inView6 ? { opacity: 1, y: 0 } : {}} transition={{ delay: 0.2 + i * 0.15 }}
                  className="flex flex-col rounded-2xl border border-border bg-card p-6 text-center"
                >
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <item.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-5 flex-1">{item.desc}</p>
                  <button
                    onClick={item.action}
                    className="mt-auto rounded-full border border-primary/30 bg-primary/5 px-4 py-2 text-xs font-semibold text-primary transition hover:bg-primary/10"
                  >
                    {item.cta}
                  </button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CHECKOUT MODAL ───────────────────────────────────────── */}
      {checkoutTier && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm" onClick={closeCheckout}>
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-heading text-lg font-bold">Sponsor {checkoutTier.meals}</h3>
                <p className="text-xs text-muted-foreground">Touchstone Charities · Subhojanam</p>
              </div>
              <button onClick={closeCheckout} aria-label="Close"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            {status?.type === "success" ? (
              <div className="flex flex-col items-center py-8 text-center">
                <CheckCircle2 className="mb-3 h-14 w-14 text-green-500" />
                <h4 className="font-heading font-bold text-foreground mb-1">Hare Krishna! 🙏</h4>
                <p className="text-sm text-muted-foreground mb-6">{status.message}</p>
                <button onClick={closeCheckout} className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-[hsl(220,60%,12%)]">Close</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="rounded-xl bg-gradient-gold p-[2px] shadow-gold">
                  <div className="rounded-[calc(0.75rem-2px)] bg-card px-4 py-3 text-center">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">You are donating</p>
                    <p className="font-heading text-3xl font-extrabold text-gold">₹{checkoutTier.amountValue.toLocaleString("en-IN")}</p>
                    <p className="text-xs text-muted-foreground">for {checkoutTier.meals}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input type="text" required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Full Name" />
                  <input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="Email Address (optional)" />
                  <input type="tel" required maxLength={10} inputMode="numeric" value={form.mobile} onChange={(e) => setForm((f) => ({ ...f, mobile: e.target.value.replace(/[^\d]/g, "").slice(0, 10) }))} className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm" placeholder="10-digit Mobile Number" />
                </div>
                {status?.type === "error" && <p className="text-sm text-destructive">{status.message}</p>}
                <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-sm font-bold text-[hsl(220,60%,12%)] disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {submitting ? "Processing..." : `Donate ₹${checkoutTier.amountValue.toLocaleString("en-IN")} Now`}
                </button>
                <div className="flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                  <ShieldCheck className="h-3.5 w-3.5 text-green-500" />
                  <span>Secured by Razorpay · Funds go to Touchstone Charities</span>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PageLayout>
  );
}

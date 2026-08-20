"use client";

import { useState, useRef, useEffect } from "react";
import { useAttribution } from "@/lib/useAttribution";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Loader2, ShieldCheck, User, Phone, Mail, Check, Copy, CheckCircle2,
  UtensilsCrossed, Sparkles, FileCheck2, Landmark,
  ChevronDown, ChevronLeft, ChevronRight,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import Ornament from "@/components/Ornament";
import DonorPrivilegesSection from "@/components/shared/DonorPrivilegesSection";
import ImportanceSection from "@/components/shared/ImportanceSection";
import FaqSection from "@/components/shared/FaqSection";
import FounderSection from "@/components/shared/FounderSection";
import AddressForm from "@/components/AddressForm";
import type { PrasadamAddress } from "@/components/AddressForm";
import DonorExtrasFields from "@/components/DonorExtrasFields";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";
interface CampaignConfig {
  type: string;
  pageTitle: string;
  metaTitle: string;
  metaDesc: string;
  ogTitle: string;
  ogDesc: string;
  ogImage: string;
  pricePerUnit: number;
  unitName: string;
  unitNamePlural: string;
  unitShort: string;
  minCustomAmount: number;
  phone: string;
  phoneHref?: string;
  email: string;
  bannerImage?: string;
  bannerImageMobile?: string;
  bannerWidth?: number;
  bannerHeight?: number;
  bannerMobileWidth?: number;
  bannerMobileHeight?: number;
  heroImage: string;
  heroHeading1: string;
  heroHeading2: string;
  formHeading: string;
  formSubheading: string;
  orderType: string;
  path?: string;
  account?: string;
  category?: string;
  type2?: string;
  unit?: { price: number; singular: string; plural: string };
  tiers?: Array<{ label?: string; amount: number; popular?: boolean; default?: boolean }>;
  gallery?: { photos: Array<{ src: string; caption: string }> };
  statsApiEndpoint?: string;
  aboutImage?: string;
  heroTagline?: string;
  heroDesc?: string;
  privileges?: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; text: string }>;
  higherPrivileges?: Array<{ icon: React.ComponentType<{ className?: string }>; title: string; text: string }>;
}

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const VASTRA_CONFIG: CampaignConfig = {
  type: "SQFT",
  pageTitle: "Vastra & Alankara Seva",
  metaTitle: "Vastra & Alankara Seva | Hare Krishna Vaikuntham Temple, Visakhapatnam",
  metaDesc:
    "Offer beautiful garments and ornaments to Sri Sri Radha Madan Mohan. Sponsor daily vastra, festival alankara sets, and more — every offering adorns the Lord with love.",
  ogTitle: "Vastra & Alankara Seva — Hare Krishna Vaikuntham Temple",
  ogDesc:
    "Dress the Lord in splendour. Sponsor vastra and alankara seva for Sri Sri Radha Madan Mohan at the Hare Krishna Vaikuntham Temple.",
  ogImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677419371-1783677418690-DietyPhotos.jpeg",
  pricePerUnit: 501,
  unitName: "vastra offering",
  unitNamePlural: "vastra offerings",
  unitShort: "offering",
  minCustomAmount: 101,
  phone: "+91 89777 61187",
  phoneHref: "tel:+918977761187",
  email: "social@hkmvizag.org",
  heroImage: "https://res.cloudinary.com/ddmzeqpkc/image/upload/v1784790674/vastra_bg.webp",
  bannerImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785573838202-1785573837372-ChatGPTImageAug12026021301PM.webp",
  bannerImageMobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785580143643-1785580142535-vastraheromob.webp",
  aboutImage: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677419371-1783677418690-DietyPhotos.jpeg",
  heroTagline: "A seva initiative of Hare Krishna Movement Visakhapatnam",
  heroHeading1: "Vastra & Alankara",
  heroHeading2: "Seva",
  heroDesc:
    "Sri Sri Radha Madan Mohan are dressed and decorated fresh each day with exquisite garments and ornaments. Your offering sustains this beautiful daily service to Their Lordships.",
  formHeading: "Offer Your Seva",
  formSubheading:
    "Every garment and ornament you sponsor is offered directly to Their Lordships with love and devotion.",
  privileges: [
    { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India)." },
    { icon: Sparkles, title: "Sankalpa & Aarti", text: "Your name is included in the sankalpa and offered during aarti to Their Lordships." },
    { icon: FileCheck2, title: "Contribution Certificate", text: "A digital certificate honouring your valued offering to the temple." },
    { icon: Landmark, title: "80G Tax Exemption", text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act." },
  ],
  higherPrivileges: [],
  statsApiEndpoint: "",
  orderType: "GDGD",
};

const TIERS = [
  { label: "Daily Vastra", amount: 501, description: "Sponsor the daily garment offering to Their Lordships" },
  { label: "Festival Vastra", amount: 2100, description: "Special garments for festival days and celebrations" },
  { label: "Alankara Set", amount: 5100, description: "Complete ornament set for a special occasion" },
  { label: "Full Month", amount: 11000, description: "Sponsor vastra and alankara for an entire month" },
];

const FAQS = [
  {
    q: "What is Vastra & Alankara Seva?",
    a: "Vastra & Alankara Seva is an opportunity to offer beautiful garments (vastra) and ornaments (alankara) to Sri Sri Radha Madan Mohan at the Hare Krishna Vaikuntham Temple. The Deities are dressed and decorated fresh each day, and your offering sustains this loving daily service.",
  },
  {
    q: "How is my offering used?",
    a: "Your donation directly funds the purchase of silk and cotton garments, flower garlands, jewellery, crowns, and other decorative items used to adorn the Deities each day. Every piece is selected with care and devotion.",
  },
  {
    q: "Can I sponsor vastra for a specific occasion?",
    a: "Yes! You can sponsor vastra and alankara for birthdays, anniversaries, festivals, or any auspicious day of your choice. Simply mention your preferred date in the notes during checkout and our team will ensure your offering is presented on that day.",
  },
  {
    q: "Is my donation eligible for 80G tax exemption?",
    a: "Yes. Donations to Hare Krishna Movement qualify for tax exemption under Section 80G of the Income Tax Act. Select the '80G receipt' option during checkout and provide your PAN.",
  },
  {
    q: "Will I receive a receipt?",
    a: "Yes. An email receipt is sent automatically the moment your payment is confirmed. Your 80G certificate follows separately once your PAN is verified.",
  },
  {
    q: "Is it safe to donate online here?",
    a: "Yes. All payments are processed through Razorpay, a PCI-DSS-compliant payment gateway. We never see or store your card details. You may also donate via direct bank transfer using the details on this page.",
  },
  {
    q: "Who are Sri Sri Radha Madan Mohan?",
    a: "Sri Sri Radha Madan Mohan are the presiding Deities of the Hare Krishna Vaikuntham Temple — Sri Krishna as Madan Mohan (the enchanter of Cupid) accompanied by Srimati Radharani, the embodiment of devotional love.",
  },
];

/* ------------------------------------------------------------------ */
/* Deity Photos — placeholder grid (replace src with actual images)    */
/* ------------------------------------------------------------------ */

const CLOUDINARY_BASE = "https://res.cloudinary.com/ddmzeqpkc/image/upload";

const DEITY_PHOTOS = [
  { src: `${CLOUDINARY_BASE}/v1784789161/754143185_18106079012124140_9218277978867266627_n_lud7kh.jpg`, caption: "Sri Sri Radha Madan Mohan — Morning Alankara" },
  { src: `${CLOUDINARY_BASE}/v1784789161/753540731_18106079036124140_6341094363808357522_n_jur5s8.jpg`, caption: "Divine Decorations" },
  { src: `${CLOUDINARY_BASE}/v1784789161/754143185_18105975167124140_1533039680985463931_n_lxlknf.jpg`, caption: "Festival Alankara" },
  { src: `${CLOUDINARY_BASE}/v1784789161/752242324_18105867767124140_2506812192966184656_n_r9bky2.jpg`, caption: "Ornamented with Devotion" },
  { src: `${CLOUDINARY_BASE}/v1784789160/714829441_18101119055124140_1555886520572389363_n_el0ck2.jpg`, caption: "Vastra Offering" },
  { src: `${CLOUDINARY_BASE}/v1784789160/730941493_18103255847124140_3537967313260341021_n_nqj31m.jpg`, caption: "Floral Garlands & Jewellery" },
  { src: `${CLOUDINARY_BASE}/v1784789160/733280264_18103358009124140_8149390804036801858_n_njmi0a.jpg`, caption: "Crown & Finery" },
  { src: `${CLOUDINARY_BASE}/v1784789160/729540128_18103255874124140_3446801748311052528_n_zdptak.jpg`, caption: "Special Occasion Dressing" },
  { src: `${CLOUDINARY_BASE}/v1784789160/731735720_18103469900124140_6488157149745670270_n_kecbun.jpg`, caption: "Deity Alankara — Detail" },
  { src: `${CLOUDINARY_BASE}/v1784789160/728861533_18103358021124140_6191753973788301200_n_tgmjxv.jpg`, caption: "Daily Seva — Full View" },
];

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const inputWrapClass =
  "relative flex items-center rounded-lg border border-border bg-card focus-within:border-gold transition-colors";
const inputClass =
  "h-10 w-full bg-transparent pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground";
const labelClass = "mb-1 block text-[11px] font-medium text-muted-foreground";

export default function AlankaraVastraClient() {
  const attribution = useAttribution("/alankara-vastra-seva");
  const razorpayReady = useRazorpayPreload();
  const [tierIndex, setTierIndex] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", mobile: "", panNumber: "", sevakName: "", dob: "" });
  const [want80G, setWant80G] = useState(false);
  const [monthly, setMonthly] = useState(false);
  const [wantsMahaPrasadam, setWantsMahaPrasadam] = useState(false);
  const [address, setAddress] = useState<PrasadamAddress>({ street: "", city: "", state: "", pincode: "", country: "India" });
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  const formRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const form = formRef.current;
    if (!form) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, []);

  const finalAmount = useCustom ? Number(customAmount) || 0 : TIERS[tierIndex]?.amount || 0;
  const config = VASTRA_CONFIG;
  const galleryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (finalAmount <= 999) {
      if (want80G) setWant80G(false);
      if (wantsMahaPrasadam) {
        setWantsMahaPrasadam(false);
        setAddress({ street: "", city: "", state: "", pincode: "", country: "India" });
      }
    }
  }, [finalAmount, want80G, wantsMahaPrasadam]);

  // Split 10 images into pages of 6 (2 rows × 3 cols)
  const galleryPages = DEITY_PHOTOS.reduce< typeof DEITY_PHOTOS[]>((pages, photo, i) => {
    const pageIndex = Math.floor(i / 6);
    if (!pages[pageIndex]) pages[pageIndex] = [];
    pages[pageIndex].push(photo);
    return pages;
  }, []);

  const BANK_DETAILS = {
    beneficiaryName: "HARE KRISHNA MOVEMENT INDIA",
    bankName: "IDFC FIRST BANK LTD",
    accountNumber: "10091415313",
    ifsc: "IDFB0080412",
  };

  const scrollToDonate = () => {
    document.getElementById("donate")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleCopy = (field: string, value: string) => {
    navigator.clipboard.writeText(value).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (finalAmount < 1) {
      setStatus({ type: "error", message: "Please select a valid amount." });
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
    if (want80G && !form.panNumber.trim()) {
      setStatus({ type: "error", message: "PAN number is required for an 80G receipt." });
      return;
    }
    if (wantsMahaPrasadam && (!address.street.trim() || !address.city.trim() || !address.state.trim() || !/^\d{6}$/.test(address.pincode.trim()))) {
      setStatus({ type: "error", message: "Please complete the delivery address (door no./area, city, state and a valid 6-digit PIN code) for Maha Prasadam." });
      return;
    }

    setSubmitting(true);
    try {
      const baseBody = {
        account: "default",
        sourcePage: "/alankara-vastra-seva",
        site: "kakinada",
        utm: attribution.payload().utm,
        type: config.orderType,
        sevaName: config.pageTitle,
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        mobile: form.mobile.trim(),
        amount: finalAmount,
        sevakName: form.sevakName.trim() || undefined,
        dob: form.dob || undefined,
        certificate: want80G,
        panNumber: want80G ? form.panNumber.trim() : undefined,
      };

      // Monthly autopay → Razorpay Subscription; one-time → Razorpay Order.
      const endpoint = monthly ? "/payments/subscription" : "/payments/order";
      const createRes = await fetch(`${apiBase()}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          monthly
            ? baseBody
            : {
                ...baseBody,
                mahaprasadam: wantsMahaPrasadam,
                prasadamAddress: wantsMahaPrasadam
                  ? { street: address.street.trim(), city: address.city.trim(), state: address.state.trim(), pincode: address.pincode.trim(), country: "India" }
                  : undefined,
              }
        ),
      });

      if (!createRes.ok) {
        throw new Error(
          monthly
            ? "Unable to start the monthly donation. Please try again."
            : "Unable to create payment order. Please try again."
        );
      }
      const created = await createRes.json();

      await razorpayReady();
      const win = window as unknown as { Razorpay?: RazorpayConstructor };
      if (!win.Razorpay) throw new Error("Razorpay checkout is unavailable.");

      const checkoutOptions: Record<string, unknown> = {
        key: created.key,
        name: "Hare Krishna Movement Kakinada",
        description: `${config.pageTitle}${monthly ? " — Monthly" : ""} — Hare Krishna Vaikuntham Temple`,
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        notes: { sourcePage: "/alankara-vastra-seva", sevaName: config.pageTitle, sevaType: config.orderType },
        handler: async (response: Record<string, string>) => {
          try {
            const verifyRes = await fetch(`${apiBase()}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: created.donationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                razorpay_subscription_id: response.razorpay_subscription_id,
              }),
            });
            if (!verifyRes.ok) throw new Error("Payment verification failed.");
            window.location.assign(`/payment/thank-you?type=seva&seva=${encodeURIComponent(config.pageTitle)}&amount=${finalAmount}&source=${encodeURIComponent("the vastra and alankara seva programme")}${monthly ? "&recurring=1" : ""}`);
          } catch (err) {
            setStatus({
              type: "error",
              message: err instanceof Error ? err.message : "Payment verification failed.",
            });
          } finally {
            setSubmitting(false);
          }
        },
        modal: { ondismiss: () => setSubmitting(false) },
        theme: { color: "#D69E2E" },
      };
      // Subscriptions authorise via subscription_id (no amount/order_id);
      // one-time payments pass the order and amount.
      if (monthly) {
        checkoutOptions.subscription_id = created.subscriptionId;
      } else {
        checkoutOptions.amount = Math.round(finalAmount * 100);
        checkoutOptions.currency = "INR";
        checkoutOptions.order_id = created.orderId;
      }

      new win.Razorpay(checkoutOptions).open();
    } catch (err) {
      setStatus({ type: "error", message: err instanceof Error ? err.message : "Something went wrong." });
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <WhatsAppFloatButton />
      <main className="bg-white dark:bg-background">
        {/* ── Hero Banner ── */}
        {config.bannerImage ? (
          <section className="bg-white dark:bg-background pt-[88px] md:pt-[104px]">
            <button
              type="button"
              onClick={scrollToDonate}
              aria-label="Donate — go to the donation form"
              className="block w-full cursor-pointer overflow-hidden rounded-b-3xl"
            >
              <Image
                src={config.bannerImageMobile || config.bannerImage}
                alt={`${config.pageTitle} — ${config.heroHeading1} ${config.heroHeading2}`}
                width={960}
                height={1639}
                priority
                sizes="100vw"
                className="block h-auto w-full md:hidden"
              />
              <Image
                src={config.bannerImage}
                alt={`${config.pageTitle} — ${config.heroHeading1} ${config.heroHeading2}`}
                width={1920}
                height={730}
                priority
                sizes="100vw"
                className="hidden h-auto w-full md:block"
              />
            </button>
          </section>
        ) : (
          <section className="relative min-h-[85vh] overflow-hidden bg-[hsl(220,90%,12%)]">
            <div className="absolute inset-0">
              <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${config.heroImage})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[hsl(220,90%,12%)]/95 via-[hsl(220,90%,12%)]/80 to-[hsl(220,90%,12%)]/50" />
              <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,90%,12%)] via-transparent to-transparent" />
            </div>
            <div className="pointer-events-none absolute -left-32 top-1/4 h-96 w-96 rounded-full bg-gold/10 blur-[120px]" />
            <div className="relative z-10 mx-auto flex min-h-[85vh] max-w-6xl items-center px-4 pt-28 pb-16 md:pt-32">
              <div className="w-full max-w-2xl">
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                  <p className="mb-4 text-xs font-semibold uppercase tracking-[0.3em] text-gold md:text-sm">
                    {config.heroTagline}
                  </p>
                  <h1 className="mb-4 font-heading text-4xl font-bold leading-tight text-white md:text-6xl">
                    {config.heroHeading1}
                    <br />
                    <span className="text-gold">{config.heroHeading2}</span>
                  </h1>
                  <p className="mb-8 text-base leading-relaxed text-white/75 md:text-lg">
                    {config.heroDesc}
                  </p>
                  <div className="mb-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                    <button
                      onClick={scrollToDonate}
                      className="rounded-full bg-gradient-gold px-10 py-4 text-base font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)] transition-all hover:scale-105 hover:shadow-[0_12px_32px_hsl(42,92%,46%,0.45)] md:text-lg"
                    >
                      Donate Now
                    </button>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-white/60">
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gold" /> Prasadam from the temple
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gold" /> Sankalpa & Aarti
                    </span>
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-gold" /> 80G tax exemption
                    </span>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>
        )}

        {/* ── Donation Form ── */}
        <section id="donate" ref={formRef} className="scroll-mt-24 bg-white dark:bg-background py-8 md:py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <Ornament className="mb-4" />
            <div className="mb-6 text-center">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Temple Service Campaign
              </p>
              <h2 className="mb-2 font-heading text-2xl font-bold text-primary md:text-3xl">
                {config.formHeading}
              </h2>
              <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground">
                {config.formSubheading}
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="overflow-hidden rounded-[28px] border border-border bg-white dark:bg-card shadow-elevated"
            >
              {/* Amount summary strip */}
              <div className="flex items-center justify-between gap-3 bg-gradient-gold px-6 py-4 sm:px-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(220,90%,12%)]/70">
                    You&apos;re offering
                  </p>
                  <p className="text-lg font-extrabold text-[hsl(220,90%,12%)] sm:text-xl">
                    {useCustom ? "Custom offering" : TIERS[tierIndex]?.label || "Select a tier"}
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-[hsl(220,90%,12%)] sm:text-3xl">
                  ₹{finalAmount > 0 ? finalAmount.toLocaleString("en-IN") : "0"}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2 lg:gap-8">
                {/* Left: amount selection */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Choose Your Offering
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {TIERS.map((tier, i) => (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => { setUseCustom(false); setTierIndex(i); }}
                        className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                          !useCustom && tierIndex === i
                            ? "border-gold bg-gold/10"
                            : "border-border bg-card hover:border-gold/60"
                        }`}
                      >
                        <span className="mb-1 block text-sm font-bold text-primary">{tier.label}</span>
                        <span className="mb-1 block text-[11px] leading-snug text-muted-foreground">
                          {tier.description}
                        </span>
                        <span className="block text-base font-extrabold text-gold">
                          ₹{tier.amount.toLocaleString("en-IN")}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Custom amount */}
                  <div
                    className={`flex items-center gap-3 rounded-lg border px-3 transition-colors ${
                      useCustom ? "border-gold bg-gold/5" : "border-border bg-card"
                    }`}
                  >
                    <label htmlFor="custom-amount" className="shrink-0 text-xs font-medium text-muted-foreground">
                      Other amount
                    </label>
                    <span className="text-sm text-foreground">₹</span>
                    <input
                      id="custom-amount"
                      type="number"
                      min={config.minCustomAmount}
                      placeholder={`Min ${config.minCustomAmount}`}
                      value={customAmount}
                      onFocus={() => setUseCustom(true)}
                      onChange={(e) => {
                        setUseCustom(true);
                        setCustomAmount(e.target.value);
                      }}
                      className="h-10 w-full min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
                    />
                  </div>

                  {/* Bank transfer */}
                  <details className="group rounded-lg border border-border bg-background/60 px-3 py-2">
                    <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold text-foreground">
                      Prefer a direct bank transfer?
                      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="mt-2.5 space-y-1.5">
                      {(
                        [
                          ["Beneficiary", BANK_DETAILS.beneficiaryName],
                          ["Bank", BANK_DETAILS.bankName],
                          ["Account No.", BANK_DETAILS.accountNumber],
                          ["IFSC", BANK_DETAILS.ifsc],
                        ] as const
                      ).map(([label, value]) => (
                        <div key={label} className="flex items-center justify-between gap-2 text-xs">
                          <span className="text-muted-foreground">{label}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(label, value)}
                            className="flex items-center gap-1.5 font-semibold text-foreground hover:text-gold"
                          >
                            {value}
                            {copiedField === label ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      ))}
                      <p className="pt-1 text-[11px] leading-relaxed text-muted-foreground">
                        Email your transaction reference and PAN (for 80G) to{" "}
                        <a href={`mailto:${config.email}`} className="font-semibold text-gold">
                          {config.email}
                        </a>
                        .
                      </p>
                    </div>
                  </details>
                </div>

                {/* Right: details, add-ons, submit */}
                <div className="flex flex-col space-y-3">
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div>
                      <label htmlFor="donor-name" className={labelClass}>Full name</label>
                      <div className={inputWrapClass}>
                        <User className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                        <input
                          id="donor-name"
                          type="text"
                          required
                          placeholder="Your name"
                          value={form.name}
                          onChange={(e) => setForm({ ...form, name: e.target.value })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="donor-mobile" className={labelClass}>Mobile number</label>
                      <div className={inputWrapClass}>
                        <Phone className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                        <input
                          id="donor-mobile"
                          type="tel"
                          required
                          maxLength={10}
                          inputMode="numeric"
                          placeholder="10-digit mobile"
                          value={form.mobile}
                          onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })}
                          className={inputClass}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="donor-email" className={labelClass}>Email address (optional)</label>
                    <div className={inputWrapClass}>
                      <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                      <input
                        id="donor-email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <DonorExtrasFields
                    sevakName={form.sevakName}
                    dob={form.dob}
                    onSevakNameChange={(v) => setForm({ ...form, sevakName: v })}
                    onDobChange={(v) => setForm({ ...form, dob: v })}
                    collapsible
                  />

                  {/* 80G */}
                  {finalAmount > 999 && (
                  <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
                    <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                      <input
                        type="checkbox"
                        checked={want80G}
                        onChange={(e) => setWant80G(e.target.checked)}
                        className="h-3.5 w-3.5 shrink-0 accent-[hsl(42,92%,46%)]"
                      />
                      I need an 80G tax exemption receipt
                    </label>
                    {want80G && (
                      <input
                        id="donor-pan"
                        type="text"
                        placeholder="PAN number *"
                        value={form.panNumber}
                        onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                        className="mt-2 h-9 w-full rounded-lg border border-border bg-card px-3 text-xs uppercase outline-none focus:border-gold"
                      />
                    )}
                  </div>
                  )}

                  {/* Maha Prasadam (one-time donations only) */}
                  {finalAmount > 999 && !monthly && (
                    <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
                      <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-foreground">
                        <input
                          type="checkbox"
                          checked={wantsMahaPrasadam}
                          onChange={(e) => setWantsMahaPrasadam(e.target.checked)}
                          className="h-3.5 w-3.5 shrink-0 accent-[hsl(42,92%,46%)]"
                        />
                        🙏 I&apos;d like Maha Prasadam delivered
                      </label>
                      {wantsMahaPrasadam && <AddressForm address={address} setAddress={setAddress} />}
                    </div>
                  )}

                  {/* Monthly autopay toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setMonthly((m) => {
                        const next = !m;
                        if (next) setWantsMahaPrasadam(false);
                        return next;
                      });
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
                      monthly ? "border-gold bg-gold/10" : "border-border bg-card hover:border-gold/60"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        monthly ? "border-gold bg-gold text-white" : "border-border"
                      }`}
                    >
                      {monthly && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-primary">🔁 Make it a monthly seva</span>
                      <span className="block text-[11px] leading-snug text-muted-foreground">
                        {monthly && finalAmount > 0
                          ? `Auto-pay ₹${finalAmount.toLocaleString("en-IN")} every month. Cancel anytime.`
                          : "Give this offering automatically every month."}
                      </span>
                    </span>
                  </button>

                  {status && (
                    <p
                      className={`rounded-lg px-3 py-2 text-xs font-medium ${
                        status.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {status.message}
                    </p>
                  )}

                  <div className="flex-1" />

                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-gold text-sm font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Processing…
                      </>
                    ) : monthly ? (
                      <>🔁 Donate ₹{finalAmount > 0 ? finalAmount.toLocaleString("en-IN") : "—"} / month</>
                    ) : (
                      <>Donate ₹{finalAmount > 0 ? finalAmount.toLocaleString("en-IN") : "—"}</>
                    )}
                  </button>
                  <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                    Secure payment via Razorpay · UPI, cards &amp; netbanking accepted
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        </section>

        {/* ── Donor Privileges ── */}
        <DonorPrivilegesSection scrollToDonate={scrollToDonate} />

        {/* ── Deity Alankara Photos ── */}
        <section className="bg-white dark:bg-background py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <Ornament className="mb-6" />
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  Divine beauty in every detail
                </p>
                <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl">
                  Deity Alankara Gallery
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                  Witness the exquisite daily dressing and ornamentation of Sri Sri Radha Madan Mohan —
                  each alankara a labour of love offered with devotion.
                </p>
              </div>
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => galleryRef.current?.scrollBy({ left: -galleryRef.current.offsetWidth, behavior: "smooth" })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-gold hover:text-gold"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll right"
                  onClick={() => galleryRef.current?.scrollBy({ left: galleryRef.current.offsetWidth, behavior: "smooth" })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-gold hover:text-gold"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div
              ref={galleryRef}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {galleryPages.map((page, pageIndex) => (
                <div
                  key={pageIndex}
                  className="w-full min-w-0 shrink-0 snap-start"
                >
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                    {page.map((photo, i) => (
                      <motion.div
                          key={photo.src}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06, duration: 0.5 }}
                          className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border shadow-sm"
                        >
                          <Image
                            src={photo.src}
                            alt={photo.caption}
                            fill
                            sizes="(max-width: 768px) 50vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                          <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full transition-transform duration-300 group-hover:translate-y-0 md:p-4">
                            <p className="text-xs font-semibold text-white md:text-sm">{photo.caption}</p>
                          </div>
                        </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Mobile scroll hint */}
            <div className="mt-4 flex justify-center gap-1.5 sm:hidden">
              {galleryPages.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to page ${i + 1}`}
                  onClick={() => {
                    const container = galleryRef.current;
                    if (container) {
                      container.scrollTo({ left: i * container.offsetWidth, behavior: "smooth" });
                    }
                  }}
                  className="h-1.5 rounded-full bg-border transition-all hover:bg-gold/50"
                  style={{ width: 24 }}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ── Power of Giving ── */}
        <ImportanceSection />

        {/* ── FAQs ── */}
        <FaqSection faqs={FAQS} />

        {/* ── Founder's words ── */}
        <FounderSection />

        {/* ── Sticky mobile donate bar ── */}
        {showSticky && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 pt-1 md:hidden">
          <button
            onClick={scrollToDonate}
            className="inline-flex items-center gap-1.5 rounded-full bg-gradient-gold px-5 py-2 text-xs font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)]"
          >
            🪔 Donate Now
          </button>
        </div>
        )}
      </main>
    </PageLayout>
  );
}

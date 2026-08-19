"use client";

import { useState, useRef, useEffect } from "react";
import { useAttribution } from "@/lib/useAttribution";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Loader2, ShieldCheck, User, Phone, Mail, Check, Copy,
  ChevronDown, ChevronLeft, ChevronRight, Quote,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";
import Ornament from "@/components/Ornament";
import ImportanceSection from "@/components/shared/ImportanceSection";
import FaqSection from "@/components/shared/FaqSection";
import FounderSection from "@/components/shared/FounderSection";
import AddressForm from "@/components/AddressForm";
import type { PrasadamAddress } from "@/components/AddressForm";
import DonorExtrasFields from "@/components/DonorExtrasFields";
import { getSevaCampaignConfig, GAU_CAMPAIGN, type SevaCampaignConfig } from "@/lib/sevaCampaignConfig";

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const BANK_DETAILS = {
  beneficiaryName: "HARE KRISHNA MOVEMENT INDIA",
  bankName: "IDFC FIRST BANK LTD",
  accountNumber: "10091415313",
  ifsc: "IDFB0080412",
};

interface Donor {
  name: string;
  amount: number;
  time: string;
}

interface SevaStats {
  donors: Donor[];
  totalAmount: number;
  donorCount: number;
}

const inputWrapClass =
  "relative flex items-center rounded-lg border border-slate-300 bg-white dark:bg-card focus-within:border-gold transition-colors";
const inputClass =
  "h-10 w-full bg-transparent pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground";
const labelClass = "mb-1 block text-[11px] font-medium text-muted-foreground";
const addonBoxClass = "rounded-lg border border-slate-200 bg-white dark:bg-card px-3 py-2";

function unitImpact(amount: number, config: SevaCampaignConfig): string | null {
  const unit = config.unit;
  if (!unit || !Number.isFinite(amount) || amount < unit.price) return null;
  const count = Math.floor(amount / unit.price);
  return `${count.toLocaleString("en-IN")} ${count === 1 ? unit.singular : unit.plural}`;
}

export default function SevaCampaignClient({ slug }: { slug: string }) {
  const config: SevaCampaignConfig = getSevaCampaignConfig(slug) ?? GAU_CAMPAIGN;
  const searchParams = useSearchParams();
  const attribution = useAttribution(config.path);
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
  const [stats, setStats] = useState<SevaStats | null>(null);
  const formRef = useRef<HTMLElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const amountParam = searchParams.get("amount");
    if (amountParam) {
      const amt = Number(amountParam);
      const idx = config.tiers.findIndex((t) => t.amount === amt);
      if (idx >= 0) {
        setTierIndex(idx);
        setUseCustom(false);
      } else if (amt > 0) {
        setUseCustom(true);
        setCustomAmount(String(amt));
      }
      setTimeout(() => {
        document.getElementById("donate")?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    }
    // Only react to the first amount param — config stays stable.
  }, [searchParams]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(
          `${apiBase()}/seva-stats?sevaName=${encodeURIComponent(config.pageTitle)}&category=${encodeURIComponent(config.category)}&limit=10`
        );
        if (res.ok) setStats(await res.json());
      } catch {}
    })();
  }, [config.pageTitle, config.category]);

  const finalAmount = useCustom ? Number(customAmount) || 0 : config.tiers[tierIndex]?.amount || 0;
  const impact = unitImpact(finalAmount, config);
  const addonsEligible = finalAmount > 999;

  useEffect(() => {
    if (!addonsEligible) {
      if (want80G) setWant80G(false);
      if (wantsMahaPrasadam) {
        setWantsMahaPrasadam(false);
        setAddress({ street: "", city: "", state: "", pincode: "", country: "India" });
      }
    }
  }, [addonsEligible]);

  const galleryPages = config.gallery.photos.reduce< typeof config.gallery.photos[]>(
    (pages, photo, i) => {
      const pageIndex = Math.floor(i / 6);
      if (!pages[pageIndex]) pages[pageIndex] = [];
      pages[pageIndex].push(photo);
      return pages;
    },
    []
  );

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
    if (!form.name.trim() || !form.email.trim()) {
      setStatus({ type: "error", message: "Please fill in your name, email, and phone number." });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(form.mobile.trim())) {
      setStatus({ type: "error", message: "Please enter a valid 10-digit mobile number." });
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
      // Shared donor/seva fields for both one-time and monthly flows.
      const baseBody = {
        account: config.account,
        sourcePage: config.path,
        site: "kakinada",
        utm: attribution.payload().utm,
        type: config.type,
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
            ? { ...baseBody, sevaUnitLabel: impact || undefined }
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
        notes: { sourcePage: config.path, sevaName: config.pageTitle, sevaType: config.type },
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
            window.location.assign(`/payment/thank-you?type=seva&seva=${encodeURIComponent(config.pageTitle)}&amount=${finalAmount}&source=${encodeURIComponent("the " + config.pageTitle.toLowerCase() + " programme")}${monthly ? "&recurring=1" : ""}`);
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
        {/* ── Hero Banner (plain banner image — no content overlay) ── */}
        <section className="bg-white dark:bg-background pt-[88px] md:pt-[104px]">
          <button
            type="button"
            onClick={scrollToDonate}
            aria-label="Donate — go to the donation form"
            className="block w-full cursor-pointer overflow-hidden rounded-b-3xl"
          >
            <Image
              src={config.bannerImageMobile || config.bannerImage || config.heroImage}
              alt={`${config.pageTitle} — ${config.heroHeading1} ${config.heroHeading2}`}
              width={config.bannerMobileWidth ?? 941}
              height={config.bannerMobileHeight ?? 1672}
              priority
              sizes="100vw"
              className="block h-auto w-full md:hidden"
            />
            <Image
              src={config.bannerImage || config.heroImage}
              alt={`${config.pageTitle} — ${config.heroHeading1} ${config.heroHeading2}`}
              width={config.bannerWidth ?? 1672}
              height={config.bannerHeight ?? 941}
              priority
              sizes="100vw"
              className="hidden h-auto w-full md:block"
            />
          </button>
        </section>

        {/* A real, visible H1 — the banner above is a pure image (no
            selectable/crawlable text), so without this the page has no
            text-based top-level heading at all, which hurts both SEO and
            accessibility (screen readers, images-disabled browsing). */}
        <div className="bg-white px-4 pb-2 pt-5 text-center dark:bg-background md:pt-6">
          <h1 className="font-heading text-2xl font-bold text-primary md:text-3xl">
            {config.heroHeading1} <span className="text-gold">— {config.heroHeading2}</span>
          </h1>
        </div>

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
              className="overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:bg-card shadow-elevated"
            >
              {/* Amount summary strip */}
              <div className="flex items-center justify-between gap-3 bg-gradient-gold px-6 py-4 sm:px-8">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(220,90%,12%)]/70">
                    You&apos;re offering
                  </p>
                  <p className="text-lg font-extrabold text-[hsl(220,90%,12%)] sm:text-xl">
                    {useCustom
                      ? "Custom offering"
                      : config.tiers[tierIndex]?.label || "Select a tier"}
                  </p>
                </div>
                <p className="text-2xl font-extrabold text-[hsl(220,90%,12%)] sm:text-3xl">
                  ₹{finalAmount > 0 ? finalAmount.toLocaleString("en-IN") : "0"}
                  {monthly && <span className="text-base font-bold">/mo</span>}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2 lg:gap-8">
                {/* Left: amount selection */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    Choose Your Offering
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {config.tiers.map((tier, i) => (
                      <button
                        key={tier.amount}
                        type="button"
                        onClick={() => { setUseCustom(false); setTierIndex(i); }}
                        className={`rounded-lg border px-3 py-3 text-left transition-colors ${
                          !useCustom && tierIndex === i
                            ? "border-gold bg-gold/10"
                            : "border-slate-300 bg-white dark:bg-card hover:border-gold/60"
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
                      useCustom ? "border-gold bg-gold/5" : "border-dashed border-slate-300 bg-white dark:bg-card focus-within:border-gold"
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
                      placeholder={`Min ₹${config.minCustomAmount}`}
                      value={customAmount}
                      onFocus={() => setUseCustom(true)}
                      onChange={(e) => {
                        setUseCustom(true);
                        setCustomAmount(e.target.value);
                      }}
                      className="h-10 w-full min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground"
                    />
                  </div>
                  {impact && (
                    <p className="rounded-lg bg-gold/10 px-3 py-2 text-xs font-semibold text-gold">
                      🙏 {useCustom ? "Your donation " : "This offering "}supports {impact}
                    </p>
                  )}

                  {/* Bank transfer */}
                  <details className="group rounded-lg border border-slate-200 bg-background/60 px-3 py-2">
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
                        <a href="mailto:social@hkmvizag.org" className="font-semibold text-gold">
                          social@hkmvizag.org
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
                    <label htmlFor="donor-email" className={labelClass}>Email address</label>
                    <div className={inputWrapClass}>
                      <Mail className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                      <input
                        id="donor-email"
                        type="email"
                        required
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
                  {addonsEligible && (
                    <div className={addonBoxClass}>
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
                          className="mt-2 h-9 w-full rounded-lg border border-slate-300 bg-white dark:bg-card px-3 text-xs uppercase outline-none focus:border-gold"
                        />
                      )}
                    </div>
                  )}

                  {/* Maha Prasadam (one-time donations only) */}
                  {addonsEligible && !monthly && (
                    <div className={addonBoxClass}>
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
                      monthly ? "border-gold bg-gold/10" : "border-slate-300 bg-white dark:bg-card hover:border-gold/60"
                    }`}
                  >
                    <span
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border ${
                        monthly ? "border-gold bg-gold text-white" : "border-slate-300"
                      }`}
                    >
                      {monthly && <Check className="h-3.5 w-3.5" />}
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-bold text-primary">🔁 Make it a monthly seva</span>
                      <span className="block text-[11px] leading-snug text-muted-foreground">
                        {monthly && finalAmount > 0
                          ? `Auto-pay ₹${finalAmount.toLocaleString("en-IN")}${impact ? ` (${impact})` : ""} every month. Cancel anytime.`
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

        {/* ── About ── */}
        <section className="bg-white dark:bg-background py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <Ornament className="mb-6" />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="grid items-center gap-10 md:grid-cols-2"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl">
                <Image
                  src={config.about.image}
                  alt={config.pageTitle}
                  fill
                  unoptimized
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                  {config.about.eyebrow}
                </p>
                <h2 className="mb-4 font-heading text-2xl font-bold text-primary md:text-3xl">
                  {config.about.heading}
                </h2>
                {config.about.paragraphs.map((p, i) => (
                  <p key={i} className="mb-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                    {p}
                  </p>
                ))}
                <button
                  onClick={scrollToDonate}
                  className="mt-2 rounded-full bg-gradient-gold px-8 py-3 text-sm font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)] transition-all hover:scale-105 hover:shadow-[0_12px_32px_hsl(42,92%,46%,0.4)]"
                >
                  {config.about.ctaLabel}
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── Impact ── */}
        <section className="bg-[radial-gradient(circle_at_top,_rgba(255,221,91,0.1),_transparent_45%)] bg-white dark:bg-background py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <Ornament className="mb-6" />
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Why it matters
              </p>
              <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl">
                The Significance of {config.pageTitle}
              </h2>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {config.impactItems.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-2xl border border-slate-200 bg-card p-6 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/10 text-gold">
                    <item.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-heading text-base font-bold text-primary">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{item.text}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── What your donation does ── */}
        <section className="bg-white dark:bg-background py-12 md:py-16">
          <div className="container mx-auto max-w-5xl px-4">
            <Ornament className="mb-6" />
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                What your offering does
              </p>
              <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl">
                Where Your Donation Goes
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {config.features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                  className="flex gap-4 rounded-2xl border border-slate-200 bg-card p-5"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <f.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1 text-sm font-bold text-primary">{f.title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">{f.text}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Donor privileges ── */}
        <section className="bg-[hsl(220,90%,12%)] py-12 md:py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <Ornament className="mb-6" />
            <div className="mx-auto mb-10 max-w-2xl text-center">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                Our gratitude to every donor
              </p>
              <h2 className="font-heading text-2xl font-bold text-white md:text-3xl">
                Donor Privileges
              </h2>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {config.privileges.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gold/15 text-gold">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 font-heading text-base font-bold text-white">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-white/70">{p.text}</p>
                </motion.div>
              ))}
            </div>
            <div className="mt-10 text-center">
              <button
                onClick={scrollToDonate}
                className="rounded-full bg-gradient-gold px-10 py-3.5 text-sm font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)] transition-all hover:scale-105"
              >
                Donate Now
              </button>
            </div>
          </div>
        </section>

        {/* ── Testimonials ── */}
        <section className="bg-white dark:bg-background py-12 md:py-16">
          <div className="container mx-auto max-w-7xl px-4">
            <Ornament className="mb-6" />
            <div className="mb-10 flex items-end justify-between gap-4">
              <div className="max-w-2xl">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-gold">
                  What Our Devotees Say
                </p>
                <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl">
                  Voices of Devotion
                </h2>
              </div>
              <div className="hidden gap-2 sm:flex">
                <button
                  type="button"
                  aria-label="Scroll left"
                  onClick={() => testimonialsRef.current?.scrollBy({ left: -400, behavior: "smooth" })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-gold hover:text-gold"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Scroll right"
                  onClick={() => testimonialsRef.current?.scrollBy({ left: 400, behavior: "smooth" })}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-gold hover:text-gold"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
            <motion.div
              ref={testimonialsRef}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {config.testimonials.map((t) => (
                <div
                  key={t.name}
                  className="w-80 shrink-0 snap-start rounded-2xl border border-slate-200 bg-card p-6 shadow-sm transition-shadow hover:shadow-md sm:w-96"
                >
                  <Quote className="mb-4 h-7 w-7 text-gold/40" />
                  <p className="mb-6 text-sm leading-relaxed text-foreground/85 md:text-base">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3 border-t border-border pt-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold/15 text-sm font-bold text-gold">
                      {t.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── Recent devotees supporting this seva ── */}
        {stats && stats.donors.length > 0 && (
          <section className="bg-white dark:bg-background py-12 md:py-16">
            <div className="container mx-auto max-w-5xl px-4">
              <Ornament className="mb-6" />
              <div className="mb-8 flex flex-col items-center justify-center gap-2 text-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wide text-green-600">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                  </span>
                  Live
                </span>
                <h2 className="font-heading text-xl font-bold text-primary">
                  Recent Devotees Supporting This Seva
                </h2>
              </div>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
                {stats.donors.slice(0, 6).map((d, i) => (
                  <motion.div
                    key={`${d.name}-${i}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-card px-3.5 py-2.5"
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
          </section>
        )}

        {/* ── Gallery ── */}
        {config.gallery.photos.length > 0 && (
          <section className="bg-white dark:bg-background py-12 md:py-16">
            <div className="container mx-auto max-w-6xl px-4">
              <Ornament className="mb-6" />
              <div className="mb-8 flex items-end justify-between gap-4">
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
                    {config.gallery.eyebrow}
                  </p>
                  <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl">
                    {config.gallery.heading}
                  </h2>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    {config.gallery.subtitle}
                  </p>
                </div>
                {galleryPages.length > 1 && (
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
                )}
              </div>

              <div
                ref={galleryRef}
                className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {galleryPages.map((page, pageIndex) => (
                  <div key={pageIndex} className="w-full min-w-0 shrink-0 snap-start">
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4">
                      {page.map((photo, i) => (
                        <motion.div
                          key={photo.src + i}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.06, duration: 0.5 }}
                          className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-slate-200 shadow-sm"
                        >
                          <Image
                            src={photo.src}
                            alt={photo.caption}
                            fill
                            unoptimized
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

              {galleryPages.length > 1 && (
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
              )}
            </div>
          </section>
        )}

        {/* ── Power of Giving ── */}
        <ImportanceSection />

        {/* ── FAQs ── */}
        <FaqSection faqs={config.faqs} />

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

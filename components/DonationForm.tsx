"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, CheckCircle2, Loader2, ShieldCheck, User, Phone, Mail } from "lucide-react";
import { type Seva, unitImpact } from "@/lib/sevaConfig";
import { newEventId, getMetaBrowserData, trackPurchase } from "@/lib/metaPixel";
import { useAttribution } from "@/lib/useAttribution";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";
import AddressForm from "@/components/AddressForm";
import type { PrasadamAddress } from "@/components/AddressForm";
import DonorExtrasFields from "@/components/DonorExtrasFields";

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

export interface DonationDonor {
  name: string;
  amount: number;
  time: string;
}

interface DonationFormProps {
  seva: Seva;
  /** Page the donation originates from — used for attribution + receipt source. */
  sourcePage: string;
  /** Optional festival slug (e.g. "chaturmas") appended to payment orders. */
  festivalSlug?: string;
  /** Pre-select a tier (or fall back to custom amount) on mount. */
  initialAmount?: number;
  /** Called after a successful one-time/monthly payment is verified. */
  onSuccess?: (donor: DonationDonor) => void;
  /** Thank-you URL type ("donation" for seva pages, "seva" for campaign pages). */
  thankYouType?: "donation" | "seva";
  /** Source label shown on the thank-you page. */
  thankYouSource?: string;
  /** Meta-pixel content name for purchase tracking. */
  trackContentName?: string;
  /** "stacked" (default) = single-column form used on /donate/[seva] pages.
      "grid" = compact two-column campaign form (Square Foot style). */
  variant?: "stacked" | "grid";
}

// Compact two-column ("grid") layout styling, matching the Square Foot
// campaign donation form.
const inputWrapClass =
  "relative flex items-center rounded-lg border border-slate-300 bg-white dark:bg-card focus-within:border-gold transition-colors";
const inputClass =
  "h-10 w-full bg-transparent pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground";
const labelClass = "mb-1 block text-[11px] font-medium text-muted-foreground";
const addonBoxClass = "rounded-lg border border-slate-200 bg-white dark:bg-card px-3 py-2";

/**
 * The full donation form used on every seva page (amount tiers, custom
 * amount, monthly autopay, 80G, Maha Prasadam, sevak details). Self-contained
 * so campaign pages like Chaturmas can offer the exact same checkout.
 */
export default function DonationForm({
  seva,
  sourcePage,
  festivalSlug,
  initialAmount,
  onSuccess,
  thankYouType = "donation",
  thankYouSource = "our seva programmes",
  trackContentName,
  variant = "stacked",
}: DonationFormProps) {
  const router = useRouter();
  const attribution = useAttribution(sourcePage);
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

  // Pre-select a tier (or custom amount) when arriving with ?amount=...
  useEffect(() => {
    if (initialAmount && initialAmount > 0) {
      const idx = seva.tiers.findIndex((t) => t.amount === initialAmount);
      if (idx >= 0) {
        setTierIndex(idx);
        setUseCustom(false);
      } else {
        setUseCustom(true);
        setCustomAmount(String(initialAmount));
      }
    }
  }, [seva, initialAmount]);

  const finalAmount = useCustom ? Number(customAmount) || 0 : seva.tiers[tierIndex]?.amount || 0;
  const customImpact = useCustom ? unitImpact(finalAmount, seva.unit) : null;
  // Bare per-unit impact (e.g. "3 Gitas") for the monthly-donation label.
  const monthlyImpact = seva.unit ? unitImpact(finalAmount, seva.unit, true) : null;

  useEffect(() => {
    if (finalAmount <= 999) {
      if (want80G) setWant80G(false);
      if (wantsMahaPrasadam) {
        setWantsMahaPrasadam(false);
        setAddress({ street: "", city: "", state: "", pincode: "", country: "India" });
      }
    }
  }, [finalAmount, want80G, wantsMahaPrasadam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (finalAmount < 1) {
      setStatus({ type: "error", message: "Please enter a valid amount." });
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
      const metaEventId = newEventId();
      const metaBrowser = getMetaBrowserData();

      // Shared donor/seva fields for both one-time and monthly flows.
      const baseBody = {
        account: seva.account,
        sourcePage,
        site: "kakinada",
        ...(festivalSlug ? { festivalSlug } : {}),
        utm: attribution.payload().utm,
        type: seva.category,
        sevaName: seva.title,
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
            ? { ...baseBody, sevaUnitLabel: monthlyImpact || undefined }
            : {
                ...baseBody,
                mahaprasadam: wantsMahaPrasadam,
                prasadamAddress: wantsMahaPrasadam
                  ? { street: address.street.trim(), city: address.city.trim(), state: address.state.trim(), pincode: address.pincode.trim(), country: "India" }
                  : undefined,
                metaEventId,
                metaFbp: metaBrowser.fbp,
                metaFbc: metaBrowser.fbc,
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
        description: monthly ? `${seva.title} — Monthly` : seva.title,
        prefill: { name: form.name, email: form.email, contact: form.mobile },
        notes: { sourcePage, sevaName: seva.title, sevaType: seva.category },
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
            trackPurchase({ value: finalAmount, eventId: metaEventId, content_name: trackContentName || seva.title });
            onSuccess?.({ name: `${form.name.split(" ")[0]} ${form.name.split(" ").slice(-1)[0].charAt(0)}.`, amount: finalAmount, time: "just now" });
            router.push(
              `/payment/thank-you?type=${thankYouType}&seva=${encodeURIComponent(seva.title)}&amount=${finalAmount}&source=${encodeURIComponent(thankYouSource)}${monthly ? "&recurring=1" : ""}`
            );
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

  // Compact two-column campaign layout (Square Foot style).
  if (variant === "grid") {
    return (
      <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white dark:bg-card shadow-elevated">
        {/* Amount summary strip */}
        <div className="flex items-center justify-between gap-3 bg-gradient-gold px-6 py-4 sm:px-8">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[hsl(220,90%,12%)]/70">
              {monthly ? "You&apos;re offering monthly" : "You&apos;re offering"}
            </p>
            <p className="text-lg font-extrabold text-[hsl(220,90%,12%)] sm:text-xl">{seva.title}</p>
          </div>
          <p className="text-2xl font-extrabold text-[hsl(220,90%,12%)] sm:text-3xl">
            ₹{finalAmount ? finalAmount.toLocaleString("en-IN") : "0"}
            {monthly && <span className="text-base font-bold">/mo</span>}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6 p-5 sm:p-7 lg:grid-cols-2 lg:gap-8">
          {/* Left: amount selection */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              Choose Amount
            </p>
            <div className="grid grid-cols-2 gap-2">
              {seva.tiers.map((tier, i) => (
                <button
                  key={tier.label}
                  type="button"
                  onClick={() => { setTierIndex(i); setUseCustom(false); }}
                  className={`rounded-lg border px-3 py-2.5 text-center transition-colors ${
                    !useCustom && tierIndex === i
                      ? "border-gold bg-gold/10"
                      : "border-slate-300 bg-white dark:bg-card hover:border-gold/60"
                  }`}
                >
                  <span className="block text-[11px] font-semibold leading-snug text-muted-foreground">{tier.label}</span>
                  <span className="mt-1 block text-base font-bold text-gold sm:text-lg">
                    ₹{tier.amount.toLocaleString("en-IN")}
                  </span>
                </button>
              ))}
            </div>

            {/* Other amount */}
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
                min={1}
                placeholder="Min ₹100"
                value={customAmount}
                onFocus={() => setUseCustom(true)}
                onChange={(e) => {
                  setUseCustom(true);
                  setCustomAmount(e.target.value);
                }}
                className="h-10 w-full min-w-0 bg-transparent text-sm font-semibold text-foreground outline-none placeholder:font-normal placeholder:text-muted-foreground/60"
              />
              {customImpact && (
                <span className="shrink-0 text-[11px] font-semibold text-gold">🙏 {customImpact}</span>
              )}
            </div>
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

            {/* Maha Prasadam (one-time donations only) */}
            {finalAmount > 999 && !monthly && (
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

            {/* 80G */}
            {finalAmount > 999 && (
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
                <span className="block text-sm font-bold text-primary">🔁 Make it a monthly donation</span>
                <span className="block text-[11px] leading-snug text-muted-foreground">
                  {monthly && finalAmount
                    ? `Auto-pay ₹${finalAmount.toLocaleString("en-IN")}${monthlyImpact ? ` (${monthlyImpact})` : ""} every month. Cancel anytime.`
                    : "Give this amount automatically every month."}
                </span>
              </span>
            </button>

            {status?.type === "error" && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{status.message}</p>
            )}

            <div className="flex-1" />

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-gradient-gold text-sm font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.01] disabled:opacity-60 disabled:hover:scale-100"
            >
              {submitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
              ) : monthly ? (
                <>🔁 Donate ₹{finalAmount ? finalAmount.toLocaleString("en-IN") : "0"} / month</>
              ) : (
                <>🪔 Donate ₹{finalAmount ? finalAmount.toLocaleString("en-IN") : "0"} Now</>
              )}
            </button>
            <p className="flex items-center justify-center gap-1.5 text-center text-[11px] text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-gold" />
              Secure payment via Razorpay · UPI, cards &amp; netbanking accepted
            </p>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-elevated">
      {status?.type === "success" ? (
        <div className="flex flex-col items-center py-6 text-center">
          <CheckCircle2 className="mb-3 h-12 w-12 text-green-500" />
          <h3 className="mb-2 font-heading text-lg font-bold">Thank You!</h3>
          <p className="mb-6 text-sm text-muted-foreground">{status.message}</p>
          <button
            onClick={() => { setStatus(null); router.push("/"); }}
            className="rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-[hsl(220,60%,12%)]"
          >
            Back to Home
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
            Choose an Amount
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {seva.tiers.map((tier, i) => (
              <button
                key={tier.label}
                type="button"
                onClick={() => { setTierIndex(i); setUseCustom(false); }}
                className={`rounded-xl border-[1.5px] px-3 py-3 text-center text-sm font-semibold transition-all ${
                  !useCustom && tierIndex === i
                    ? "border-[hsl(var(--gold-deep))] bg-[hsl(42,92%,56%,0.12)] text-gold"
                    : "border-border hover:border-[hsl(var(--gold-deep))]"
                }`}
              >
                {tier.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setUseCustom(true)}
            className={`w-full rounded-xl border-[1.5px] px-3 py-3 text-sm font-semibold transition-all ${
              useCustom ? "border-[hsl(var(--gold-deep))] bg-[hsl(42,92%,56%,0.12)] text-gold" : "border-border hover:border-[hsl(var(--gold-deep))]"
            }`}
          >
            Enter a custom amount
          </button>

          <div className="rounded-2xl bg-gradient-gold p-[2px] shadow-gold">
            <div className="rounded-[calc(1rem-2px)] bg-card p-4 text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {monthly ? "You are donating monthly" : "You are donating"}
              </p>
              <p className="font-heading text-4xl font-extrabold text-gold drop-shadow-sm">
                ₹{finalAmount ? finalAmount.toLocaleString("en-IN") : "0"}
                {monthly && <span className="text-xl font-bold">/mo</span>}
              </p>
              <p className="text-xs font-semibold text-muted-foreground">{seva.title}</p>
            </div>
          </div>

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
            className={`flex w-full items-center gap-3 rounded-xl border-[1.5px] px-4 py-3 text-left transition-all ${
              monthly
                ? "border-[hsl(var(--gold-deep))] bg-[hsl(42,92%,56%,0.12)]"
                : "border-border hover:border-[hsl(var(--gold-deep))]"
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
              <span className="block text-sm font-bold text-primary">🔁 Make it a monthly donation</span>
              <span className="block text-xs text-muted-foreground">
                {monthly && finalAmount
                  ? `Auto-pay ₹${finalAmount.toLocaleString("en-IN")}${monthlyImpact ? ` (${monthlyImpact})` : ""} every month. Cancel anytime.`
                  : "Give this amount automatically every month."}
              </span>
            </span>
          </button>

          {useCustom && (
            <div>
              <label className="mb-1 block text-xs font-semibold text-muted-foreground">Amount (₹)</label>
              <input
                type="number"
                min={1}
                required
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Enter amount"
              />
              {customImpact && (
                <p className="mt-1.5 text-xs font-semibold text-gold">
                  🙏 {customImpact}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Full Name</label>
            <input
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Email (optional)</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-muted-foreground">Phone Number</label>
            <input
              type="tel"
              required
              maxLength={10}
              inputMode="numeric"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value.replace(/[^\d]/g, "").slice(0, 10) })}
              className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="10-digit mobile number"
            />
          </div>

          <DonorExtrasFields
            sevakName={form.sevakName}
            dob={form.dob}
            onSevakNameChange={(v) => setForm({ ...form, sevakName: v })}
            onDobChange={(v) => setForm({ ...form, dob: v })}
            collapsible
          />

          {finalAmount > 999 && (
            <>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={want80G}
                  onChange={(e) => setWant80G(e.target.checked)}
                  className="rounded"
                />
                I want an 80G tax exemption receipt
              </label>
              {want80G && (
                <div>
                  <label className="mb-1 block text-xs font-semibold text-muted-foreground">PAN Number</label>
                  <input
                    required
                    value={form.panNumber}
                    onChange={(e) => setForm({ ...form, panNumber: e.target.value.toUpperCase() })}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm uppercase outline-none focus:border-primary"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>
              )}
            </>
          )}

          {finalAmount > 999 && !monthly && (
            <div className="rounded-lg border border-border bg-background/60 px-3 py-2">
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-foreground">
                <input
                  type="checkbox"
                  checked={wantsMahaPrasadam}
                  onChange={(e) => setWantsMahaPrasadam(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded accent-[hsl(42,92%,46%)]"
                />
                🙏 I&apos;d like Maha Prasadam delivered
              </label>
              {wantsMahaPrasadam && <AddressForm address={address} setAddress={setAddress} />}
            </div>
          )}

          {status?.type === "error" && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{status.message}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-gold py-3.5 text-[15px] font-bold text-[hsl(220,60%,12%)] shadow-gold transition-transform hover:scale-[1.02] disabled:opacity-60"
          >
            {submitting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Processing…</>
            ) : monthly ? (
              <>🔁 Donate ₹{finalAmount ? finalAmount.toLocaleString("en-IN") : "0"} / month</>
            ) : (
              <>🪔 Donate ₹{finalAmount ? finalAmount.toLocaleString("en-IN") : "0"} Now</>
            )}
          </button>
          <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay
          </p>
        </form>
      )}
    </div>
  );
}

"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  Check, Copy, ShieldCheck,
  FileCheck2, UtensilsCrossed, Clock, Heart,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DonorExtrasFields from "@/components/DonorExtrasFields";
import { useDonorPrefill } from "@/lib/donorPrefill";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import FaqSection from "@/components/sqft-campaign/FaqSection";
import PageLayout from "@/components/PageLayout";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";
import { useAttribution } from "@/lib/useAttribution";
import { useSearchParams } from "next/navigation";
import { usePaymentStatusPoller } from "@/lib/usePaymentStatusPoller";
import { useScrollToDonate } from "@/lib/useScrollToDonate";
import {
  newEventId,
  getMetaBrowserData,
  trackInitiateCheckout,
  trackPurchase,
} from "@/lib/metaPixel";

// ─── Types ───────────────────────────────────────────────────────────────────

type SevaOption = {
  legacySevaId: number;
  label: string;
  amount: number | null;
};

type Seva = {
  slug: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  options: SevaOption[];
};

type CheckoutForm = {
  donorName: string;
  donorMobile: string;
  donorEmail: string;
  customAmount: string;
  wantPrasadam: boolean;
  want80G: boolean;
  panNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  sevakName: string;
  dob: string;
};

type SelectedOffering = {
  seva: Seva;
  option: SevaOption;
};

type RazorpayConstructor = new (
  options: Record<string, unknown>
) => { open: () => void };

// ─── Data ────────────────────────────────────────────────────────────────────

const DESKTOP_BANNER =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1789476038584-1789476037499-govardhan-desk.webp";
const MOBILE_BANNER =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1789476039312-1789476037958-govardhan-mobile.webp";
const DECOR_GARLAND =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785481873117-1785481872052-garland-removebg-preview.png";

const sevas: Seva[] = [
  {
    slug: "govardhan",
    title: "Govardhan Seva",
    description:
      "Sponsor the sacred worship of Govardhan Hill — the divine mountain lifted by Lord Krishna to protect the residents of Vrindavan.",
    icon: "⛰️",
    image: "/assets/janmashtami-sk3.webp",
    options: [
      { legacySevaId: 3400, label: "Donate Rs. 21,111", amount: 21111 },
      { legacySevaId: 3401, label: "Donate Rs. 11,111", amount: 11111 },
      { legacySevaId: 3402, label: "Donate Rs. 5,555", amount: 5555 },
      { legacySevaId: 3403, label: "Donate Rs. 2,100", amount: 2100 },
      { legacySevaId: 3404, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "gau-seva",
    title: "Gau Seva",
    description:
      "Serve the sacred cows at our goshala — a seva supremely dear to Lord Krishna and Govardhan.",
    icon: "🐄",
    image: "/assets/janmashtami-sk4.webp",
    options: [
      { legacySevaId: 3410, label: "Donate Rs. 5,555", amount: 5555 },
      { legacySevaId: 3411, label: "Donate Rs. 3,100", amount: 3100 },
      { legacySevaId: 3412, label: "Donate Rs. 2,100", amount: 2100 },
      { legacySevaId: 3413, label: "Donate Rs. 1,100", amount: 1100 },
      { legacySevaId: 3414, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "bhog",
    title: "Bhog Seva",
    description:
      "Sponsor the sacred food offering — exquisite dishes prepared with love for the Lordships on Govardhan Puja.",
    icon: "🍽️",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785833545819-1785833545717-naivedya.jpeg",
    options: [
      { legacySevaId: 3420, label: "Donate Rs. 11,111", amount: 11111 },
      { legacySevaId: 3421, label: "Donate Rs. 7,777", amount: 7777 },
      { legacySevaId: 3422, label: "Donate Rs. 5,555", amount: 5555 },
      { legacySevaId: 3423, label: "Donate Rs. 2,100", amount: 2100 },
      { legacySevaId: 3424, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "alankar",
    title: "Alankar Seva",
    description:
      "Offer divine flower garlands and floral decorations to adorn the Lordships on the festive day.",
    icon: "🌺",
    image: "/assets/janmashtami-sk2.webp",
    options: [
      { legacySevaId: 3430, label: "Donate Rs. 9,999", amount: 9999 },
      { legacySevaId: 3431, label: "Donate Rs. 5,555", amount: 5555 },
      { legacySevaId: 3432, label: "Donate Rs. 3,100", amount: 3100 },
      { legacySevaId: 3433, label: "Donate Rs. 1,100", amount: 1100 },
      { legacySevaId: 3434, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "annakoot",
    title: "Annakoot Seva",
    description:
      "Sponsor the grand Annakoot — a mountain of food offered to the Lord, mirroring the feast that honours Govardhan Hill.",
    icon: "🏔️",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785833232608-1785833231421-chapan-bhog.webp",
    options: [
      { legacySevaId: 3440, label: "Donate Rs. 25,555", amount: 25555 },
      { legacySevaId: 3441, label: "Donate Rs. 15,555", amount: 15555 },
      { legacySevaId: 3442, label: "Donate Rs. 11,111", amount: 11111 },
      { legacySevaId: 3443, label: "Donate Rs. 5,555", amount: 5555 },
      { legacySevaId: 3444, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "vaishnav-bhojan",
    title: "Vaishnav Bhojan",
    description:
      "Feed visiting devotees and guests with sanctified prasadam on this auspicious day of Govardhan Puja.",
    icon: "🍛",
    image: "/assets/janmashtami-sk1.webp",
    options: [
      { legacySevaId: 3450, label: "Donate Rs. 7,777", amount: 7777 },
      { legacySevaId: 3451, label: "Donate Rs. 5,555", amount: 5555 },
      { legacySevaId: 3452, label: "Donate Rs. 3,100", amount: 3100 },
      { legacySevaId: 3453, label: "Donate Rs. 1,500", amount: 1500 },
      { legacySevaId: 3454, label: "Donate Any Other Amount", amount: null },
    ],
  },
];

const TRUST_BADGES = [
  { icon: FileCheck2, label: "80G Tax Exemption" },
  { icon: UtensilsCrossed, label: "Mahaprasadam Sent" },
  { icon: Clock, label: "Instant Confirmation" },
  { icon: ShieldCheck, label: "Secure Razorpay Checkout" },
];

const PRIVILEGES = [
  {
    icon: UtensilsCrossed,
    title: "Sanctified Prasadam",
    text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India).",
  },
  {
    icon: Heart,
    title: "Sankalpa & Aarti",
    text: "Your name is included in the sankalpa and offered during aarti to Their Lordships.",
  },
  {
    icon: FileCheck2,
    title: "Contribution Certificate",
    text: "A digital certificate honouring your valued offering to the temple.",
  },
  {
    icon: ShieldCheck,
    title: "80G Tax Exemption",
    text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act.",
  },
];

const FAQS = [
  {
    q: "What is Govardhan Puja?",
    a: "Govardhan Puja, also known as Annakoot, is the day after Diwali when devotees remember Lord Krishna lifting Govardhan Hill on His little finger for seven days to protect the residents of Vrindavan from torrential rains sent by Indra. A grand mountain of vegetarian delicacies (Annakoot) is offered to the Lord.",
  },
  {
    q: "What sevas can I offer on Govardhan Puja?",
    a: "You can offer Govardhan Seva (worship of the sacred hill), Gau Seva (cow care), Bhog Seva (sacred food offering), Alankar Seva (flower decorations), Annakoot Seva (the grand feast of 56 delicacies) and Vaishnav Bhojan (feeding devotees). You may also donate any custom amount.",
  },
  {
    q: "How will my donation be used?",
    a: "Your donation directly funds the Govardhan Puja celebrations — the worship of Govardhan Hill, the grand Annakoot feast, bhog preparations, flower decorations, cow care and prasadam distribution. We are fully transparent about how every rupee is spent.",
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
];

const initialForm: CheckoutForm = {
  donorName: "",
  donorMobile: "",
  donorEmail: "",
  customAmount: "",
  wantPrasadam: false,
  want80G: false,
  panNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  sevakName: "",
  dob: "",
};

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(
    /\/+$/,
    ""
  );
const formatAmount = (amount: number) => amount.toLocaleString("en-IN");

// ─── Color tokens (Govardhan Puja brand palette: deep blue, gold, saffron) ───
// deepGreen / heading = Deep Blue #0B2D4A · emerald = Secondary Blue #1E4E7A ·
// teal = Sky Blue #5B8FB9 · gold / yellow = Primary Gold #F4C430 ·
// mint / softGold / pink = Light Gold #F9E8A2 · magenta = Saffron Orange #F29F3D ·
// lightMint = page mist #F2F7FC · text = ink #2E4358

const C = {
  deepGreen: "#0B2D4A",
  emerald: "#1E4E7A",
  teal: "#5B8FB9",
  mint: "#F9E8A2",
  lightMint: "#F2F7FC",
  gold: "#F4C430",
  softGold: "#F9E8A2",
  magenta: "#F29F3D",
  pink: "#F9E8A2",
  yellow: "#F4C430",
  heading: "#0B2D4A",
  text: "#2E4358",
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function GovardhanPujaClient() {
  const reduce = useReducedMotion();
  const attribution = useAttribution("govardhan-puja");
  const razorpayReady = useRazorpayPreload();
  const searchParams = useSearchParams();
  const { startPolling, stopPolling } = usePaymentStatusPoller({
    onCompleted: (result) => {
      window.location.assign(
        `/payment/thank-you?type=seva&seva=${encodeURIComponent(result.sevaName || "Govardhan Puja Seva")}&amount=${result.amount}&source=${encodeURIComponent("the Govardhan Puja seva programme")}`
      );
    },
  });
  useScrollToDonate("offer-seva");

  const [selected, setSelected] = useState<SelectedOffering | null>(null);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "idle";
    message: string;
  }>({ type: "idle", message: "" });
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [highlightedSlug, setHighlightedSlug] = useState<string | null>(null);

  const finalAmount = selected?.option.amount ?? Number(form.customAmount || 0);
  const showTaxField = finalAmount >= 500;
  const showPrasadamField = finalAmount >= 1000;
  const needsAddress = form.want80G || form.wantPrasadam;

  useEffect(() => {
    const sevaSlug = searchParams.get("seva");
    if (!sevaSlug) return;
    const matched = sevas.find((s) => s.slug === sevaSlug);
    if (!matched) return;
    setHighlightedSlug(sevaSlug);
    const timer = setTimeout(() => {
      document
        .getElementById(`seva-card-${sevaSlug}`)
        ?.scrollIntoView({
          behavior: reduce ? "auto" : "smooth",
          block: "center",
        });
    }, 500);
    return () => clearTimeout(timer);
  }, [searchParams, reduce]);

  const updateForm = (patch: Partial<CheckoutForm>) => {
    setForm((c) => ({ ...c, ...patch }));
  };

  // Donor pre-fill: logged-in profile auto-fills name/email/mobile; a
  // returning donor's phone lookup fills the same fields after they type
  // their 10-digit number. PAN/address are filled only when 80G/prasadam
  // are selected.
  const { lookupHint, prefill, handle80GToggle, handlePrasadamToggle } = useDonorPrefill({
    form,
    setForm,
    fieldMap: { name: "donorName", email: "donorEmail", mobile: "donorMobile" },
    onMahaPrasadamSelect: (saved) => {
      setForm((c) =>
        !c.address && !c.city && !c.state && !c.pincode
          ? {
              ...c,
              address: (saved.street || "").trim(),
              city: saved.city,
              state: saved.state,
              pincode: saved.pincode,
            }
          : c
      );
    },
  });

  const openCheckout = (seva: Seva, option: SevaOption) => {
    setSelected({ seva, option });
    setForm(
      prefill
        ? {
            ...initialForm,
            donorName: prefill.name,
            donorMobile: prefill.mobile,
            donorEmail: prefill.email,
            panNumber: prefill.panNumber,
          }
        : initialForm
    );
    setStatus({ type: "idle", message: "" });
    trackInitiateCheckout({ content_name: seva.title });
  };

  const closeCheckout = () => {
    if (!submitting) setSelected(null);
  };

  const validate = () => {
    if (!selected) return "Please select a seva.";
    if (!finalAmount || finalAmount < 100) return "Amount must be at least Rs.100.";
    if (!form.donorName.trim()) return "Donor name is required.";
    if (!/^[6-9]\d{9}$/.test(form.donorMobile))
      return "Please enter a valid 10 digit mobile number.";
    if (
      form.donorEmail.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail.trim())
    )
      return "Please enter a valid email address, or leave it blank.";
    if (form.want80G && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber))
      return "Please enter a valid PAN number.";
    if (needsAddress) {
      if (!form.address.trim() || !form.city.trim() || !form.state.trim() || !/^\d{6}$/.test(form.pincode))
        return "Please fill address, city, state and a valid 6-digit pincode.";
    }
    return "";
  };

  const submitDonation = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const error = validate();
    if (error) {
      setStatus({ type: "error", message: error });
      return;
    }
    if (!selected) return;
    setSubmitting(true);
    setStatus({ type: "idle", message: "" });

    try {
      const metaEventId = newEventId();
      const metaBrowser = getMetaBrowserData();
      const orderResponse = await fetch(`${apiBase()}/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePage: "govardhan-puja",
          utm: attribution.payload().utm,
          festivalSlug: "govardhan-puja",
          type: "Sri Govardhan Puja",
          sevaName: selected.seva.title,
          legacySevaId: selected.option.legacySevaId,
          name: form.donorName.trim(),
          email: form.donorEmail.trim().toLowerCase(),
          mobile: form.donorMobile,
          amount: finalAmount,
          sevakName: form.sevakName.trim() || undefined,
          dob: form.dob || undefined,
          certificate: form.want80G,
          panNumber: form.want80G ? form.panNumber : undefined,
          mahaprasadam: form.wantPrasadam,
          prasadamAddress: needsAddress
            ? {
                street: form.address.trim(),
                city: form.city.trim(),
                state: form.state.trim(),
                pincode: form.pincode.trim(),
                country: "India",
              }
            : null,
          metaEventId,
          metaFbp: metaBrowser.fbp,
          metaFbc: metaBrowser.fbc,
        }),
      });

      if (!orderResponse.ok) throw new Error("Unable to create payment order.");
      const order = await orderResponse.json();
      await razorpayReady();

      const win = window as unknown as { Razorpay?: RazorpayConstructor };
      if (!win.Razorpay) throw new Error("Razorpay checkout is unavailable.");

      new win.Razorpay({
        key: order.key,
        amount: Math.round(finalAmount * 100),
        currency: "INR",
        name: "Hare Krishna Movement Kakinada",
        description: `${selected.seva.title} — Govardhan Puja`,
        order_id: order.orderId,
        prefill: {
          name: form.donorName,
          email: form.donorEmail,
          contact: form.donorMobile,
        },
        notes: {
          sourcePage: "govardhan-puja",
          festivalSlug: "govardhan-puja",
          legacySevaId: selected.option.legacySevaId,
          sevaName: selected.seva.title,
          sevaOption: selected.option.label,
        },
        handler: async (response: Record<string, string>) => {
          stopPolling();
          try {
            const verifyResponse = await fetch(`${apiBase()}/payments/verify`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                donationId: order.donationId,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });
            if (!verifyResponse.ok)
              throw new Error("Payment verification failed.");
            trackPurchase({
              value: finalAmount,
              eventId: metaEventId,
              content_name: selected.seva.title,
            });
            window.location.assign(
              `/payment/thank-you?type=seva&seva=${encodeURIComponent(selected.seva.title)}&amount=${finalAmount}&source=${encodeURIComponent("the Govardhan Puja seva programme")}`
            );
            setSelected(null);
          } catch (e) {
            setStatus({
              type: "error",
              message:
                e instanceof Error ? e.message : "Payment verification failed.",
            });
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => {
            setStatus({
              type: "idle",
              message:
                "If you completed the payment, your receipt will arrive shortly.",
            });
          },
        },
        theme: { color: C.deepGreen },
      }).open();

      startPolling(order.orderId);
    } catch (e) {
      setStatus({
        type: "error",
        message:
          e instanceof Error
            ? e.message
            : "Donation could not be completed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageLayout>
      <main className="min-h-screen text-slate-950" style={{ background: C.lightMint }}>
        <WhatsAppFloatButton />

      {/* ═══════════════════════════════════════════════════════════════════
          HERO SECTION
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden pt-[88px] md:pt-[104px]" style={{ background: C.lightMint }}>
        {/* Floating golden particles */}
        {!reduce && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {Array.from({ length: 20 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full"
                style={{
                  background: i % 3 === 0 ? C.gold : i % 3 === 1 ? C.pink : C.yellow,
                  left: `${(i * 7 + 3) % 100}%`,
                  top: `${(i * 11 + 5) % 100}%`,
                }}
                animate={{
                  y: [0, -35, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + (i % 4),
                  repeat: Infinity,
                  delay: i * 0.35,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}

        <div className="relative overflow-hidden rounded-b-[2rem] md:rounded-b-[2.5rem]">
          <a href="#offer-seva" className="block">
            <picture>
              <source media="(max-width: 640px)" srcSet={MOBILE_BANNER} />
              <img
                src={DESKTOP_BANNER}
                alt="Sri Govardhan Puja celebrations at ISKCON Kakinada"
                className="h-auto w-full"
              />
            </picture>
          </a>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          SEVA CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        id="offer-seva"
        className="relative overflow-hidden px-4 py-12 md:py-16"
        style={{ background: `linear-gradient(180deg, ${C.lightMint}, #E4EEF7 50%, ${C.lightMint})` }}
      >
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          <Image
            src={DECOR_GARLAND}
            alt=""
            unoptimized
            width={145}
            height={350}
            draggable={false}
            className="absolute left-0 top-0 h-[140px] w-auto opacity-30 md:h-[220px] md:opacity-40 lg:h-[300px] lg:opacity-50"
          />
          <Image
            src={DECOR_GARLAND}
            alt=""
            unoptimized
            width={145}
            height={350}
            draggable={false}
            className="absolute right-0 top-0 h-[140px] w-auto -scale-x-100 opacity-30 md:h-[220px] md:opacity-40 lg:h-[300px] lg:opacity-50"
          />
          <div
            className="absolute -left-20 top-1/4 h-72 w-72 rounded-full blur-[90px]"
            style={{ background: `${C.teal}10` }}
          />
          <div
            className="absolute -right-16 top-10 h-64 w-64 rounded-full blur-[80px]"
            style={{ background: `${C.gold}10` }}
          />
          <div
            className="absolute bottom-20 left-1/3 h-48 w-48 rounded-full blur-[70px]"
            style={{ background: `${C.magenta}08` }}
          />
        </div>

        <div className="relative mx-auto max-w-6xl">
          {/* Section heading */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-12 text-center"
          >
            <div className="mx-auto mb-5 flex items-center justify-center gap-4">
              <span
                className="h-px w-10 sm:w-16 md:w-24"
                style={{
                  background: `linear-gradient(to right, transparent, ${C.gold}80)`,
                }}
              />
              <svg
                className="h-6 w-6 md:h-8 md:w-8"
                viewBox="0 0 40 40"
                fill={C.gold}
              >
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(72 20 20)" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(144 20 20)" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(216 20 20)" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(288 20 20)" />
                <circle cx="20" cy="20" r="5" />
              </svg>
              <span
                className="h-px w-10 sm:w-16 md:w-24"
                style={{
                  background: `linear-gradient(to left, transparent, ${C.gold}80)`,
                }}
              />
            </div>
            <p
              className="text-xs font-semibold uppercase tracking-[0.28em] md:text-sm"
              style={{ color: C.teal }}
            >
              Choose Your Offering
            </p>
            <h2
              className="mt-2 text-3xl font-bold md:text-4xl lg:text-5xl"
              style={{ color: C.heading }}
            >
              Govardhan Puja Sevas
            </h2>
            <p
              className="mx-auto mt-4 max-w-lg text-sm leading-relaxed md:text-base"
              style={{ color: C.teal }}
            >
              Select a sacred seva and receive the divine blessings of Govardhan
            </p>
          </motion.div>

          {/* Seva cards grid */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            {sevas.map((seva, idx) => (
              <motion.article
                key={seva.slug}
                id={`seva-card-${seva.slug}`}
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: reduce ? 0 : idx * 0.08 }}
                className="group w-full scroll-mt-24 overflow-hidden rounded-2xl border bg-white transition-all duration-500 hover:-translate-y-1 sm:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                style={{
                  borderColor:
                    highlightedSlug === seva.slug ? C.gold : `${C.teal}40`,
                  boxShadow:
                    highlightedSlug === seva.slug
                      ? `0 0 0 4px ${C.gold}50, 0 8px 30px ${C.teal}18`
                      : `0 2px 20px ${C.teal}12`,
                  ...(highlightedSlug === seva.slug && {
                    ringColor: C.gold,
                  }),
                }}
              >
                {/* Card image with gradient overlay + title */}
                <div className="relative h-44 overflow-hidden md:h-48">
                  <Image
                    src={seva.image}
                    alt={seva.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${C.emerald}ee, rgba(30,78,122,0.35) 55%, rgba(30,78,122,0.05))`,
                    }}
                  />
                  <div className="absolute bottom-2.5 left-4 right-4 flex items-center gap-2">
                    <span className="text-2xl drop-shadow">{seva.icon}</span>
                    <h3 className="text-lg font-bold tracking-wide text-white drop-shadow-md md:text-xl">
                      {seva.title}
                    </h3>
                  </div>
                </div>

                {/* Card body */}
                <div className="p-4 pt-3">
                  <div
                    className="mb-3 h-[3px] w-full rounded-full"
                    style={{
                      background: `linear-gradient(to right, transparent, ${C.gold} 20%, ${C.softGold} 60%, transparent)`,
                    }}
                  />
                  <p className="min-h-[40px] text-[13px] leading-relaxed md:text-sm" style={{ color: C.text }}>
                    {seva.description}
                  </p>
                  <div className="mt-4 space-y-2.5">
                    {(() => {
                      const primary = seva.options[0];
                      const tiers = seva.options.slice(1, 4);
                      const custom = seva.options.find((o) => !o.amount) || seva.options[seva.options.length - 1];
                      return (
                        <>
                          <button
                            type="button"
                            onClick={() => openCheckout(seva, primary)}
                            className="flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all duration-300"
                            style={{
                              borderColor: `${C.teal}50`,
                              background: `linear-gradient(135deg, ${C.deepGreen}, ${C.teal})`,
                              color: "white",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = C.gold;
                              e.currentTarget.style.boxShadow = `0 4px 16px ${C.teal}30`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = `${C.teal}50`;
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            <span className="text-[13px] font-semibold leading-tight">
                              Sponsor for{" "}
                              <span className="font-bold">
                                ₹{primary.amount != null ? formatAmount(primary.amount) : "—"}
                              </span>
                            </span>
                            <svg
                              className="h-4 w-4 shrink-0 opacity-70"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M5 12h14M13 6l6 6-6 6" />
                            </svg>
                          </button>

                          <div className="grid grid-cols-3 gap-2">
                            {tiers.map((t) => (
                              <button
                                key={t.legacySevaId}
                                type="button"
                                onClick={() => openCheckout(seva, t)}
                                className="rounded-xl border px-1 py-2.5 text-center transition-all duration-300"
                                style={{
                                  borderColor: `${C.teal}30`,
                                  background: C.lightMint,
                                  color: C.deepGreen,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = C.gold;
                                  e.currentTarget.style.background = `linear-gradient(135deg, ${C.mint}, ${C.softGold}40)`;
                                  e.currentTarget.style.boxShadow = `0 3px 10px ${C.teal}18`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = `${C.teal}30`;
                                  e.currentTarget.style.background = C.lightMint;
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                <span className="text-sm font-bold leading-none">
                                  ₹{t.amount != null ? formatAmount(t.amount) : "—"}
                                </span>
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => openCheckout(seva, custom)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-[13px] font-bold transition-all duration-300"
                            style={{
                              borderColor: `${C.gold}90`,
                              background: `linear-gradient(135deg, ${C.mint}, ${C.softGold}40)`,
                              color: C.deepGreen,
                            }}
                          >
                            <svg
                              className="h-3 w-3"
                              style={{ color: C.teal }}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2.5"
                              strokeLinecap="round"
                            >
                              <line x1="12" y1="5" x2="12" y2="19" />
                              <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            <span>Donate Other Amount</span>
                          </button>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════════════════
          INTRO / ABOUT STRIP
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative px-4 py-12 text-white md:py-16"
        style={{
          background: `linear-gradient(135deg, ${C.emerald}, ${C.deepGreen} 60%, ${C.teal})`,
        }}
      >
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            aria-hidden
            style={{
              background: `linear-gradient(135deg, transparent 30%, ${C.gold} 50%, transparent 70%)`,
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["100% 100%", "0% 0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        )}
        <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.35fr_0.65fr] md:items-center">
          <div>
            <p
              className="mb-3 text-sm font-semibold uppercase tracking-[0.22em]"
              style={{ color: C.softGold }}
            >
              Hare Krishna Movement
            </p>
            <h1
              className="text-3xl font-bold leading-tight md:text-5xl"
              style={{
                color: C.softGold,
                textShadow: `0 0 40px ${C.gold}40, 0 0 80px ${C.gold}20`,
              }}
            >
              Sri Govardhan Puja
            </h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-white/92 md:text-lg">
              Celebrate the divine pastime of Lord Krishna&apos;s lifting of
              Govardhan Hill — the day He taught the world that protecting the
              sacredearth and its creatures pleases the Lord most. Offer sacred
              sevas and receive the unlimited blessings of Govardhan at
              ISKCON Kakinada.
            </p>
            <p
              className="mt-5 max-w-4xl border-l-4 pl-4 text-sm font-medium italic leading-7 text-white/90 md:text-base"
              style={{ borderColor: C.softGold }}
            >
              &ldquo;Just as Govardhan Hill protects all who shelter at its
              base, Lord Krishna protects every soul who takes shelter of Him.
              Worship Govardhan — the very form of the Lord&apos;s protection.&rdquo;
            </p>
          </div>
          <div
            className="rounded-lg border p-5 shadow-2xl backdrop-blur"
            style={{ borderColor: "rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.1)" }}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-1 h-6 w-6 shrink-0"
                style={{ color: C.softGold }}
              />
              <div>
                <h2 className="text-lg font-bold text-white">
                  Offer Seva This Govardhan Puja
                </h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Your offering sustains the sacred worship of Govardhan Hill,
                  the grand Annakoot feast, bhog preparations and every divine
                  ritual performed at ISKCON Kakinada on this auspicious day.
                </p>
              </div>
            </div>
            <motion.a
              href="#offer-seva"
              animate={
                reduce
                  ? undefined
                  : {
                      boxShadow: [
                        `0 0 0 0 ${C.gold}66`,
                        `0 0 0 16px ${C.gold}00`,
                        `0 0 0 0 ${C.gold}66`,
                      ],
                    }
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] shadow-lg transition"
              style={{
                background: C.gold,
                color: C.emerald,
              }}
            >
              Offer Seva
            </motion.a>
          </div>
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          TRUST BADGES
      ═══════════════════════════════════════════════════════════════════ */}
      <motion.section
        initial={reduce ? undefined : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-y-2 py-3.5"
        style={{
          borderColor: `${C.gold}99`,
          background: C.emerald,
        }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4">
          {TRUST_BADGES.map((b) => (
            <span
              key={b.label}
              className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/90 md:text-sm"
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: `${C.gold}22`,
                  boxShadow: `inset 0 0 0 1px ${C.gold}66`,
                }}
              >
                <b.icon className="h-3 w-3" style={{ color: C.gold }} />
              </span>
              {b.label}
            </span>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          BANK TRANSFER + NOTE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-6" style={{ background: C.emerald }}>
        <div className="mx-auto max-w-6xl text-sm leading-7 text-white/90 md:text-base">
          While making UPI/Bank payments, please send a screenshot with your
          name, mobile, address and PAN details to our WhatsApp{" "}
          <a
            className="font-bold"
            href="tel:+918977761187"
            style={{ color: C.softGold }}
          >
            +91 89777 61187
          </a>{" "}
          or email{" "}
          <a
            className="font-bold"
            href="mailto:social@hkmvizag.org"
            style={{ color: C.softGold }}
          >
            social@hkmvizag.org
          </a>
          .
        </div>
      </section>

      <section className="px-4 py-12 md:py-16" style={{ background: C.lightMint }}>
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-white p-6 shadow-lg md:p-8"
          style={{ borderColor: `${C.teal}30` }}
        >
          <h2
            className="text-xl font-bold"
            style={{ color: C.heading }}
          >
            Donation Through Bank (NEFT / RTGS)
          </h2>
          <div className="mt-4 space-y-3" style={{ color: C.text }}>
            {[
              { label: "Beneficiary Name", value: "HARE KRISHNA MOVEMENT INDIA" },
              { label: "Bank Name", value: "IDFC FIRST BANK LTD" },
              { label: "A/c No", value: "10091415313" },
              { label: "IFSC Code", value: "IDFB0080412" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="font-medium">{label}:</span>
                <span className="select-all">{value}</span>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(value);
                    setCopiedField(label);
                    setTimeout(() => setCopiedField(null), 1500);
                  }}
                  className="ml-1 inline-flex items-center rounded p-1 transition-colors hover:bg-slate-100"
                  title={`Copy ${label}`}
                >
                  {copiedField === label ? (
                    <Check className="h-4 w-4 text-sky-600" />
                  ) : (
                    <Copy className="h-4 w-4 text-slate-400" />
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          ABOUT GOVARDHAN PUJA
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-12 md:py-16" style={{ background: C.lightMint }}>
        <div className="mx-auto max-w-4xl text-center">
          <div className="mx-auto mb-5 flex items-center justify-center gap-4">
            <span
              className="h-px w-16 md:w-24"
              style={{
                background: `linear-gradient(to right, transparent, ${C.gold}80)`,
              }}
            />
            <svg
              className="h-6 w-6 md:h-8 md:w-8"
              viewBox="0 0 40 40"
              fill={C.gold}
            >
              <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" />
              <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(72 20 20)" />
              <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(144 20 20)" />
              <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(216 20 20)" />
              <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(288 20 20)" />
              <circle cx="20" cy="20" r="5" />
            </svg>
            <span
              className="h-px w-16 md:w-24"
              style={{
                background: `linear-gradient(to left, transparent, ${C.gold}80)`,
              }}
            />
          </div>
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em] md:text-sm"
            style={{ color: C.teal }}
          >
            The Divine Significance
          </p>
          <h2
            className="mt-2 text-3xl font-bold md:text-4xl"
            style={{ color: C.heading }}
          >
            Why Govardhan Puja Matters
          </h2>
          <div className="mt-8 space-y-5 text-left">
            <p
              className="text-sm leading-relaxed md:text-base"
              style={{ color: C.text }}
            >
              Govardhan Puja commemorates the famous pastime in which Lord
              Krishna lifted Govardhan Hill on His little finger for seven
              days, sheltering the residents of Vrindavan from torrential rains
              sent by an angry Indra. He taught that worship of Govardhan — the
              sustainer of the cows, the forests and the community — and service
              to one&apos;s dependents is dearer to Him than proud sacrifices.
            </p>
            <p
              className="text-sm leading-relaxed md:text-base"
              style={{ color: C.text }}
            >
              On this blessed day, also called Annakoot, the Deities of Sri Sri
              Radha Madan Mohan are adorned in beautiful Alankar, and a grand
              mountain of vegetarian delicacies — a feast of devotion — is
              offered to the Lord and distributed to all as Maha Prasadam. The
              temple reverberates with kirtan and the chanting of the holy
              names.
            </p>
            <p
              className="text-sm leading-relaxed md:text-base"
              style={{ color: C.text }}
            >
              By offering seva on Govardhan Puja, you participate directly in
              these sacred ceremonies. Your Govardhan Seva honours the divine
              hill, your Annakoot Seva provides the mountain of food, your Bhog
              and Vaishnav Bhojan feed the hungry, your Alankar adorns the
              Lordships with beauty, and your Gau Seva pleases the Lord who is
              ever-protective of His cows. Every offering — no matter the
              amount — is received with love.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          DONOR PRIVILEGES
      ═══════════════════════════════════════════════════════════════════ */}
      <section
        className="px-4 py-12 md:py-16"
        style={{ background: `linear-gradient(135deg, ${C.emerald}, ${C.deepGreen})` }}
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 text-center">
            <p
              className="mb-2 text-xs font-semibold uppercase tracking-[0.25em]"
              style={{ color: C.softGold }}
            >
              Our gratitude to every donor
            </p>
            <h2
              className="text-2xl font-bold text-white md:text-3xl"
            >
              Donor Privileges
            </h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PRIVILEGES.map((p, i) => (
              <motion.div
                key={p.title}
                initial={reduce ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border p-6"
                style={{
                  borderColor: "rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.05)",
                }}
              >
                <div
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl"
                  style={{ background: `${C.gold}22` }}
                >
                  <p.icon className="h-6 w-6" style={{ color: C.gold }} />
                </div>
                <h3 className="mb-2 text-base font-bold text-white">
                  {p.title}
                </h3>
                <p className="text-sm leading-relaxed text-white/70">
                  {p.text}
                </p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <a
              href="#offer-seva"
              className="inline-flex items-center rounded-full px-10 py-3.5 text-sm font-bold shadow-lg transition-all hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${C.gold}, ${C.softGold})`,
                color: C.emerald,
                boxShadow: `0 8px 24px ${C.gold}50`,
              }}
            >
              Donate Now
            </a>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FAQS
      ═══════════════════════════════════════════════════════════════════ */}
      <FaqSection faqs={FAQS} tone="blue" />

      {/* ═══════════════════════════════════════════════════════════════════
          STATUS TOAST
      ═══════════════════════════════════════════════════════════════════ */}
      {status.message && !selected && (
        <div
          className={`fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-semibold shadow-lg ${
            status.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"
          }`}
        >
          {status.message}
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          CHECKOUT MODAL
      ═══════════════════════════════════════════════════════════════════ */}
      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div
            className="govardhan-form-scroll relative max-h-[92vh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-2xl border shadow-2xl"
            style={{
              borderColor: `${C.teal}40`,
              background: `linear-gradient(180deg, ${C.lightMint}, white 40%)`,
            }}
          >
            <style>{`
              .govardhan-form-scroll::-webkit-scrollbar { width: 6px; }
              .govardhan-form-scroll::-webkit-scrollbar-track { background: transparent; }
              .govardhan-form-scroll::-webkit-scrollbar-thumb { background: ${C.gold}; border-radius: 9999px; }
              .govardhan-form-scroll::-webkit-scrollbar-thumb:hover { background: ${C.deepGreen}; }
              .govardhan-form-scroll { scrollbar-width: thin; scrollbar-color: ${C.gold} transparent; }
            `}</style>

            {/* Gold accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(to right, ${C.deepGreen}, ${C.teal}, ${C.gold}, ${C.magenta})`,
              }}
            />

            <div className="relative z-10">
              {/* Sticky header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur"
                style={{
                  borderColor: `${C.teal}20`,
                  background: `${C.lightMint}ee`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-2xl shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${C.deepGreen}, ${C.teal})`,
                    }}
                  >
                    <span className="drop-shadow">{selected.seva.icon}</span>
                  </span>
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: `${C.magenta}cc` }}
                    >
                      Govardhan Puja Seva
                    </p>
                    <h2
                      className="text-lg font-bold leading-tight"
                      style={{ color: C.heading }}
                    >
                      {selected.seva.title}
                    </h2>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeCheckout}
                  className="rounded-full border p-2 transition hover:scale-105"
                  style={{
                    borderColor: `${C.teal}30`,
                    background: "white",
                    color: C.teal,
                  }}
                  aria-label="Close checkout"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={submitDonation} className="space-y-5 p-5 md:p-6">
                {/* Summary */}
                <div
                  className="grid gap-4 rounded-lg border p-4 md:grid-cols-2"
                  style={{
                    borderColor: `${C.teal}20`,
                    background: "white",
                  }}
                >
                  <div>
                    <p className="text-xs font-semibold" style={{ color: `${C.teal}aa` }}>
                      Seva Name
                    </p>
                    <p
                      className="mt-1 font-bold"
                      style={{ color: C.heading }}
                    >
                      {selected.seva.title}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: `${C.teal}aa` }}>
                      Seva Amount
                    </p>
                    <p
                      className="mt-1 font-bold"
                      style={{ color: C.heading }}
                    >
                      {selected.option.amount
                        ? `₹${formatAmount(selected.option.amount)}`
                        : "Enter amount below"}
                    </p>
                  </div>
                </div>

                {/* Custom amount */}
                {!selected.option.amount && (
                  <label className="block max-w-sm">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: C.heading }}
                    >
                      Enter Seva Amount *
                    </span>
                    <Input
                      type="number"
                      min={100}
                      value={form.customAmount}
                      onChange={(e) =>
                        updateForm({
                          customAmount: e.target.value,
                          want80G: false,
                          wantPrasadam: false,
                        })
                      }
                      placeholder="Enter amount"
                      className="mt-2"
                      style={{ borderColor: `${C.teal}40` }}
                    />
                    <span
                      className="mt-1 block text-xs"
                      style={{ color: `${C.teal}80` }}
                    >
                      Amount must be at least Rs.100.
                    </span>
                  </label>
                )}

                {/* Donor fields */}
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: C.heading }}
                    >
                      Donor Name *
                    </span>
                    <Input
                      value={form.donorName}
                      maxLength={39}
                      onChange={(e) =>
                        updateForm({
                          donorName: e.target.value.replace(/[^a-zA-Z ]/g, ""),
                        })
                      }
                      placeholder="Your Name"
                      className="mt-2"
                    />
                  </label>
                  <label className="block">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: C.heading }}
                    >
                      Mobile Number *
                    </span>
                    <Input
                      value={form.donorMobile}
                      maxLength={10}
                      onChange={(e) =>
                        updateForm({
                          donorMobile: e.target.value.replace(/\D/g, ""),
                        })
                      }
                      placeholder="Your Mobile Number"
                      className="mt-2"
                    />
                  </label>
                  <label className="block md:col-span-2">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: C.heading }}
                    >
                      E-Mail ID (optional)
                    </span>
                    <Input
                      type="email"
                      value={form.donorEmail}
                      onChange={(e) =>
                        updateForm({ donorEmail: e.target.value.toLowerCase() })
                      }
                      placeholder="Your Email"
                      className="mt-2"
                    />
                  </label>
                </div>

                {lookupHint}

                <DonorExtrasFields
                  sevakName={form.sevakName}
                  dob={form.dob}
                  onSevakNameChange={(v) => updateForm({ sevakName: v })}
                  onDobChange={(v) => updateForm({ dob: v })}
                  variant="amber"
                  collapsible
                />

                {/* Add-ons */}
                <div className="space-y-3">
                  {showPrasadamField && (
                    <label
                      className="flex items-start gap-3 rounded-lg border p-4 text-sm"
                      style={{
                        borderColor: `${C.teal}30`,
                        color: C.heading,
                        background: "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.wantPrasadam}
                        onChange={(e) => {
                          const next = e.target.checked;
                          updateForm({ wantPrasadam: next });
                          handlePrasadamToggle(next);
                        }}
                        className="mt-1 accent-sky-600"
                      />
                      I would like to receive Maha Prasadam (Only within
                      India)
                    </label>
                  )}
                  {showTaxField && (
                    <label
                      className="flex items-start gap-3 rounded-lg border p-4 text-sm"
                      style={{
                        borderColor: `${C.teal}30`,
                        color: C.heading,
                        background: "white",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={form.want80G}
                        onChange={(e) => {
                          const next = e.target.checked;
                          updateForm({ want80G: next });
                          handle80GToggle(next);
                        }}
                        className="mt-1 accent-sky-600"
                      />
                      <span>
                        I wish to receive 80G Tax Exemption
                        <span
                          className="mt-1 block text-xs"
                          style={{ color: `${C.teal}80` }}
                        >
                          PAN and address are mandatory when 80G is selected.
                        </span>
                      </span>
                    </label>
                  )}
                </div>

                {form.want80G && (
                  <label className="block max-w-sm">
                    <span
                      className="text-sm font-semibold"
                      style={{ color: C.heading }}
                    >
                      PAN Number *
                    </span>
                    <Input
                      value={form.panNumber}
                      maxLength={10}
                      onChange={(e) =>
                        updateForm({
                          panNumber: e.target.value
                            .toUpperCase()
                            .replace(/[^A-Z0-9]/g, ""),
                        })
                      }
                      placeholder="Eg: ABCDE1234F"
                      className="mt-2"
                    />
                  </label>
                )}

                {needsAddress && (
                  <div
                    className="grid gap-4 rounded-lg border p-4 md:grid-cols-2"
                    style={{
                      borderColor: `${C.teal}30`,
                      background: "white",
                    }}
                  >
                    <label className="block md:col-span-2">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: C.heading }}
                      >
                        Full Address *
                      </span>
                      <Input
                        value={form.address}
                        maxLength={80}
                        onChange={(e) =>
                          updateForm({ address: e.target.value })
                        }
                        placeholder="Door No, Street, Area"
                        className="mt-2"
                      />
                    </label>
                    <label className="block">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: C.heading }}
                      >
                        City *
                      </span>
                      <Input
                        value={form.city}
                        maxLength={30}
                        onChange={(e) =>
                          updateForm({
                            city: e.target.value.toUpperCase().replace(/[^A-Z ]/g, ""),
                          })
                        }
                        className="mt-2"
                      />
                    </label>
                    <label className="block">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: C.heading }}
                      >
                        State *
                      </span>
                      <Input
                        value={form.state}
                        maxLength={30}
                        onChange={(e) =>
                          updateForm({
                            state: e.target.value.toUpperCase().replace(/[^A-Z ]/g, ""),
                          })
                        }
                        className="mt-2"
                      />
                    </label>
                    <label className="block">
                      <span
                        className="text-sm font-semibold"
                        style={{ color: C.heading }}
                      >
                        PIN Code *
                      </span>
                      <Input
                        value={form.pincode}
                        maxLength={6}
                        onChange={(e) =>
                          updateForm({
                            pincode: e.target.value.replace(/\D/g, ""),
                          })
                        }
                        className="mt-2"
                      />
                    </label>
                  </div>
                )}

                {status.type === "error" && (
                  <p className="rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">
                    {status.message}
                  </p>
                )}

                <motion.div
                  animate={
                    reduce
                      ? undefined
                      : { scale: [1, 1.02, 1] }
                  }
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-6 text-base font-bold"
                    style={{
                      background: `linear-gradient(135deg, ${C.gold}, ${C.softGold})`,
                      color: C.emerald,
                    }}
                  >
                    <Heart className="mr-2 h-5 w-5 fill-current" />
                    {submitting
                      ? "Opening Checkout..."
                      : `Donate Rs. ${formatAmount(finalAmount || 0)}`}
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          STICKY MOBILE DONATE BAR
      ═══════════════════════════════════════════════════════════════════ */}
      {!selected && (
        <div className="fixed inset-x-0 bottom-0 z-40 flex justify-center px-3 pb-3 pt-1 md:hidden">
          <a
            href="#offer-seva"
            className="inline-flex items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-bold shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.softGold})`,
              color: C.emerald,
              boxShadow: `0 8px 24px ${C.gold}50`,
            }}
          >
            🪔 Donate Now
          </a>
        </div>
      )}
    </main>
    </PageLayout>
  );
}
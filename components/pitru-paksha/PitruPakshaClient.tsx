"use client";

import { FormEvent, useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import {
  Check, Copy, ShieldCheck,
  FileCheck2, UtensilsCrossed, Clock, Heart,
  X, Leaf,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DonorExtrasFields from "@/components/DonorExtrasFields";
import { useDonorPrefill } from "@/lib/donorPrefill";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import FaqSection from "@/components/sqft-campaign/FaqSection";
import DonorPrivilegesSection from "@/components/sqft-campaign/DonorPrivilegesSection";
import OtherDonationsCarousel from "@/components/pitru-paksha/OtherDonationsCarousel";
import PitruImportanceSection from "@/components/pitru-paksha/PitruImportanceSection";
import type { CampaignConfig } from "@/lib/campaignConfig";
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
  /** What this amount actually buys, in the seva's own units — "20 meals",
   *  "2 bricks", "8 cows · a day". Shown under the figure so a donor is
   *  choosing an outcome rather than a number. Rates: Annadana ₹25/meal,
   *  Sadhu Bhojan ₹100/plate, Gau Seva ₹150/cow/day, Brick ₹1,500/brick,
   *  Square Foot ₹2,100/sq ft. Omitted on the open-ended "any amount" option,
   *  which has no fixed impact. */
  impact?: string;
};

type Seva = {
  slug: string;
  title: string;
  /** Regular seva `type` code, same as the standalone seva pages — drives the
   *  DCC seva-category mapping (ANNADAAN → ANGE, GO SEVA → GOSE, SQFT →
   *  MNSO-S, BRICK → MNSO-B). */
  type: string;
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
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1790235076658-1790235074922-pitru-paksha-desk.webp";
const MOBILE_BANNER =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1790235075802-1790235074751-pitru-paksha-mob.webp";
const DECOR_GARLAND =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785481873117-1785481872052-garland-removebg-preview.png";

// Imagery for the "Honour Your Ancestors" daan section. The final Annadana /
// Sadhu Bhojan / Gau Seva photos will replace these placeholders — sent by
// the design team (target ~1200x800, 3:2 landscape).
const SECTION_ANNADAN =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786100757954-1786100756855-annadan2.jpg";
const SECTION_GAU_SEVA = "/assets/donations-gau-seva-real.jpeg";
const SECTION_SADHU_BHOJAN =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1790144104776-1790144104666-sadhuBhojan.webp";

const sevas: Seva[] = [
  {
    slug: "annadana",
    title: "Annadana Seva",
    type: "ANNADAAN",
    description:
      "Feed devotees and the needy with sanctified prasadam in honour of your forefathers — the highest form of daan.",
    icon: "🍛",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg",
    options: [
      { legacySevaId: 3500, label: "Donate Rs. 1,100", amount: 1100, impact: "44 meals" },
      { legacySevaId: 3501, label: "Donate Rs. 2,000", amount: 2000, impact: "80 meals" },
      { legacySevaId: 3502, label: "Donate Rs. 2,500", amount: 2500, impact: "100 meals" },
      { legacySevaId: 3503, label: "Donate Rs. 4,000", amount: 4000, impact: "160 meals" },
      { legacySevaId: 3505, label: "Donate Rs. 6,000", amount: 6000, impact: "240 meals" },
      { legacySevaId: 3506, label: "Donate Rs. 10,000", amount: 10000, impact: "400 meals" },
      { legacySevaId: 3504, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "sadhu-bhojan",
    title: "Sadhu Bhojan Seva",
    type: "VAISHNAV BHOJAN",
    description:
      "Serve a sanctified meal to Vaishnavas and saintly persons — dinner blessed by the saints reaches the ancestors.",
    icon: "🍽️",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1790144104776-1790144104666-sadhuBhojan.webp",
    options: [
      { legacySevaId: 3510, label: "Donate Rs. 1,100", amount: 1100, impact: "11 plates" },
      { legacySevaId: 3511, label: "Donate Rs. 1,500", amount: 1500, impact: "15 plates" },
      { legacySevaId: 3512, label: "Donate Rs. 2,500", amount: 2500, impact: "25 plates" },
      { legacySevaId: 3513, label: "Donate Rs. 3,500", amount: 3500, impact: "35 plates" },
      { legacySevaId: 3515, label: "Donate Rs. 5,000", amount: 5000, impact: "50 plates" },
      { legacySevaId: 3516, label: "Donate Rs. 6,000", amount: 6000, impact: "60 plates" },
      { legacySevaId: 3514, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "gau-seva",
    title: "Gau Seva",
    type: "GO SEVA",
    description:
      "Serve the sacred cows at our goshala — a seva that pleases the Lord and sanctifies the memory of the departed.",
    icon: "🐄",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783676646237-1783676645536-ChatGPTImageJul102026031357PM.png",
    options: [
      { legacySevaId: 3520, label: "Donate Rs. 1,100", amount: 1100, impact: "Fodder for a day" },
      { legacySevaId: 3521, label: "Donate Rs. 1,500", amount: 1500, impact: "10 cows · a day" },
      { legacySevaId: 3522, label: "Donate Rs. 2,500", amount: 2500, impact: "Medicines & care" },
      { legacySevaId: 3523, label: "Donate Rs. 3,500", amount: 3500, impact: "1 cow · a month" },
      { legacySevaId: 3525, label: "Donate Rs. 7,000", amount: 7000, impact: "2 cows · a month" },
      { legacySevaId: 3526, label: "Donate Rs. 9,000", amount: 9000, impact: "Green grass, all cows" },
      { legacySevaId: 3524, label: "Donate Any Other Amount", amount: null },
    ],
  },
  // NOTE (ISKCON Kakinada): Vizag's Pitru Paksha page also offers Brick Seva
  // and Square Foot Seva here, tied to the Vaikuntham Temple construction
  // fund in Visakhapatnam. Kakinada has no equivalent construction campaign
  // (no /brick-seva-campaign or /sqft-seva-campaign page), so those two
  // seva cards are intentionally left out rather than linking to a fund
  // that doesn't exist here. Add them back if Kakinada starts one.
];

const TRUST_BADGES = [
  { icon: FileCheck2, label: "80G Tax Exemption" },
  { icon: UtensilsCrossed, label: "Mahaprasadam Sent" },
  { icon: Clock, label: "Instant Confirmation" },
  { icon: ShieldCheck, label: "Secure Razorpay Checkout" },
];

// Config for the shared donor-privileges carousel (the same one used on the
// Square Foot / Brick / Vastra campaigns). Only `type` and `unitName` are
// consumed by the section — a non-"BRICK" type keeps the generic privilege
// carousel instead of the laser-engraving lede.
const PITRU_PRIVILEGE_CONFIG: CampaignConfig = {
  type: "SQFT",
  pageTitle: "Pitru Paksha Daan",
  metaTitle: "Pitru Paksha Daan | ISKCON Kakinada",
  metaDesc:
    "Honour your ancestors this Pitru Paksha — offer Annadana, Sadhu Bhojan, Gau Seva and other sacred sevas online.",
  ogTitle: "Pitru Paksha Daan",
  ogDesc: "Honour your ancestors with sacred seva and receive their blessings.",
  ogImage: DESKTOP_BANNER,
  pricePerUnit: 100,
  unitName: "offering",
  unitNamePlural: "offerings",
  unitShort: "offering",
  minCustomAmount: 100,
  phone: "+91 89777 61187",
  phoneHref: "tel:+918977761187",
  email: "social@hkmvizag.org",
  heroImage: DESKTOP_BANNER,
  aboutImage: SECTION_SADHU_BHOJAN,
  heroTagline: "A seva initiative of ISKCON Kakinada",
  heroHeading1: "Pitru Paksha",
  heroHeading2: "Daan Online",
  heroDesc:
    "Offer Annadana, Sadhu Bhojan, Gau Seva and other sacred sevas in honour of your ancestors.",
  formHeading: "Offer Your Seva",
  formSubheading:
    "Every offering made with love carries your gratitude to the ancestors you remember.",
  privileges: [
    { icon: UtensilsCrossed, title: "Sanctified Prasadam", text: "Receive the Lord's prasadam from the temple as a blessing for your seva (within India)." },
    { icon: Heart, title: "Sankalpa & Aarti", text: "Your family's name is included in the sankalpa and offered during aarti to Their Lordships." },
    { icon: FileCheck2, title: "Contribution Certificate", text: "A digital certificate honouring your valued offering to the temple." },
    { icon: ShieldCheck, title: "80G Tax Exemption", text: "Donations qualify for tax exemption under Section 80G of the Income Tax Act." },
  ],
  higherPrivileges: [],
  statsApiEndpoint: "",
  orderType: "PITRU",
};

const FAQS = [
  {
    q: "What is Pitru Paksha?",
    a: "Pitru Paksha (also called Mahalaya Paksha) is the fortnight of the Hindu calendar dedicated to honouring one's ancestors (pitrs). During this period, families perform shraddha, tarpan and pinda daan, and offer charity such as Annadana and Gau Seva so that the departed souls attain peace and the family receives their blessings.",
  },
  {
    q: "What sevas can I offer in Pitru Paksha?",
    a: "You can offer Annadana Seva (feeding the hungry), Sadhu Bhojan Seva (feeding Vaishnavas and saintly persons) and Gau Seva (serving the sacred cows). You may also donate any custom amount.",
  },
  {
    q: "Why is Annadana considered the highest daan for ancestors?",
    a: "Feeding others is glorified as the greatest of all charities. When food is first offered to the Lord and then distributed to devotees and the needy, the offering is purified and sanctified. It is believed that such an offering, made with love and remembrance of one's ancestors, reaches them directly and brings lasting peace to their souls.",
  },
  {
    q: "Why serve cows and sadhus during Pitru Paksha?",
    a: "Gau Seva and Sadhu Bhojan are held to be exceptionally meritorious. Serving Gau Mata pleases Lord Krishna, who is ever-protective of cows, and serving saintly Vaishnavas brings their blessings. The scriptures declare that charity given in this sacred fortnight, especially to cows and devotees of the Lord, deeply gratifies the departed souls.",
  },
  {
    q: "How will my donation be used?",
    a: "Your donation directly funds the Pitru Paksha celebrations — prasadam preparation and distribution, meals for sadhus and Vaishnavas, and loving care for the sacred cows of our goshala. We are fully transparent about how every rupee is spent.",
  },
  {
    q: "Is my donation eligible for 80G tax exemption?",
    a: "Yes. Donations to Hare Krishna Movement qualify for tax exemption under Section 80G of the Income Tax Act. Select the '80G receipt' option during checkout and provide your PAN.",
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

// ─── Color tokens (Pitru Paksha banner palette: warm ivory · burnt saffron · golden amber) ─
// Matches the campaign banner art exactly — same HEX values, same roles.
// Distinct from Radhashtami (green), Govardhan (blue) and Janmashtami (purple).
// Main title / headings = Burnt Orange #D24A0A · body text = Warm Terracotta #C95718 ·
// primary CTA = Deep Saffron Orange #D83B05 (hover #B92F03) with white labels ·
// page bg = Warm Ivory #FFF5D9 · section bg = Pale Golden Cream #FCE8B5 ·
// alt section = Soft Peach Cream #F7D9A3 · decor = Golden Amber #E9A62A ·
// dark body text = Warm Brown #59321F · white button text = #FFFFFF

const C = {
  // Banner palette — canonical values from the campaign design.
  ivory: "#FFF5D9", // page background
  cream: "#FCE8B5", // section background
  peach: "#F7D9A3", // alternate section background
  amber: "#E9A62A", // decorative gold
  saffron: "#D83B05", // primary CTA
  saffronDark: "#B92F03", // CTA hover
  heading: "#D24A0A", // headings / main title
  accent: "#C95718", // body / highlighted text
  text: "#59321F", // dark body text
  white: "#FFFFFF", // white text on buttons

  // Muted inks for secondary prose — #C95718 (#C95718 ≈ 4.0:1 on ivory) sits
  // just under the 4.5:1 minimum for long paragraphs, so large bodies use
  // this warmer brown (~7.5:1) instead.
  muted: "#7A4A26",

  // Legacy alias names (deepGreen/emerald/teal/mint/gold/softGold/magenta/pink/
  // yellow) were repurposed from the Radhashtami template and are kept so the
  // existing style declarations keep compiling. Each maps to the closest
  // banner colour; NEW code should use the canonical banner names above.
  deepGreen: "#59321F", // darkest ink (was deep espresso)
  emerald: "#C93F05", // deep burnt saffron (main title colour)
  teal: "#C95718", // warm terracotta (was sandalwood)
  mint: "#F7D9A3", // soft peach cream (was warm sand)
  lightMint: "#FFF5D9", // warm ivory page bg (was page cream)
  gold: "#E9A62A", // golden amber (was marigold)
  softGold: "#F2C15E", // light amber tint for gradients
  magenta: "#D24A0A", // burnt orange (was ember terracotta)
  pink: "#F2C15E",
  yellow: "#E9A62A",
} as const;

// ─── Component ───────────────────────────────────────────────────────────────

export default function PitruPakshaClient() {
  const reduce = useReducedMotion();
  const attribution = useAttribution("pitru-paksha");
  const razorpayReady = useRazorpayPreload();
  const searchParams = useSearchParams();
  const { startPolling, stopPolling } = usePaymentStatusPoller({
    onCompleted: (result) => {
      window.location.assign(
        `/payment/thank-you?type=seva&seva=${encodeURIComponent(result.sevaName || "Pitru Paksha Seva")}&amount=${result.amount}&source=${encodeURIComponent("the Pitru Paksha seva programme")}`
      );
    },
  });
  useScrollToDonate("offer-seva");

  const scrollToDonate = () =>
    document.getElementById("offer-seva")?.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });

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
          sourcePage: "pitru-paksha",
          utm: attribution.payload().utm,
          festivalSlug: "pitru-paksha",
          type: selected.seva.type,
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
        description: `${selected.seva.title} — Pitru Paksha`,
        order_id: order.orderId,
        prefill: {
          name: form.donorName,
          email: form.donorEmail,
          contact: form.donorMobile,
        },
        notes: {
          sourcePage: "pitru-paksha",
          festivalSlug: "pitru-paksha",
          sevaType: selected.seva.type,
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
              `/payment/thank-you?type=seva&seva=${encodeURIComponent(selected.seva.title)}&amount=${finalAmount}&source=${encodeURIComponent("the Pitru Paksha seva programme")}`
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
        theme: { color: C.saffron },
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
        {/* Floating ember particles */}
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
                alt="Pitru Paksha seva at ISKCON Kakinada"
                className="h-auto w-full"
              />
            </picture>
          </a>
        </div>
      </section>
      {/* ═══════════════════════════════════════════════════════════════════
          SEVA CARDS
      ═══════════════════════════════════════════════════════════════════ */}
      <section id="offer-seva" className="relative overflow-hidden px-4 py-12 md:py-16"
        style={{ background: `linear-gradient(180deg, ${C.ivory}, ${C.cream} 50%, ${C.ivory})` }}
      >
        {/* Decorative background elements */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Toran garlands hanging from the top corners */}
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
              <Leaf className="h-6 w-6 md:h-8 md:w-8" style={{ color: C.gold }} strokeWidth={1.5} />
              <span
                className="h-px w-10 sm:w-16 md:w-24"
                style={{
                  background: `linear-gradient(to left, transparent, ${C.gold}80)`,
                }}
              />
            </div>
            <p
              className="text-xs font-bold uppercase tracking-[0.28em] md:text-sm"
              style={{ color: C.accent }}
            >
              Choose Your Offering
            </p>
            <h2
              className="mt-2 text-3xl font-bold md:text-4xl lg:text-5xl"
              style={{ color: C.heading }}
            >
              Pitru Paksha Sevas
            </h2>
            <p
              className="mx-auto mt-4 max-w-xl text-[15px] leading-8 md:text-lg"
              style={{ color: C.muted }}
            >
              Honour your ancestors with sacred seva and receive their blessings
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
                      background: `linear-gradient(to top, ${C.deepGreen}ee, rgba(89,50,31,0.35) 55%, rgba(89,50,31,0.05))`,
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
                      // Six amount cards, no featured tier. Every seva now
                      // opens at ₹1,100, so the first card is the entry point
                      // rather than a headline figure — nothing is visually
                      // promoted over anything else, and the donor picks by
                      // what the offering buys.
                      const amountCards = seva.options.filter((o) => o.amount != null);
                      const custom = seva.options.find((o) => !o.amount) || seva.options[seva.options.length - 1];
                      return (
                        <>
                          <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                            {amountCards.map((t) => (
                              <button
                                key={t.legacySevaId}
                                type="button"
                                onClick={() => openCheckout(seva, t)}
                                className="flex min-h-[52px] flex-col items-center justify-center rounded-lg border px-1 py-1.5 text-center transition-all duration-300 sm:min-h-[56px] sm:px-1.5 sm:py-2"
                                style={{
                                  borderColor: `${C.amber}45`,
                                  background: C.ivory,
                                  color: C.text,
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.borderColor = C.saffron;
                                  e.currentTarget.style.background = C.peach;
                                  e.currentTarget.style.boxShadow = `0 3px 10px ${C.amber}30`;
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.borderColor = `${C.amber}45`;
                                  e.currentTarget.style.background = C.ivory;
                                  e.currentTarget.style.boxShadow = "none";
                                }}
                              >
                                <span className="block text-[13px] font-bold leading-none sm:text-sm">
                                  ₹{t.amount != null ? formatAmount(t.amount) : "—"}
                                </span>
                                {t.impact && (
                                  <span
                                    className="mt-0.5 block text-[9px] font-medium leading-[1.2] sm:text-[10px]"
                                    style={{ color: C.muted }}
                                  >
                                    {t.impact}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => openCheckout(seva, custom)}
                            className="flex w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-3 text-[13px] font-bold transition-all duration-300"
                            style={{
                              borderColor: `${C.amber}90`,
                              background: C.peach,
                              color: C.text,
                            }}
                          >
                            <svg
                              className="h-3 w-3"
                              style={{ color: C.accent }}
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
        className="relative px-4 py-12 md:py-16"
        style={{
          background: `linear-gradient(135deg, ${C.peach}, ${C.cream} 60%, ${C.ivory})`,
        }}
      >
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.09]"
            aria-hidden
            style={{
              background: `linear-gradient(135deg, transparent 30%, ${C.saffron} 50%, transparent 70%)`,
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
              style={{ color: C.accent }}
            >
              Hare Krishna Movement
            </p>
            <h1
              className="text-3xl font-bold leading-tight md:text-5xl"
              style={{
                color: C.emerald,
                textShadow: `0 0 40px ${C.amber}30, 0 0 80px ${C.amber}18`,
              }}
            >
              Pitru Paksha
            </h1>
            {/* Opacity modifiers only exist in steps of 5 — text-white/92 was
                generating no CSS at all, so this paragraph fell back to the
                page's default foreground (dark navy) on top of the banner. */}
            <p className="mt-5 max-w-4xl text-base leading-8 md:text-lg" style={{ color: C.text }}>
              The sacred fortnight to honour our ancestors. During Pitru Paksha,
              we offer shraddha, tarpan and charity — feeding devotees, serving
              sacred cows and glorifying the Lord — so the departed souls may
              attain peace and our families may receive their blessings.
            </p>
            <p
              className="mt-5 max-w-4xl border-l-4 pl-4 text-sm font-medium italic leading-7 md:text-base"
              style={{ borderColor: C.saffron, color: C.text }}
            >
              &ldquo;The scriptures declare that whatever is offered with devotion
              during this fortnight — food, water or charity — reaches the
              ancestors directly. Gratitude, given in the form of seva, is the
              greatest homage we can offer.&rdquo;
            </p>
          </div>
          <div
            className="rounded-lg border p-5 shadow-2xl"
            style={{ borderColor: `${C.amber}55`, background: "rgba(255,255,255,0.55)" }}
          >
            <div className="flex items-start gap-3">
              <ShieldCheck
                className="mt-1 h-6 w-6 shrink-0"
                style={{ color: C.saffron }}
              />
              <div>
                <h2 className="text-lg font-bold" style={{ color: C.heading }}>
                  Offer Seva This Pitru Paksha
                </h2>
                <p className="mt-2 text-sm leading-6" style={{ color: C.text }}>
                  Your offering sustains Annadana, Sadhu Bhojan, sacred cow care
                  and every divine ritual performed at ISKCON Kakinada — carrying
                  your gratitude to the ancestors you remember.
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
                        `0 0 0 0 ${C.saffron}66`,
                        `0 0 0 16px ${C.saffron}00`,
                        `0 0 0 0 ${C.saffron}66`,
                      ],
                    }
              }
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 inline-flex w-full items-center justify-center rounded-md px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] shadow-lg transition"
              style={{
                background: C.saffron,
                color: C.white,
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
          borderColor: `${C.amber}99`,
          background: C.peach,
        }}
      >
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4">
          {TRUST_BADGES.map((b) => (
            <span
              key={b.label}
              className="flex items-center gap-2 text-xs font-semibold tracking-wide md:text-sm"
              style={{ color: C.text }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{
                  background: `${C.amber}22`,
                  boxShadow: `inset 0 0 0 1px ${C.amber}66`,
                }}
              >
                <b.icon className="h-3 w-3" style={{ color: C.saffron }} />
              </span>
              {b.label}
            </span>
          ))}
        </div>
      </motion.section>

      {/* ═══════════════════════════════════════════════════════════════════
          BANK TRANSFER + NOTE
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="px-4 py-6" style={{ background: `linear-gradient(180deg, ${C.gold} 0%, ${C.softGold} 100%)` }}>
        <div className="mx-auto max-w-6xl text-sm leading-7 md:text-base" style={{ color: C.text }}>
          While making UPI/Bank payments, please send a screenshot with your
          name, mobile, address and PAN details to our WhatsApp{" "}
          <a
            className="font-bold"
            href="tel:+918977761187"
            style={{ color: C.saffron }}
          >
            +91 89777 61187
          </a>{" "}
          or email{" "}
          <a
            className="font-bold"
            href="mailto:social@hkmvizag.org"
            style={{ color: C.saffron }}
          >
            social@hkmvizag.org
          </a>
          .
        </div>
      </section>

      <section className="px-4 py-12 md:py-16" style={{ background: C.peach }}>
        <div
          className="mx-auto max-w-6xl overflow-hidden rounded-2xl border bg-white p-6 shadow-lg md:p-8"
          style={{ borderColor: `${C.amber}45` }}
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
                    <Check className="h-4 w-4 text-green-600" />
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
          ABOUT PITRU PAKSHA — HONOUR YOUR ANCESTORS
      ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative overflow-hidden px-4 py-16 md:py-24" style={{ background: C.ivory }}>
        {/* The cream background was a flat slab edge to edge. These give it
            depth without competing with the photography below: warmth pooling
            behind the heading, and a faint dotted weave for texture. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{
            background: `radial-gradient(ellipse 70% 100% at 50% 0%, ${C.amber}1f, transparent 70%)`,
          }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: `radial-gradient(${C.saffron} 1px, transparent 1px)`,
            backgroundSize: "22px 22px",
          }}
        />

        <div className="relative mx-auto max-w-6xl">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mx-auto mb-5 flex items-center justify-center gap-4">
              <span
                className="h-px w-16 md:w-24"
                style={{
                  background: `linear-gradient(to right, transparent, ${C.gold}80)`,
                }}
              />
              <Leaf className="h-6 w-6 md:h-8 md:w-8" style={{ color: C.gold }} strokeWidth={1.5} />
              <span
                className="h-px w-16 md:w-24"
                style={{
                  background: `linear-gradient(to left, transparent, ${C.gold}80)`,
                }}
              />
            </div>
            <p
              className="text-xs font-bold uppercase tracking-[0.28em] md:text-sm"
              style={{ color: C.accent }}
            >
              Pitru Paksha Daan
            </p>
            <h2
              className="mt-3 text-3xl font-bold md:text-4xl lg:text-[2.75rem] lg:leading-[1.15]"
              style={{ color: C.heading }}
            >
              Honour Your Ancestors Through Pitru Paksha Daan Online
            </h2>
            <p
              className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 md:text-lg"
              style={{ color: C.muted }}
            >
              The daans that most deeply satisfy the departed souls — offered
              with devotion at the temple, they carry your gratitude directly
              to the ancestors you remember.
            </p>
          </div>

          {/* The three supreme daans */}
          <div className="mt-14 grid gap-7 md:grid-cols-3 md:gap-6 lg:gap-7">
            {[
              {
                slug: "annadana",
                title: "Annadana Seva",
                image: SECTION_ANNADAN,
                icon: UtensilsCrossed,
                kicker: "The highest daan",
                text:
                  "Feeding devotees and the needy with sanctified prasadam is glorified as the highest form of daan — it is said to reach the ancestors directly.",
              },
              {
                slug: "gau-seva",
                title: "Gau Seva",
                image: SECTION_GAU_SEVA,
                icon: Heart,
                kicker: "Dear to Krishna",
                text:
                  "Serving the sacred cows with fodder and loving care is supremely dear to Lord Krishna — and utterly satisfying to the departed.",
              },
              {
                slug: "sadhu-bhojan",
                title: "Sadhu Bhojan Seva",
                image: SECTION_SADHU_BHOJAN,
                icon: Leaf,
                kicker: "Blessings of saints",
                text:
                  "Serving a sanctified meal to sadhus and Vaishnavas draws their blessings — carrying the offering to the pitrs.",
              },
            ].map((c, i) => (
              <motion.a
                key={c.slug}
                href={`#seva-card-${c.slug}`}
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: reduce ? 0 : i * 0.1 }}
                className="group flex flex-col overflow-hidden rounded-3xl border bg-white transition-all duration-500 hover:-translate-y-1.5"
                style={{
                  borderColor: `${C.amber}33`,
                  boxShadow: `0 4px 24px ${C.amber}20`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 26px 60px -28px ${C.saffron}70`;
                  e.currentTarget.style.borderColor = `${C.saffron}80`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = `0 4px 24px ${C.amber}20`;
                  e.currentTarget.style.borderColor = `${C.amber}33`;
                }}
              >
                <div className="relative h-60 overflow-hidden md:h-64">
                  <Image
                    src={c.image}
                    alt={c.title}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: `linear-gradient(to top, ${C.deepGreen}F0 0%, rgba(89,50,31,0.62) 38%, rgba(89,50,31,0.2) 70%, transparent 100%)`,
                    }}
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px] origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100"
                    style={{ background: `linear-gradient(to right, ${C.gold}, ${C.softGold})` }}
                  />

                  {/* Numeral in the corner, so the three read as an ordered set
                      of the supreme daans rather than three loose cards. */}
                  <span
                    aria-hidden
                    className="absolute right-5 top-4 font-serif text-4xl font-bold leading-none text-white/25 transition-colors duration-500 group-hover:text-white/40"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="absolute inset-x-5 bottom-4">
                    <p
                      className="text-[10px] font-bold uppercase tracking-[0.2em]"
                      style={{ color: C.softGold, textShadow: "0 2px 8px rgba(0,0,0,0.6)" }}
                    >
                      {c.kicker}
                    </p>
                    <h3 className="mt-1 text-xl font-bold leading-snug tracking-wide text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.6)] md:text-2xl">
                      {c.title}
                    </h3>
                  </div>
                </div>

                <div className="relative flex flex-1 flex-col p-6 pt-8">
                  {/* Icon medallion straddling the image edge — the detail that
                      separates a considered card from a photo with a caption. */}
                  <span
                    className="absolute -top-6 left-6 flex h-12 w-12 items-center justify-center rounded-full border-4 border-white transition-transform duration-500 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${C.saffron}, ${C.amber})`,
                      boxShadow: `0 10px 24px -10px ${C.saffron}80`,
                    }}
                  >
                    <c.icon className="h-5 w-5" style={{ color: C.white }} strokeWidth={2} />
                  </span>

                  <p className="text-sm leading-7" style={{ color: C.text }}>
                    {c.text}
                  </p>

                  <span
                    className="mt-5 inline-flex w-fit items-center gap-1.5 border-b-2 border-transparent pb-0.5 text-xs font-bold uppercase tracking-[0.14em] transition-all duration-300 group-hover:gap-2.5"
                    style={{ color: C.accent, borderBottomColor: `${C.gold}00` }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderBottomColor = C.gold; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderBottomColor = `${C.gold}00`; }}
                  >
                    Offer this seva
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Three equal paragraphs stacked full-width read as a wall of text
              and were the last thing on the page anyone finished. Same words,
              given an editorial shape: a lead paragraph that carries the
              section, then the detail in two columns that the eye can graze. */}
          <div
            className="relative mx-auto mt-14 max-w-4xl overflow-hidden rounded-3xl border px-6 py-9 md:px-10 md:py-11"
            style={{
              borderColor: `${C.amber}40`,
              background: `linear-gradient(135deg, #FFFFFF 0%, ${C.peach}55 100%)`,
              boxShadow: `0 20px 50px -34px ${C.saffron}70`,
            }}
          >
            <span
              aria-hidden
              className="pointer-events-none absolute -right-6 -top-10 select-none font-serif text-[8rem] leading-none opacity-[0.07]"
              style={{ color: C.saffron }}
            >
              ॐ
            </span>

            <p
              className="relative text-base leading-8 md:text-lg md:leading-9"
              style={{ color: C.heading }}
            >
              <span
                className="float-left mr-3 mt-1 font-serif text-5xl font-bold leading-[0.85] md:text-6xl"
                style={{ color: C.saffron }}
              >
                P
              </span>
              itru Paksha is the fortnight of the Vedic calendar set aside for
              remembering and honouring our ancestors — the pitrs. Falling each
              year in the dark fortnight of Ashwin (September–October), it is a
              season of profound gratitude, when families across India offer
              shraddha, tarpan and charity on the tithi (date) of their departed
              elders.
            </p>

            <div
              className="my-7 h-px w-full"
              style={{ background: `linear-gradient(to right, transparent, ${C.amber}66, transparent)` }}
              aria-hidden
            />

            <div className="grid gap-6 md:grid-cols-2 md:gap-8">
              <p className="text-sm leading-7 md:text-[15px]" style={{ color: C.text }}>
                The scriptures tell us that whatever is given with love during
                this period — food, water, clothing or service — reaches the
                ancestors directly and brings them peace. Among all offerings,
                Annadana (feeding the hungry), Sadhu Bhojan (feeding saintly
                Vaishnavas) and Gau Seva (serving the sacred cows) are glorified
                as supremely pleasing, for they serve the Lord&apos;s own
                dependents.
              </p>
              <p className="text-sm leading-7 md:text-[15px]" style={{ color: C.text }}>
                By offering seva this Pitru Paksha, you transform grief into
                grace. Every offering — no matter the amount — carries your love
                for those who came before you and returns as blessings upon your
                family.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          IMPORTANCE + WHY DONATE — one combined elegant section
      ═══════════════════════════════════════════════════════════════════ */}
      <PitruImportanceSection />

      {/* ═══════════════════════════════════════════════════════════════════
          DONOR PRIVILEGES — shared carousel
      ═══════════════════════════════════════════════════════════════════ */}
      <DonorPrivilegesSection
        scrollToDonate={scrollToDonate}
        config={PITRU_PRIVILEGE_CONFIG}
      />

      {/* ═══════════════════════════════════════════════════════════════════
          FAQS
      ═══════════════════════════════════════════════════════════════════ */}
      <FaqSection faqs={FAQS} tone="sand" />

      {/* ═══════════════════════════════════════════════════════════════════
          OTHER DONATIONS — carousel of the temple's other seva pages
      ═══════════════════════════════════════════════════════════════════ */}
      <OtherDonationsCarousel />

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
        <div            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#2A1608]/80 p-4">
          <div
            className="pitru-form-scroll relative max-h-[92vh] w-full max-w-2xl overflow-x-hidden overflow-y-auto rounded-2xl border shadow-2xl"
            style={{
              borderColor: `${C.amber}50`,
              background: `linear-gradient(180deg, ${C.ivory}, white 40%)`,
            }}
          >
            <style>{`
              .pitru-form-scroll::-webkit-scrollbar { width: 6px; }
              .pitru-form-scroll::-webkit-scrollbar-track { background: transparent; }
              .pitru-form-scroll::-webkit-scrollbar-thumb { background: ${C.saffron}; border-radius: 9999px; }
              .pitru-form-scroll::-webkit-scrollbar-thumb:hover { background: ${C.saffronDark}; }
              .pitru-form-scroll { scrollbar-width: thin; scrollbar-color: ${C.saffron} transparent; }
            `}</style>

            {/* Saffron accent bar */}
            <div
              className="h-1.5 w-full"
              style={{
                background: `linear-gradient(to right, ${C.emerald}, ${C.saffron}, ${C.amber}, ${C.accent})`,
              }}
            />

            <div className="relative z-10">
              {/* Sticky header */}
              <div
                className="sticky top-0 z-10 flex items-center justify-between border-b px-6 py-4 backdrop-blur"
                style={{
                  borderColor: `${C.amber}25`,
                  background: `${C.ivory}ee`,
                }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-11 w-11 items-center justify-center rounded-full text-2xl shadow-sm"
                    style={{
                      background: `linear-gradient(135deg, ${C.saffron}, ${C.amber})`,
                    }}
                  >
                    <span className="drop-shadow">{selected.seva.icon}</span>
                  </span>
                  <div>
                    <p
                      className="text-[10px] font-semibold uppercase tracking-[0.18em]"
                      style={{ color: C.accent }}
                    >
                      Pitru Paksha Seva
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
                    borderColor: `${C.amber}40`,
                    background: "white",
                    color: C.text,
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
                        className="mt-1 accent-amber-600"
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
                        className="mt-1 accent-amber-600"
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
                      background: C.saffron,
                      color: C.white,
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
              background: C.saffron,
              color: C.white,
              boxShadow: `0 8px 24px ${C.saffron}55`,
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
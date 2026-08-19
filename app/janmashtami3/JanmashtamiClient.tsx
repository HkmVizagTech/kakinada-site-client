"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Clock, Facebook, FileCheck2, Heart, Instagram, Mail, MapPin, MessageCircle, Phone, ShieldCheck, Youtube, UtensilsCrossed, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DonorExtrasFields from "@/components/DonorExtrasFields";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import JanmashtamiGallery from "@/components/JanmashtamiGallery";
import { useRazorpayPreload } from "@/lib/useRazorpayPreload";
import { useAttribution } from "@/lib/useAttribution";

type SevaOption = {
  legacySevaId: number;
  label: string;
  amount: number | null;
  subtitle?: string;
};

type Seva = {
  slug: string;
  title: string;
  description: string;
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
  doorNo: string;
  building: string;
  street: string;
  area: string;
  pincode: string;
  city: string;
  state: string;
  sevakName: string;
  dob: string;
};

type SelectedOffering = {
  seva: Seva;
  option: SevaOption;
};

type RazorpayConstructor = new (options: Record<string, unknown>) => { open: () => void };

const banners = [
  {
    desktop: "/assets/janmashtami-skj26_1.webp",
    mobile: "/assets/janmashtami-skj26_m1.webp",
    alt: "Sri Krishna Janmashtami celebrations at Hare Krishna Movement Vizag",
  },
  {
    desktop: "/assets/janmashtami-skj26_2.webp",
    mobile: "/assets/janmashtami-skj26_m2.webp",
    alt: "Offer sevas for Sri Krishna Janmashtami at HKM Vizag",
  },
];

const DECOR_GARLAND =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785481873117-1785481872052-garland-removebg-preview.png";
const DECOR_MATKA =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785481873515-1785481872176-matka-removebg-preview.png";

const sevas: Seva[] = [
  // ── Row 1 ──
  {
    slug: "annadana",
    title: "Annadana Seva",
    description: "Sponsor Anna-Daan to all the temple visitors in the name of your family or loved ones.",
    image: "/assets/janmashtami-sk1.webp",
    options: [
      { legacySevaId: 186, label: "Donate Rs. 15,001", amount: 15001 },
      { legacySevaId: 187, label: "Donate Rs. 9,001", amount: 9001 },
      { legacySevaId: 188, label: "Donate Rs. 6,001", amount: 6001 },
      { legacySevaId: 300, label: "Donate Rs. 4,501", amount: 4501 },
      { legacySevaId: 189, label: "Donate Rs. 3,001", amount: 3001 },
      { legacySevaId: 190, label: "Donate Rs. 1,501", amount: 1501 },
      { legacySevaId: 191, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "gau-seva",
    title: "Gau Seva",
    description: "Offer Gau Poshana Seva to protect and nourish the cows residing at our goshala.",
    image: "/assets/janmashtami-sk4.webp",
    options: [
      { legacySevaId: 198, label: "Donate Rs. 9,001", amount: 9001 },
      { legacySevaId: 199, label: "Donate Rs. 5,001", amount: 5001 },
      { legacySevaId: 200, label: "Donate Rs. 3,501", amount: 3501 },
      { legacySevaId: 301, label: "Donate Rs. 3,001", amount: 3001 },
      { legacySevaId: 201, label: "Donate Rs. 2,501", amount: 2501 },
      { legacySevaId: 202, label: "Donate Rs. 1,501", amount: 1501 },
      { legacySevaId: 203, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "pushpalankara",
    title: "Pushpalankara Seva",
    description: "Sponsor a grand Garland for Radha Krishna on this auspicious day to welcome the Supreme Lord.",
    image: "/assets/janmashtami-sk2.webp",
    options: [
      { legacySevaId: 216, label: "Donate Rs. 10,008", amount: 10008 },
      { legacySevaId: 217, label: "Donate Rs. 7,501", amount: 7501 },
      { legacySevaId: 218, label: "Donate Rs. 5,001", amount: 5001 },
      { legacySevaId: 302, label: "Donate Rs. 3,501", amount: 3501 },
      { legacySevaId: 219, label: "Donate Rs. 2,501", amount: 2501 },
      { legacySevaId: 220, label: "Donate Rs. 1,008", amount: 1008 },
      { legacySevaId: 221, label: "Donate Any Other Amount", amount: null },
    ],
  },
  // ── Row 2 — Abhisheka & Naivedhya moved up ──
  {
    slug: "abhisheka",
    title: "Abhisheka Seva",
    description: "Sponsor the sacred Abhishekam of Sri Sri Radha Madan Mohan — morning and Kalash bathing ceremonies on Janmashtami.",
    image: "/assets/janmashtami-sk3.webp",
    options: [
      { legacySevaId: 234, label: "Donate Rs. 25,555", amount: 25555, subtitle: "Pratah Abhishekam" },
      { legacySevaId: 240, label: "Donate Rs. 15,555", amount: 15555, subtitle: "Kalash Abhishekam" },
      { legacySevaId: 236, label: "Donate Rs. 10,008", amount: 10008 },
      { legacySevaId: 303, label: "Donate Rs. 7,501", amount: 7501 },
      { legacySevaId: 237, label: "Donate Rs. 5,001", amount: 5001 },
      { legacySevaId: 238, label: "Donate Rs. 2,501", amount: 2501 },
      { legacySevaId: 239, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "naivedhya",
    title: "Naivedhya Seva",
    description: "Sponsor the sacred food offering to Lord Krishna — Naivedhya is the devotional offering of prepared dishes to the Lord.",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785833545819-1785833545717-naivedya.jpeg",
    options: [
      { legacySevaId: 246, label: "Donate Rs. 11,111", amount: 11111 },
      { legacySevaId: 247, label: "Donate Rs. 7,501", amount: 7501 },
      { legacySevaId: 248, label: "Donate Rs. 5,001", amount: 5001 },
      { legacySevaId: 304, label: "Donate Rs. 4,001", amount: 4001 },
      { legacySevaId: 249, label: "Donate Rs. 3,001", amount: 3001 },
      { legacySevaId: 250, label: "Donate Rs. 1,501", amount: 1501 },
      { legacySevaId: 251, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "tulasi-archana",
    title: "Tulasi Archana Seva",
    description: "Sponsor a grand Archana for Radha Krishna on this auspicious day to welcome the Supreme Lord.",
    image: "/assets/janmashtami-sk6.webp",
    options: [
      { legacySevaId: 210, label: "Donate Rs. 10,008", amount: 10008 },
      { legacySevaId: 211, label: "Donate Rs. 7,501", amount: 7501 },
      { legacySevaId: 212, label: "Donate Rs. 5,001", amount: 5001 },
      { legacySevaId: 305, label: "Donate Rs. 3,501", amount: 3501 },
      { legacySevaId: 213, label: "Donate Rs. 2,501", amount: 2501 },
      { legacySevaId: 214, label: "Donate Rs. 1,008", amount: 1008 },
      { legacySevaId: 215, label: "Donate Any Other Amount", amount: null },
    ],
  },
  // ── Remaining sevas ──
  {
    slug: "makhan-mishri",
    title: "Makhan Mishri Seva",
    description: "Receive the special blessings of Makhan Lal by sponsoring His very favourite Makhan Mishri.",
    image: "/assets/janmashtami-sk5.webp",
    options: [
      { legacySevaId: 192, label: "Donate Rs. 10,008", amount: 10008 },
      { legacySevaId: 193, label: "Donate Rs. 5,001", amount: 5001 },
      { legacySevaId: 306, label: "Donate Rs. 3,501", amount: 3501 },
      { legacySevaId: 194, label: "Donate Rs. 2,501", amount: 2501 },
      { legacySevaId: 195, label: "Donate Rs. 1,008", amount: 1008 },
      { legacySevaId: 196, label: "Donate Rs. 501", amount: 501 },
      { legacySevaId: 197, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "vastrabharana",
    title: "Vastrabharana Seva",
    description: "Sponsor exquisite garments and divine ornaments for Sri Sri Radha Madan Mohan on Janmashtami.",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677419371-1783677418690-DietyPhotos.jpeg",
    options: [
      { legacySevaId: 258, label: "Donate Rs. 1,50,000", amount: 150000 },
      { legacySevaId: 259, label: "Donate Rs. 1,00,008", amount: 100008 },
      { legacySevaId: 260, label: "Donate Rs. 75,001", amount: 75001 },
      { legacySevaId: 307, label: "Donate Rs. 60,001", amount: 60001 },
      { legacySevaId: 261, label: "Donate Rs. 51,001", amount: 51001 },
      { legacySevaId: 262, label: "Donate Rs. 25,001", amount: 25001 },
      { legacySevaId: 263, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "chappan-bhog",
    title: "Chappan Bhog Seva",
    description: "Sponsor the grand offering of 56 dishes to Lord Krishna — a magnificent feast of devotion on His appearance day.",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785833232608-1785833231421-chapan-bhog.webp",
    options: [
      { legacySevaId: 222, label: "Donate Rs. 75,555", amount: 75555 },
      { legacySevaId: 223, label: "Donate Rs. 51,001", amount: 51001 },
      { legacySevaId: 224, label: "Donate Rs. 35,001", amount: 35001 },
      { legacySevaId: 308, label: "Donate Rs. 25,001", amount: 25001 },
      { legacySevaId: 225, label: "Donate Rs. 21,001", amount: 21001 },
      { legacySevaId: 226, label: "Donate Rs. 11,001", amount: 11001 },
      { legacySevaId: 227, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "mandapa",
    title: "Mandapa Seva",
    description: "Sponsor the sacred Mandapa decoration for the grand Janmashtami celebrations at HKM Vizag.",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785833231776-1785833231103-ChatGPTImageAug42026021053PM.webp",
    options: [
      { legacySevaId: 228, label: "Donate Rs. 55,555", amount: 55555 },
      { legacySevaId: 229, label: "Donate Rs. 35,001", amount: 35001 },
      { legacySevaId: 230, label: "Donate Rs. 25,001", amount: 25001 },
      { legacySevaId: 309, label: "Donate Rs. 21,001", amount: 21001 },
      { legacySevaId: 231, label: "Donate Rs. 15,001", amount: 15001 },
      { legacySevaId: 232, label: "Donate Rs. 7,501", amount: 7501 },
      { legacySevaId: 233, label: "Donate Any Other Amount", amount: null },
    ],
  },
  {
    slug: "japa-yagna",
    title: "Japa Yagna Seva",
    description: "Sponsor the Japa Yagna — a collective chanting of the holy names of Lord Krishna on His divine appearance day.",
    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785833232341-1785833231402-ChatGPTImageAug42026020855PM.webp",
    options: [
      { legacySevaId: 252, label: "Donate Rs. 7,777", amount: 7777 },
      { legacySevaId: 253, label: "Donate Rs. 5,001", amount: 5001 },
      { legacySevaId: 254, label: "Donate Rs. 3,001", amount: 3001 },
      { legacySevaId: 310, label: "Donate Rs. 2,501", amount: 2501 },
      { legacySevaId: 255, label: "Donate Rs. 2,001", amount: 2001 },
      { legacySevaId: 256, label: "Donate Rs. 1,008", amount: 1008 },
      { legacySevaId: 257, label: "Donate Any Other Amount", amount: null },
    ],
  },
];

const galleryImages = [
  "/assets/janmashtami-a75.webp",
  "/assets/janmashtami-a2.webp",
  "/assets/janmashtami-a3.webp",
  "/assets/janmashtami-a4.webp",
];

const TRUST_BADGES = [
  { icon: FileCheck2, label: "80G Tax Exemption" },
  { icon: UtensilsCrossed, label: "Mahaprasadam Sent" },
  { icon: Clock, label: "Instant Confirmation" },
  { icon: ShieldCheck, label: "Secure Razorpay Checkout" },
];

const initialForm: CheckoutForm = {
  donorName: "",
  donorMobile: "",
  donorEmail: "",
  customAmount: "",
  wantPrasadam: false,
  want80G: false,
  panNumber: "",
  doorNo: "",
  building: "",
  street: "",
  area: "",
  pincode: "",
  city: "",
  state: "",
  sevakName: "",
  dob: "",
};

const apiBase = () => (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");
const formatAmount = (amount: number) => amount.toLocaleString("en-IN");

export interface JanmashtamiCampaigner {
  name: string;
  slug: string;
  message?: string;
  raisedAmount?: number;
  donorCount?: number;
}

export default function JanmashtamiClient({ campaigner }: { campaigner?: JanmashtamiCampaigner } = {}) {
  const reduce = useReducedMotion();
  const attribution = useAttribution(campaigner ? `/janmashtami3/c/${campaigner.slug}` : "janmashtami3");
  const razorpayReady = useRazorpayPreload();
  const [activeSlide, setActiveSlide] = useState(0);
  const [selected, setSelected] = useState<SelectedOffering | null>(null);
  const [form, setForm] = useState<CheckoutForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error" | "idle"; message: string }>({ type: "idle", message: "" });

  const finalAmount = selected?.option.amount ?? Number(form.customAmount || 0);
  const showTaxField = finalAmount >= 500;
  const showPrasadamField = finalAmount >= 1000;
  const needsAddress = form.want80G || form.wantPrasadam;

  const selectedSummary = useMemo(() => {
    if (!selected) return "";
    return `${selected.seva.title} - ${selected.option.label}`;
  }, [selected]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % banners.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, []);

  const updateForm = (patch: Partial<CheckoutForm>) => {
    setForm((current) => ({ ...current, ...patch }));
  };

  const openCheckout = (seva: Seva, option: SevaOption) => {
    setSelected({ seva, option });
    setForm(initialForm);
    setStatus({ type: "idle", message: "" });
  };

  const closeCheckout = () => {
    if (!submitting) setSelected(null);
  };

  const validate = () => {
    if (!selected) return "Please select a seva.";
    if (!finalAmount || finalAmount < 100) return "Amount must be at least Rs.100.";
    if (!form.donorName.trim()) return "Donor name is required.";
    if (!/^[6-9]\d{9}$/.test(form.donorMobile)) return "Please enter a valid 10 digit mobile number.";
    if (form.donorEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.donorEmail.trim())) return "Please enter a valid email address, or leave it blank.";
    if (form.want80G && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber)) return "Please enter a valid PAN number.";
    if (needsAddress) {
      if (!form.area.trim() || !form.pincode.trim() || !form.city.trim() || !form.state.trim()) {
        return "Please fill address, pincode, city and state.";
      }
      if (!/^\d{6}$/.test(form.pincode)) return "Please enter a valid 6 digit pincode.";
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
      const orderResponse = await fetch(`${apiBase()}/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePage: campaigner ? `/janmashtami3/c/${campaigner.slug}` : "janmashtami3",
          campaignerSlug: campaigner?.slug || undefined,
          utm: attribution.payload().utm,
          festivalSlug: "janmashtami",
          type: "Sri Krishna Janmashtami",
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
                doorNo: form.doorNo,
                house: form.building,
                street: form.street,
                area: form.area,
                country: "India",
                state: form.state,
                city: form.city,
                pincode: form.pincode,
              }
            : null,
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
        description: selectedSummary,
        order_id: order.orderId,
        prefill: {
          name: form.donorName,
          email: form.donorEmail,
          contact: form.donorMobile,
        },
        notes: {
          sourcePage: "janmashtami3",
          festivalSlug: "janmashtami",
          legacySevaId: selected.option.legacySevaId,
          sevaName: selected.seva.title,
          sevaOption: selected.option.label,
        },
        handler: async (response: Record<string, string>) => {
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

            if (!verifyResponse.ok) throw new Error("Payment verification failed.");
            window.location.assign(`/payment/thank-you?type=seva&seva=${encodeURIComponent(selected?.seva.title || "Janmashtami seva")}&amount=${finalAmount}&source=${encodeURIComponent("the Janmashtami seva programme")}`);
            setSelected(null);
          } catch (verifyError) {
            setStatus({
              type: "error",
              message: verifyError instanceof Error ? verifyError.message : "Payment verification failed.",
            });
          } finally {
            setSubmitting(false);
          }
        },
        modal: {
          ondismiss: () => setSubmitting(false),
        },
        theme: {
          color: "#772036",
        },
      }).open();
    } catch (err) {
      setStatus({
        type: "error",
        message: err instanceof Error ? err.message : "Donation could not be completed. Please try again.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const moveSlide = (direction: number) => {
    setActiveSlide((current) => (current + direction + banners.length) % banners.length);
  };

  return (
    <main className="min-h-screen bg-[#fefaf0] text-slate-950">
      <WhatsAppFloatButton />
      {campaigner && (
        <div className="bg-gradient-to-r from-amber-600 to-amber-500 px-4 py-3 text-center text-white">
          <p className="text-sm md:text-base">
            🙏 You are supporting <span className="font-bold">{campaigner.name}</span>&apos;s Janmashtami seva campaign
            {typeof campaigner.donorCount === "number" && campaigner.donorCount > 0 && (
              <span> · {campaigner.donorCount} devotee{campaigner.donorCount === 1 ? "" : "s"} joined · ₹{(campaigner.raisedAmount || 0).toLocaleString("en-IN")} raised</span>
            )}
          </p>
          {campaigner.message && (
            <p className="mt-0.5 text-xs italic text-amber-50 md:text-sm">&ldquo;{campaigner.message}&rdquo;</p>
          )}
        </div>
      )}
      <section className="relative overflow-hidden bg-[#130922]">
        {/* Floating golden particles */}
        {!reduce && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
            {Array.from({ length: 18 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute h-1.5 w-1.5 rounded-full bg-[#ffd96f]"
                style={{
                  left: `${(i * 7 + 3) % 100}%`,
                  top: `${(i * 11 + 5) % 100}%`,
                }}
                animate={{
                  y: [0, -30, 0],
                  opacity: [0, 0.6, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 3 + (i % 4),
                  repeat: Infinity,
                  delay: i * 0.4,
                  ease: "easeInOut",
                }}
              />
            ))}
          </div>
        )}
        <div className="relative overflow-hidden rounded-b-3xl">
          {banners.map((banner, index) => (
            <a
              key={banner.desktop}
              href="#offer-seva"
              className={`block transition-opacity duration-700 ${index === activeSlide ? "relative opacity-100" : "absolute inset-0 opacity-0"}`}
              aria-hidden={index !== activeSlide}
            >
              <picture>
                <source media="(max-width: 640px)" srcSet={banner.mobile} />
                <img src={banner.desktop} alt={banner.alt} className="h-auto w-full" />
              </picture>
            </a>
          ))}
          <button
            type="button"
            onClick={() => moveSlide(-1)}
            className="absolute left-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 md:flex"
            aria-label="Previous banner"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => moveSlide(1)}
            className="absolute right-3 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur transition hover:bg-black/55 md:flex"
            aria-label="Next banner"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </section>

      <motion.section
        initial={reduce ? undefined : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative bg-[linear-gradient(135deg,#201244,#5b1733_58%,#8d4412)] px-4 py-12 text-white md:py-16"
      >
        {/* Animated shimmer overlay */}
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.08]"
            aria-hidden
            style={{
              background: "linear-gradient(135deg, transparent 30%, #ffd96f 50%, transparent 70%)",
              backgroundSize: "200% 200%",
            }}
            animate={{ backgroundPosition: ["100% 100%", "0% 0%"] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
        )}
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.35fr_0.65fr] md:items-center">
          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-[#ffd96f]">Hare Krishna Movement Vizag</p>
            <h1 className="text-3xl font-bold leading-tight text-[#ffdb68] md:text-5xl" style={{ textShadow: "0 0 40px hsl(42,92%,56%,0.3), 0 0 80px hsl(42,92%,56%,0.15)" }}>Sri Krishna Janmashtami</h1>
            <p className="mt-5 max-w-4xl text-base leading-8 text-white/92 md:text-lg">
              This Janmashtami, on the 4th & 5th of September, join the grand celebrations at HKM Vizag.
              Donate towards any of the sevas listed and receive special prasadam and the unlimited blessings of Lord Krishna.
            </p>
            <p className="mt-5 max-w-4xl border-l-4 border-[#ffdb68] pl-4 text-sm font-medium italic leading-7 text-white/90 md:text-base">
              "Whatever you do, whatever you eat, whatever you offer or give away... do that as an offering to Me." - Bhagavad-gita 9.27
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/10 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-start gap-3">
              <ShieldCheck className="mt-1 h-6 w-6 shrink-0 text-[#ffdb68]" />
              <div>
                <h2 className="text-lg font-bold text-white">Offer Seva This Janmashtami</h2>
                <p className="mt-2 text-sm leading-6 text-white/78">
                  Your offering sustains the midnight Abhisheka, the grand Nandotsava feast, and every sacred ritual performed at HKM Vizag on Lord Krishna&apos;s appearance day.
                </p>
              </div>
            </div>
            <motion.a
              href="#offer-seva"
              animate={reduce ? undefined : { boxShadow: ["0 0 0 0 rgba(255,219,104,0.4)", "0 0 0 16px rgba(255,219,104,0)", "0 0 0 0 rgba(255,219,104,0.4)"] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="mt-5 inline-flex w-full items-center justify-center rounded-md bg-[#ffcc3d] px-5 py-3 text-sm font-bold uppercase tracking-[0.08em] text-[#3b1605] shadow-lg transition hover:bg-[#ffd96f]"
            >
              Offer Seva
            </motion.a>
          </div>
        </div>
      </motion.section>

      {/* ---------- Trust strip ---------- */}
      <motion.section
        initial={reduce ? undefined : { opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="border-y-2 border-[#ffdb68]/60 bg-[#130922] py-3.5"
      >
        <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-2 px-4">
          {TRUST_BADGES.map((b) => (
            <span key={b.label} className="flex items-center gap-2 text-xs font-semibold tracking-wide text-white/90 md:text-sm">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#ffd96f]/15 ring-1 ring-[#ffd96f]/40">
                <b.icon className="h-3 w-3 text-[#ffd96f]" />
              </span>
              {b.label}
            </span>
          ))}
        </div>
      </motion.section>

      <style>{`
        .form-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .form-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .form-scroll::-webkit-scrollbar-thumb {
          background: #c98a1a;
          border-radius: 9999px;
        }
        .form-scroll::-webkit-scrollbar-thumb:hover {
          background: #a16c12;
        }
        .form-scroll {
          scrollbar-width: thin;
          scrollbar-color: #c98a1a transparent;
        }
      `}</style>

      <section id="offer-seva" className="relative overflow-hidden px-4 py-12 md:py-16">
        {/* Krishna peacock-feather decorative background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
          {/* Base warm gradient */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#fffaf2] via-[#fdf5e8] to-[#f7ecd7]" />

          {/* Toran garlands hanging down from the top corners */}
          <Image
            src={DECOR_GARLAND}
            alt=""
            unoptimized
            width={145}
            height={350}
            draggable={false}
            className="absolute left-0 top-0 h-[150px] w-auto opacity-40 md:h-[230px] md:opacity-50 lg:h-[310px] lg:opacity-60"
          />
          <Image
            src={DECOR_GARLAND}
            alt=""
            unoptimized
            width={145}
            height={350}
            draggable={false}
            className="absolute right-0 top-0 h-[150px] w-auto -scale-x-100 opacity-40 md:h-[230px] md:opacity-50 lg:h-[310px] lg:opacity-60"
          />

          {/* Matka pots resting at the bottom corners */}
          <Image
            src={DECOR_MATKA}
            alt=""
            unoptimized
            width={500}
            height={500}
            draggable={false}
            className="absolute bottom-0 left-0 h-[110px] w-auto opacity-40 md:h-[180px] md:opacity-50 lg:h-[240px] lg:opacity-60"
          />
          <Image
            src={DECOR_MATKA}
            alt=""
            unoptimized
            width={500}
            height={500}
            draggable={false}
            className="absolute bottom-0 right-0 h-[110px] w-auto opacity-40 md:h-[180px] md:opacity-50 lg:h-[240px] lg:opacity-60"
          />

          {/* Soft color glows echoing the peacock hues */}
          <div className="absolute -left-20 top-1/3 h-72 w-72 rounded-full bg-teal-500/[0.05] blur-[90px]" />
          <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-amber-400/[0.06] blur-[80px]" />

          {/* Top & bottom decorative borders */}
          <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-amber-500/25 to-transparent" />
          <div className="absolute bottom-0 left-0 h-px w-full bg-gradient-to-r from-transparent via-teal-500/20 to-transparent" />
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
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-500/40 sm:w-16 md:w-24" />
              <svg className="h-6 w-6 text-amber-600/50 md:h-8 md:w-8" viewBox="0 0 40 40" fill="currentColor">
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(72 20 20)" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(144 20 20)" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(216 20 20)" />
                <path d="M20 2 C24 8 26 14 20 20 C14 14 16 8 20 2Z" transform="rotate(288 20 20)" />
                <circle cx="20" cy="20" r="5" />
              </svg>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-500/40 sm:w-16 md:w-24" />
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-amber-700 md:text-sm">Choose Your Offering</p>
            <h2 className="mt-2 text-3xl font-bold text-[#331447] md:text-4xl lg:text-5xl">Janmashtami Sevas</h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-amber-800/50 md:text-base">
              Select a sacred seva and receive the divine blessings of Lord Krishna
            </p>
          </motion.div>

          {/* Seva cards */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, staggerChildren: reduce ? 0 : 0.08 }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sevas.map((seva, idx) => (
              <motion.article
                key={seva.slug}
                initial={reduce ? undefined : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: reduce ? 0 : idx * 0.08 }}
                className="group overflow-hidden rounded-2xl border border-amber-300/70 bg-white shadow-[0_2px_20px_rgba(120,60,10,0.1)] transition-all duration-500 hover:-translate-y-1 hover:border-amber-400 hover:shadow-[0_16px_48px_rgba(120,60,10,0.18)]"
              >
                {/* Image with gradient overlay + title */}
                <div className="relative h-48 overflow-hidden shadow-[inset_0_-12px_12px_-8px_rgba(0,0,0,0.12)] md:h-56">
                  <Image
                    src={seva.image}
                    alt={seva.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent" />
                  <h3 className="absolute bottom-3 left-4 right-4 text-lg font-bold tracking-wide text-white drop-shadow-md md:text-xl">{seva.title}</h3>
                </div>

                {/* Card body */}
                <div className="p-4 pt-3">
                  <p className="min-h-[52px] text-[13px] leading-relaxed text-slate-700 md:text-sm">{seva.description}</p>

                  {/* Elegant price buttons */}
                  <div className="mt-4 grid grid-cols-2 gap-x-2 gap-y-2">
                    {seva.options.map((option, optIdx) => {
                      const isTopTier = optIdx === 0;
                      const isCustom = !option.amount;
                      const hasSubtitle = !!option.subtitle;
                      return (
                        <button
                          key={`${seva.slug}-${optIdx}`}
                          type="button"
                          onClick={() => openCheckout(seva, option)}
                          className={`
                            relative overflow-hidden rounded-xl border text-center transition-all duration-300
                            ${hasSubtitle ? 'flex flex-col items-center justify-center gap-1 px-3 pb-2 pt-2.5' : 'px-3 py-3'}
                            ${isCustom
                              ? 'col-span-2 border-amber-500/70 bg-gradient-to-r from-amber-200 via-amber-200 to-orange-200 text-[13px] font-bold text-[#5c2e06] hover:border-amber-500 hover:from-amber-300 hover:to-orange-200 hover:shadow-[0_4px_16px_rgba(217,119,6,0.25)]'
                              : isTopTier
                                ? 'border-amber-500/80 bg-gradient-to-br from-amber-400 via-amber-300 to-orange-300 text-[12px] font-bold text-[#3b1605] shadow-[0_2px_6px_rgba(217,119,6,0.2)] hover:border-amber-600 hover:shadow-[0_4px_16px_rgba(217,119,6,0.3)]'
                                : 'border-amber-300/70 bg-gradient-to-b from-amber-100 to-[#fef0d4] text-[12px] font-bold text-[#5c2e06] hover:border-amber-400 hover:from-amber-200 hover:to-amber-100 hover:shadow-[0_3px_12px_rgba(217,119,6,0.18)]'
                            }
                          `}
                        >
                          {isTopTier && !hasSubtitle && (
                            <span className="absolute left-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-400">
                              <svg className="h-2.5 w-2.5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.4 7.4H22l-6 4.6 2.3 7L12 16.4 5.7 21l2.3-7L2 9.4h7.6z"/></svg>
                            </span>
                          )}
                          <span className={`block ${isTopTier && !hasSubtitle ? 'mt-1' : ''}`}>
                            {option.amount ? (
                              <span className="block leading-tight">
                                <span className="text-[11px] font-normal text-amber-800/80">₹</span>{' '}
                                <span className="text-[14px] md:text-[15px]">{formatAmount(option.amount)}</span>
                              </span>
                            ) : (
                              <span className="flex items-center justify-center gap-1.5">
                                <svg className="h-3 w-3 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                                <span className="text-[12px]">Donate Other Amount</span>
                              </span>
                            )}
                          </span>
                          {hasSubtitle && (
                            <span className="inline-block rounded-full bg-gradient-to-r from-[#5c1a0b] to-[#7a2e0f] px-3 py-0.5 text-[9px] font-bold uppercase tracking-wider text-amber-100 shadow-sm">
                              {option.subtitle}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="bg-[#130922] px-4 py-7 text-white">
        <div className="mx-auto max-w-6xl text-sm leading-7 md:text-base">
          Gentle Request! While doing Paytm/UPI App Payments or Bank (NEFT/ RTGS), please send us a screenshot along with complete address and PAN details on our Whatsapp Number{" "}
          <a className="font-bold text-[#ffdb68]" href="tel:+918977761187">+91 89777 61187</a> or to our mail ID{" "}
          <a className="font-bold text-[#ffdb68]" href="mailto:social@hkmvizag.org">social@hkmvizag.org</a>. You may also call on this number for other queries.
        </div>
      </section>

      <section className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-6xl rounded-lg border border-amber-900/15 bg-white p-6 shadow-[0_14px_35px_rgba(68,31,17,0.12)]">
          <h2 className="text-xl font-bold text-[#331447]">Donation Through Bank (NEFT/ RTGS)</h2>
          <p className="mt-4 leading-8 text-slate-700">
            Beneficiary Name : HARE KRISHNA MOVEMENT INDIA<br />
            Bank Name: IDFC FIRST BANK LTD<br />
            A/c No: 10091415313<br />
            IFSC code: IDFB0080412
          </p>
        </div>
      </section>

      <JanmashtamiGallery />

      <section className="px-4 pb-16">
        <div className="mx-auto grid max-w-6xl gap-4 md:grid-cols-2">
          {galleryImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Sri Krishna Janmashtami seva activity ${index + 1}`}
              className="h-full min-h-[220px] w-full rounded-lg object-cover shadow-[0_12px_32px_rgba(68,31,17,0.14)]"
              loading="lazy"
              decoding="async"
            />
          ))}
        </div>
      </section>

      <footer className="relative overflow-hidden bg-[#0f0620] text-white">
        {/* Decorative top border with gradient */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-[#ffd96f]/60 to-transparent" />

        {/* Subtle radial glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[600px] -translate-x-1/2 rounded-full bg-[#ffd96f]/[0.04] blur-[100px]" aria-hidden />

        <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-8">
          {/* Top devotional strip */}
          <div className="mb-14 text-center">
            <div className="mx-auto mb-4 h-px w-24 bg-gradient-to-r from-transparent via-[#ffd96f]/50 to-transparent sm:w-48" />
            <p className="font-heading text-lg italic leading-relaxed text-[#ffd96f]/90 md:text-xl">
              &ldquo;Hare Krishna Hare Krishna, Krishna Krishna Hare Hare&rdquo;
            </p>
            <p className="font-heading text-lg italic leading-relaxed text-[#ffd96f]/90 md:text-xl">&ldquo;Hare Rama Hare Rama, Rama Rama Hare Hare&rdquo;</p>
          </div>

          {/* Main grid */}
          <div className="grid gap-10 md:grid-cols-12">
            {/* Brand column */}
            <div className="md:col-span-4">
              <div>
                <p className="font-heading text-xl font-bold text-[#ffdb68]" style={{ textShadow: "0 0 24px rgba(255,219,104,0.25)" }}>Hare Krishna Movement</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.24em] text-white/50">Visakhapatnam</p>
              </div>
              <p className="mt-6 text-sm leading-7 text-white/70">
                Giving human society an opportunity for a life of happiness, good health, peace of mind, and all good qualities through God Consciousness.
              </p>

              {/* Social icons */}
              <div className="mt-6 flex items-center gap-3">
                {[
                  { icon: Facebook, href: "https://www.facebook.com/hkm.vizag", label: "Facebook" },
                  { icon: Youtube, href: "https://www.youtube.com/user/harekrishnavizag", label: "YouTube" },
                  { icon: Instagram, href: "https://www.instagram.com/hare_krishna_vizag/", label: "Instagram" },
                  { icon: MessageCircle, href: "https://wa.me/918977761187", label: "WhatsApp" },
                ].map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={s.label}
                    className="group flex h-10 w-10 items-center justify-center rounded-full border border-[#ffd96f]/20 bg-white/[0.03] text-[#ffd96f]/80 transition-all hover:-translate-y-0.5 hover:border-[#ffd96f]/60 hover:bg-[#ffd96f]/10 hover:text-[#ffd96f] hover:shadow-[0_4px_16px_rgba(255,217,111,0.15)]"
                  >
                    <s.icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="md:col-span-3">
              <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ffd96f]">
                <span className="h-px w-4 bg-[#ffd96f]/60" />
                Explore
              </h3>
              <ul className="space-y-3 text-sm text-white/70">
                {[
                  { label: "Hare Krishna Movement", href: "/about" },
                  { label: "Contact Us", href: "/contact" },
                  { label: "Subhojanam", href: "/subhojanam" },
                  { label: "Terms & Conditions", href: "/terms-and-conditions" },
                  { label: "Refund Policy", href: "/refund-policy" },
                  { label: "Privacy Policy", href: "/privacy-policy" },
                ].map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="group inline-flex items-center gap-2 transition-colors hover:text-[#ffd96f]">
                      <span className="h-1 w-1 rounded-full bg-[#ffd96f]/40 transition-all group-hover:w-3 group-hover:bg-[#ffd96f]" />
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className="md:col-span-5">
              <h3 className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.24em] text-[#ffd96f]">
                <span className="h-px w-4 bg-[#ffd96f]/60" />
                Visit &amp; Reach Us
              </h3>

              <div className="rounded-2xl border border-[#ffd96f]/15 bg-white/[0.03] p-5 backdrop-blur">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#ffd96f]" />
                  <div className="text-sm leading-6 text-white/75">
                    <p className="font-semibold text-white">Hare Krishna Movement</p>
                    <p className="mt-1 text-white/65">
                      Chaitanya Bhavan, Hare Krishna Vaikuntam Cultural Centre,<br />
                      SIIM Rd, opp. Akshaya Patra Foundation, Gambhiram,<br />
                      Visakhapatnam, Andhra Pradesh 531163
                    </p>
                  </div>
                </div>

                <div className="my-4 h-px bg-gradient-to-r from-transparent via-[#ffd96f]/15 to-transparent" />

                <div className="grid gap-3 sm:grid-cols-2">
                  <a href="tel:+918977761187" className="group flex items-center gap-2.5 text-sm text-white/75 transition-colors hover:text-[#ffd96f]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffd96f]/10 ring-1 ring-[#ffd96f]/20 transition-all group-hover:bg-[#ffd96f]/20">
                      <Phone className="h-3.5 w-3.5 text-[#ffd96f]" />
                    </span>
                    <span className="font-medium">+91 89777 61187</span>
                  </a>
                  <a href="mailto:social@hkmvizag.org" className="group flex items-center gap-2.5 text-sm text-white/75 transition-colors hover:text-[#ffd96f]">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#ffd96f]/10 ring-1 ring-[#ffd96f]/20 transition-all group-hover:bg-[#ffd96f]/20">
                      <Mail className="h-3.5 w-3.5 text-[#ffd96f]" />
                    </span>
                    <span className="font-medium">social@hkmvizag.org</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-14 border-t border-white/10 pt-6">
            <div className="flex flex-col items-center justify-between gap-3 text-xs text-white/45 md:flex-row">
              <p>&copy; 2026 Hare Krishna Movement Visakhapatnam. All rights reserved.</p>
              <p className="flex items-center gap-1.5">
                Crafted with <Heart className="h-3 w-3 fill-[#ffd96f] text-[#ffd96f]" /> for Sri Krishna Janmashtami
              </p>
            </div>
          </div>
        </div>
      </footer>

      {status.message && !selected && (
        <div className={`fixed bottom-6 left-1/2 z-[120] -translate-x-1/2 rounded-lg px-5 py-3 text-sm font-semibold shadow-lg ${
          status.type === "success" ? "bg-green-700 text-white" : "bg-red-700 text-white"
        }`}>
          {status.message}
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-sm">
          <div
            className="form-scroll relative max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-xl border border-amber-200/50 shadow-2xl"
            style={{
              background: `
                url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cg transform='translate(60,60)'%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e'/%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e' transform='rotate(45)'/%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e' transform='rotate(90)'/%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e' transform='rotate(135)'/%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e' transform='rotate(180)'/%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e' transform='rotate(225)'/%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e' transform='rotate(270)'/%3E%3Cpath d='M0,-6 C6,-16 6,-28 0,-34 C-6,-28 -6,-16 0,-6Z' fill='%2392400e' transform='rotate(315)'/%3E%3Ccircle r='8' fill='%23b45309'/%3E%3Ccircle r='4' fill='%23d97706'/%3E%3C/g%3E%3Cg transform='translate(0,0)'%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309'/%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309' transform='rotate(90)'/%3E%3Ccircle r='3' fill='%23d97706'/%3E%3C/g%3E%3Cg transform='translate(120,0)'%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309'/%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309' transform='rotate(90)'/%3E%3Ccircle r='3' fill='%23d97706'/%3E%3C/g%3E%3Cg transform='translate(0,120)'%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309'/%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309' transform='rotate(90)'/%3E%3Ccircle r='3' fill='%23d97706'/%3E%3C/g%3E%3Cg transform='translate(120,120)'%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309'/%3E%3Cellipse cx='0' cy='-5' rx='3' ry='6' fill='%23b45309' transform='rotate(90)'/%3E%3Ccircle r='3' fill='%23d97706'/%3E%3C/g%3E%3Cpath d='M60 6 Q72 30 60 60' stroke='%23b45309' stroke-width='0.6' fill='none'/%3E%3Cpath d='M60 60 Q48 90 60 114' stroke='%23b45309' stroke-width='0.6' fill='none'/%3E%3Cpath d='M6 60 Q30 48 60 60' stroke='%23b45309' stroke-width='0.6' fill='none'/%3E%3Cpath d='M60 60 Q90 72 114 60' stroke='%23b45309' stroke-width='0.6' fill='none'/%3E%3C/svg%3E") repeat,
                linear-gradient(to bottom, #fefaf1, #fff5e6 50%, #ffefd0)
              `,
              backgroundBlendMode: 'overlay',
            }}
          >
            {/* Form content */}
            <div className="relative z-10">
              <div className="sticky top-0 z-10 flex items-center justify-between border-b border-amber-200/50 bg-[#fefaf1]/90 px-6 py-4 backdrop-blur">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700/70">Janmashtami Checkout</p>
                  <h2 className="text-xl font-bold text-[#331447]">{selected.seva.title}</h2>
                </div>
                <button type="button" onClick={closeCheckout} className="rounded-full border border-amber-300/60 bg-white/60 p-2 text-amber-700/60 transition hover:border-amber-400 hover:bg-white hover:text-amber-900" aria-label="Close checkout">
                  <X className="h-5 w-5" />
                </button>
              </div>

            <form onSubmit={submitDonation} className="space-y-5 p-6">
              <div className="grid gap-4 rounded-lg border border-amber-200/40 bg-white/60 p-4 md:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold text-amber-700/60">Seva Name</p>
                  <p className="mt-1 font-bold text-[#331447]">{selected.seva.title}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-amber-700/60">Seva Amount</p>
                  <p className="mt-1 font-bold text-[#331447]">
                    {selected.option.amount ? `₹${formatAmount(selected.option.amount)}` : "Enter amount below"}
                  </p>
                </div>
              </div>

              {!selected.option.amount && (
                <label className="block">
                  <span className="text-sm font-semibold text-[#331447]">Enter Seva Amount *</span>
                  <Input
                    type="number"
                    min={100}
                    value={form.customAmount}
                    onChange={(event) => updateForm({ customAmount: event.target.value, want80G: false, wantPrasadam: false })}
                    placeholder="Enter amount"
                    className="mt-2 border-amber-200 focus-visible:ring-amber-400"
                  />
                  <span className="mt-1 block text-xs text-amber-700/60">Amount must be at least Rs.100.</span>
                </label>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-semibold text-[#331447]">Donor Name *</span>
                  <Input value={form.donorName} maxLength={39} onChange={(event) => updateForm({ donorName: event.target.value.replace(/[^a-zA-Z ]/g, "") })} placeholder="Your Name" className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                </label>
                <label className="block">
                  <span className="text-sm font-semibold text-[#331447]">Mobile Number *</span>
                  <Input value={form.donorMobile} maxLength={10} onChange={(event) => updateForm({ donorMobile: event.target.value.replace(/\D/g, "") })} placeholder="Your Mobile Number" className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                </label>
                <label className="block md:col-span-2">
                  <span className="text-sm font-semibold text-[#331447]">E-Mail ID (optional)</span>
                  <Input type="email" value={form.donorEmail} onChange={(event) => updateForm({ donorEmail: event.target.value.toLowerCase() })} placeholder="Your Email" className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                </label>
              </div>

              <DonorExtrasFields
                sevakName={form.sevakName}
                dob={form.dob}
                onSevakNameChange={(v) => updateForm({ sevakName: v })}
                onDobChange={(v) => updateForm({ dob: v })}
                variant="amber"
                collapsible
              />

              <div className="space-y-3">
                {showPrasadamField && (
                  <label className="flex items-start gap-3 rounded-lg border border-amber-200/60 bg-white/40 p-4 text-sm text-[#331447]">
                    <input type="checkbox" checked={form.wantPrasadam} onChange={(event) => updateForm({ wantPrasadam: event.target.checked })} className="mt-1 accent-amber-600" />
                    I would like to receive Maha Prasadam (Only within India)
                  </label>
                )}
                {showTaxField && (
                  <label className="flex items-start gap-3 rounded-lg border border-amber-200/60 bg-white/40 p-4 text-sm text-[#331447]">
                    <input type="checkbox" checked={form.want80G} onChange={(event) => updateForm({ want80G: event.target.checked })} className="mt-1 accent-amber-600" />
                    <span>
                      I wish to receive 80G Tax Exemption
                      <span className="mt-1 block text-xs text-amber-700/60">PAN and address are mandatory when 80G is selected.</span>
                    </span>
                  </label>
                )}
              </div>

              {form.want80G && (
                <label className="block">
                  <span className="text-sm font-semibold text-[#331447]">PAN Number *</span>
                  <Input value={form.panNumber} maxLength={10} onChange={(event) => updateForm({ panNumber: event.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "") })} placeholder="Eg: ABCDE1234F" className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                </label>
              )}

              {needsAddress && (
                <div className="grid gap-4 rounded-lg border border-amber-200/60 bg-white/40 p-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-semibold text-[#331447]">House No/Door No</span>
                    <Input value={form.doorNo} maxLength={39} onChange={(event) => updateForm({ doorNo: event.target.value })} className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-[#331447]">House/Apartment/Building Name</span>
                    <Input value={form.building} maxLength={39} onChange={(event) => updateForm({ building: event.target.value })} className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-[#331447]">Street Name</span>
                    <Input value={form.street} maxLength={39} onChange={(event) => updateForm({ street: event.target.value })} className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-[#331447]">Location/Area *</span>
                    <Input value={form.area} maxLength={39} onChange={(event) => updateForm({ area: event.target.value })} className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-[#331447]">PIN Code *</span>
                    <Input value={form.pincode} maxLength={6} onChange={(event) => updateForm({ pincode: event.target.value.replace(/\D/g, "") })} className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-[#331447]">City *</span>
                    <Input value={form.city} maxLength={30} onChange={(event) => updateForm({ city: event.target.value.toUpperCase().replace(/[^A-Z ]/g, "") })} className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                  </label>
                  <label className="block md:col-span-2">
                    <span className="text-sm font-semibold text-[#331447]">State *</span>
                    <Input value={form.state} maxLength={30} onChange={(event) => updateForm({ state: event.target.value.toUpperCase().replace(/[^A-Z ]/g, "") })} className="mt-2 border-amber-200 focus-visible:ring-amber-400" />
                  </label>
                </div>
              )}

              {status.type === "error" && <p className="rounded-lg bg-red-100 px-4 py-3 text-sm font-semibold text-red-700">{status.message}</p>}

              <motion.div
                animate={submitting || reduce ? undefined : { scale: [1, 1.02, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <Button type="submit" disabled={submitting} className="w-full bg-[#ffc928] py-6 text-base font-bold text-[#3a1905] hover:bg-[#ffdb68]">
                  <Heart className="mr-2 h-5 w-5 fill-current" />
                  {submitting ? "Opening Checkout..." : `Donate Rs. ${formatAmount(finalAmount || 0)}`}
                </Button>
              </motion.div>
            </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

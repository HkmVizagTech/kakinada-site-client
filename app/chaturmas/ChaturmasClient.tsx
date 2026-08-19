"use client";

import PageLayout from "@/components/PageLayout";
import WhatsAppFloatButton from "@/components/WhatsAppFloatButton";
import Ornament from "@/components/Ornament";
import DonationForm from "@/components/DonationForm";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CheckCircle2,
  Clock,
  FileCheck2,
  Heart,
  Leaf,
  Lock,
  Moon,
  ShieldCheck,
  X,
  Quote,
  Sun,
  Sparkles,
  BookOpen,
  Utensils,
  Phone,
  ScrollText,
  ChevronDown,
  MessageCircle,
  Users,
  Navigation,
} from "lucide-react";
import { sevas, type Seva } from "@/lib/sevaConfig";

const apiBase = () => (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

const WA_CHANNEL = "https://whatsapp.com/channel/0029VaZDEG67T8bWHjibTy2u";

const MAPS_DIRECTIONS_URL =
  "https://maps.app.goo.gl/Yg2imkSEDxuY5u2K9?g_st=aw";

type BannerSlide = {
  desktop: string;
  mobile: string;
  alt: string;
  linkUrl?: string;
};

const FALLBACK_BANNERS: BannerSlide[] = [
  {
    desktop: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786539472426-1786539471654-Chaturmasbanner.webp",
    mobile: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786539471904-1786539471306-Chaturmasbanner-mob.webp",
    alt: "Chaturmas 2026 — the four sacred months",
  },
];

const stats = [
  { icon: CalendarDays, value: "4", label: "Sacred Months", sub: "Ashadha to Kartika" },
  { icon: Moon, value: "July 29", label: "Chaturmas Begins", sub: "2026 · Devashayani" },
  { icon: Sun, value: "Nov 24", label: "Chaturmas Ends", sub: "2026 · Utthana Ekadashi" },
  { icon: Heart, value: "4", label: "Monthly Vrats", sub: "One food restriction each month" },
];

const restrictionMonths = [
  {
    month: "First Month",
    title: "Green Leafy Vegetables",
    emoji: "🥬",
    color: "from-emerald-500/20 to-green-600/10",
    border: "border-emerald-400/30",
    badge: "bg-emerald-500/15 text-emerald-700",
    avoid: ["Green leafy vegetables (shak)", "Palak (spinach)", "Methi (fenugreek)", "Saraso (mustard greens)"],
    permitted: ["Dhaniya (coriander)", "Pudina (mint)", "Cabbage", "Kari Patta (curry leaves)"],
  },
  {
    month: "Second Month",
    title: "Curds & Yogurt",
    emoji: "🥛",
    color: "from-amber-400/20 to-yellow-500/10",
    border: "border-amber-400/30",
    badge: "bg-amber-500/15 text-amber-700",
    avoid: ["Curds (yogurt)", "Raita", "Lassi", "Kadi", "Chaach (buttermilk)", "Shreekhand"],
    permitted: ["Curds as a side ingredient only", "In very small quantities"],
  },
  {
    month: "Third Month",
    title: "Milk",
    emoji: "🥛",
    color: "from-sky-400/20 to-blue-500/10",
    border: "border-sky-400/30",
    badge: "bg-sky-500/15 text-sky-700",
    avoid: ["Milk", "Milkshake", "Rabri", "Kheer", "Ice-cream", "Thandai"],
    permitted: ["Items made by curdling milk", "Paneer", "Rasgulla", "Cheese"],
  },
  {
    month: "Fourth Month",
    title: "Urad Dal",
    emoji: "🫘",
    color: "from-orange-400/20 to-red-500/10",
    border: "border-orange-400/30",
    badge: "bg-orange-500/15 text-orange-700",
    avoid: ["Items made from urad dal", "Dosa", "Urad dal pakode (vada)"],
    permitted: ["Other dals like moong", "Use moong for such preparations"],
  },
];

const primaryRules = [
  {
    icon: Leaf,
    title: "Fasting from Specific Foods",
    desc: "Avoid the specific food items prescribed for each month of the Chaturmas, as mentioned above.",
  },
  {
    icon: Utensils,
    title: "Eat Only Krishna Prasadam",
    desc: "Take food only after it has been offered to the Supreme Lord — nothing prepared for one's own sense gratification.",
  },
  {
    icon: BookOpen,
    title: "Increase Devotional Service",
    desc: "Chant the Hare Krishna mahamantra, read the Bhagavad-gita, visit the temple regularly and engage more and more in devotional activities.",
  },
];

const secondaryRules = [
  {
    icon: Heart,
    title: "Perform Charity",
    desc: "Give in charity as much as possible during these four most beneficial months.",
  },
  {
    icon: Leaf,
    title: "Plant Sacred Plants",
    desc: "Plant sacred plants such as Tulasi and Pipal, and tend to them with devotion.",
  },
  {
    icon: Moon,
    title: "Simple Austerities",
    desc: "Sleep on the floor and eat as little as possible, reducing bodily comforts.",
  },
  {
    icon: Sun,
    title: "Rise Early & Serve",
    desc: "Rise early in the morning and engage the early hours in devotional activities.",
  },
];

const benefits = [
  {
    icon: Sparkles,
    title: "Purification of Existence",
    desc: "Restricting the bodily necessities purifies the heart and reduces the pull of sense enjoyment.",
  },
  {
    icon: Heart,
    title: "Blessings of Sri Krishna",
    desc: "The Supreme Lord is immensely pleased with those who observe the Chaturmasya vrat with devotion.",
  },
  {
    icon: BookOpen,
    title: "Advancement in Devotion",
    desc: "Austerity combined with devotional service accelerates one's progress on the path of bhakti.",
  },
];

const historyEvents = [
  {
    title: "A Sudra Boy Became Narada Muni",
    desc: "As mentioned in the Srimad Bhagavatam, Narada Muni was born in his previous life as the son of a maidservant. During the Chaturmasya period he served the Mahabhagavata devotees and accepted their Mahaprasadam, receiving the blessing of seeing Krishna in that very life. He later became Narada Muni, the son of Lord Brahma.",
  },
  {
    title: "Lord Krishna Stayed in Hastinapura",
    desc: "During His presence on earth, Lord Krishna was requested by King Yudhishthira to stay in Hastinapura. Accepting the request of His devotee, the Lord stayed there with him during the Chaturmas period.",
  },
  {
    title: "Caitanya Mahaprabhu Accepted Gopal Bhatta Goswami",
    desc: "During one Chaturmasya, Lord Sri Krishna Caitanya Mahaprabhu stayed in Sri Rangam kshetra. There He transformed the heart of Venkata Bhatta to worship Lord Krishna as the Supreme Personality of Godhead, and accepted his son Gopal Bhatta as His servant.",
  },
  {
    title: "Srila Madhavendra Puri Stayed in Jagannath Puri",
    desc: "When Sri Gopala, the Deity of Srila Madhavendra Puri, asked him to bring sandalwood to apply on Him, Srila Madhavendra Puri travelled to Jagannath Puri and stayed there during the period of Chaturmas.",
  },
  {
    title: "Navadvip Devotees Visited Caitanya Mahaprabhu",
    desc: "While Sri Caitanya Mahaprabhu stayed at Jagannath Puri, all His devotees from Navadvip would visit Him every year on Rath Yatra and then remain with the Lord for the whole duration of Chaturmas.",
  },
];

const faqs = [
  {
    q: "Can we travel during Chaturmas?",
    a: "During Chaturmas the sannyasis avoid travelling and stay at one holy place while practicing intense devotional service. As a practitioner, one should try to avoid travelling as much as possible and focus on devotional activities. However, in case of urgent work or an emergency one may travel, but only as much as absolutely needed.",
  },
  {
    q: "Can children and the elderly follow it fully?",
    a: "Yes. There is no difficulty for children or the elderly to follow the Chaturmas Vrat. The rules are simple — avoid certain food items and perform devotional services as much as possible. However, in case of medicinal need, the forbidden food items may be taken as absolutely required.",
  },
  {
    q: "Is it compulsory to fast for all four months?",
    a: "Yes. The fasts recommended for Chaturmasya and other auspicious days like Ekadashi and Janmashtami are observed for advancement in spiritual life by enhancing austerity and reducing bodily demands. One who is serious about progressing on the spiritual path must strictly observe all the recommended rules.",
  },
  {
    q: "What if I miss one rule?",
    a: "One must be very careful in observing all the recommended rules of Chaturmas, for inattention affects the benefits derived from the vrat. If a rule is missed, one should pray to the Lord for forgiveness and ask for strength to follow the vrat with firm determination.",
  },
];

const trustBadges = [
  { icon: FileCheck2, label: "80G Tax Exemption" },
  { icon: Clock, label: "Instant Confirmation" },
  { icon: ShieldCheck, label: "Secure Razorpay" },
  { icon: Lock, label: "100% Goes to Seva" },
];

function SectionDivider({ flip = false }: { flip?: boolean }) {
  return (
    <div className={`relative h-16 md:h-24 overflow-hidden ${flip ? "rotate-180" : ""}`} aria-hidden>
      <svg viewBox="0 0 1440 96" preserveAspectRatio="none" className="absolute inset-0 h-full w-full">
        <path d="M0,64 C360,96 720,0 1080,64 C1260,96 1380,80 1440,64 L1440,96 L0,96 Z" fill="currentColor" />
      </svg>
    </div>
  );
}

export default function ChaturmasClient() {
  const reduce = useReducedMotion();
  const ref1 = useRef(null);
  const ref2 = useRef(null);
  const ref3 = useRef(null);
  const ref4 = useRef(null);
  const ref5 = useRef(null);
  const ref6 = useRef(null);
  const inView1 = useInView(ref1, { once: true, margin: "-80px" });
  const inView2 = useInView(ref2, { once: true, margin: "-80px" });
  const inView3 = useInView(ref3, { once: true, margin: "-80px" });
  const inView4 = useInView(ref4, { once: true, margin: "-80px" });
  const inView5 = useInView(ref5, { once: true, margin: "-80px" });
  const inView6 = useInView(ref6, { once: true, margin: "-80px" });

  const [banners, setBanners] = useState<BannerSlide[]>(FALLBACK_BANNERS);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${apiBase()}/hero-banners`);
        if (res.ok) {
          const data = await res.json();
          const list = (data.banners || []).filter((b: any) => {
            const hay = `${b.title || ""} ${b.linkUrl || ""}`.toLowerCase();
            return hay.includes("chaturmas");
          });
          if (list.length && !cancelled) {
            setBanners(
              list.map((b: any) => ({
                desktop: b.desktopImage,
                mobile: b.mobileImage,
                alt: b.title || "Chaturmas banner",
                linkUrl: b.linkUrl || "",
              }))
            );
          }
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = window.setInterval(() => {
      setActiveSlide((c) => (c + 1) % banners.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [banners.length]);

  const moveSlide = (d: number) => {
    setActiveSlide((c) => (c + d + banners.length) % banners.length);
  };

  const [sevaPickerOpen, setSevaPickerOpen] = useState(false);
  const [selectedSeva, setSelectedSeva] = useState<Seva | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const pickerRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // When the picker opens, wait for the height animation to settle, then
  // bring the step flow into view so it never appears far below the fold.
  useEffect(() => {
    if (!sevaPickerOpen) return;
    const t = window.setTimeout(() => {
      pickerRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 450);
    return () => window.clearTimeout(t);
  }, [sevaPickerOpen, reduce]);

  // Once a seva is chosen, the donation form is much taller than the seva
  // list — scroll its top into view so the user lands on the top of the form
  // instead of being stuck mid/bottom of it.
  useEffect(() => {
    if (!selectedSeva) return;
    const t = window.setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    }, 250);
    return () => window.clearTimeout(t);
  }, [selectedSeva, reduce]);

  const fade = (delay = 0) =>
    reduce ? {} : { initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.7, delay } };

  return (
    <PageLayout>
      <WhatsAppFloatButton />

      {/* ── HERO BANNER ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0c1a2e] pt-20 md:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(26,140,170,0.12),transparent)]" aria-hidden />

        <div className="relative">
          {banners.map((banner, index) => (
            <a
              key={banner.desktop + index}
              href={banner.linkUrl || "#restrictions"}
              tabIndex={index === activeSlide ? 0 : -1}
              className={`block transition-opacity duration-1000 ease-in-out ${
                index === activeSlide ? "relative opacity-100" : "absolute inset-0 opacity-0"
              }`}
              aria-hidden={index !== activeSlide}
            >
              <picture>
                <source media="(max-width: 640px)" srcSet={banner.mobile} />
                <img src={banner.desktop} alt={banner.alt} className="h-auto w-full" />
              </picture>
            </a>
          ))}

          {banners.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => moveSlide(-1)}
                className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white md:flex"
                aria-label="Previous banner"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => moveSlide(1)}
                className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white/80 backdrop-blur-md transition-all hover:bg-black/50 hover:text-white md:flex"
                aria-label="Next banner"
              >
                <ArrowRight className="h-5 w-5" />
              </button>
              <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2.5">
                {banners.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveSlide(i)}
                    aria-label={`Go to banner ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-500 ${
                      i === activeSlide ? "w-8 bg-[#e8b54a]" : "w-2 bg-white/30 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Date strip */}
        <div className="border-t border-[#e8b54a]/15 bg-[#0c1a2e]/90 backdrop-blur-sm">
          <div className="container mx-auto flex flex-wrap items-center justify-center gap-x-10 gap-y-3 px-4 py-5 text-center">
            <p className="text-sm font-medium text-white/90 md:text-base">
              <span className="font-semibold text-[#e8b54a]">July 29, 2026</span>
              <span className="mx-4 text-white/20">&mdash;</span>
              <span className="font-semibold text-[#e8b54a]">November 24, 2026</span>
              <span className="ml-3 text-[10px] font-normal uppercase tracking-[0.2em] text-white/50">Utthana Ekadashi</span>
            </p>
            <div className="hidden h-5 w-px bg-white/10 md:block" aria-hidden />
            <p className="text-xs text-white/40">
              Alternate panchang: July 25 – November 20, 2026
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-gradient-to-b from-[#0c1a2e] to-[#0c1a2e]">
          <div className="container mx-auto grid grid-cols-2 md:grid-cols-4">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`flex flex-col items-center px-4 py-7 text-center ${
                  i < stats.length - 1 ? "border-r border-[#e8b54a]/8" : ""
                }`}
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-[#e8b54a]/10">
                  <s.icon className="h-4.5 w-4.5 text-[#e8b54a]" />
                </div>
                <span className="font-serif-display text-xl font-bold text-[#e8b54a] md:text-2xl">{s.value}</span>
                <span className="mt-1 text-[11px] font-semibold uppercase tracking-wider text-white/80">{s.label}</span>
                <span className="mt-0.5 text-[10px] text-white/40">{s.sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT IS CHATURMAS ────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f5f7fa] py-20 md:py-28" ref={ref1}>
        <div className="pointer-events-none absolute right-0 top-0 h-[500px] w-[500px] rounded-full bg-[#e8b54a]/5 blur-[120px]" aria-hidden />
        <div className="container mx-auto px-4">
          <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, x: -30 }}
              animate={inView1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <div className="mb-6 flex items-center gap-3">
                <span className="h-px w-8 bg-[#c4903a]" />
                <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c4903a]">Understanding Chaturmas</span>
              </div>
              <h2 className="font-serif-display text-4xl font-bold leading-tight text-[#0f1d35] md:text-5xl">
                The Four Sacred Months
              </h2>
              <div className="mt-8 space-y-4">
                <p className="text-base leading-relaxed text-[#3d4f6a]">
                  The four sacred months of the year, starting from the Hindu month of Ashadha (June–July) up to the
                  month of Kartika (October–November), are known as <strong>Chaturmas</strong>, literally meaning &ldquo;four months.&rdquo;
                </p>
                <p className="text-base leading-relaxed text-[#3d4f6a]">
                  It is observed by Vaishnavas in the rainy season by performing the Chaturmasya Vrat and intensive
                  devotional service, according to either the lunar or the solar calendar months.
                </p>
                <p className="text-base leading-relaxed text-[#3d4f6a]">
                  Performing devotional services, austerities, simplicity and vratas during these most beneficial months
                  results in the immense favor of the Supreme Lord Sri Krishna.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="rounded-2xl border border-[#e8b54a]/30 bg-white px-5 py-4 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4903a]">Begins</p>
                  <p className="font-serif-display mt-1 text-lg font-bold text-[#0f1d35]">July 29, 2026</p>
                </div>
                <div className="rounded-2xl border border-[#e8b54a]/30 bg-white px-5 py-4 text-center shadow-sm">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4903a]">Ends</p>
                  <p className="font-serif-display mt-1 text-lg font-bold text-[#0f1d35]">Nov 24, 2026</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={reduce ? undefined : { opacity: 0, x: 30 }}
              animate={inView1 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="relative"
            >
              <div className="absolute -inset-3 rounded-[2rem] bg-gradient-to-br from-[#e8b54a]/20 via-[#1a8caa]/10 to-transparent -rotate-2" />
              <Image
                src="https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786540947761-1786540947567-chaturmas-2026-start-and-end-date.jpg"
                alt="Chaturmas 2026 start and end dates"
                width={600}
                height={440}
                className="relative rounded-2xl shadow-elevated w-full object-cover"
              />
              <div className="absolute -bottom-5 -right-3 md:-right-5 rounded-2xl border border-[#e8b54a]/30 bg-white px-6 py-4 shadow-lg text-center">
                <p className="font-serif-display text-3xl font-bold text-[#c4903a]">120+</p>
                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[#3d4f6a]">Days of Devotion</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── DONATE ───────────────────────────────────────────────── */}
      <section
        id="donate-section"
        className="relative overflow-hidden bg-white py-14 md:py-20 dark:bg-background"
        ref={ref6}
      >
        <div className="pointer-events-none absolute -top-32 left-1/2 h-80 w-[640px] -translate-x-1/2 rounded-full bg-[#e8b54a]/8 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute bottom-0 left-1/2 h-64 w-[480px] -translate-x-1/2 rounded-full bg-[#1a8caa]/5 blur-[120px]" aria-hidden />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 30 }}
            animate={inView6 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-10"
          >
            <div className="mb-4 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#c4903a]/40" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">Support the Temple</span>
              <span className="h-px w-8 bg-[#c4903a]/40" />
            </div>
            <Ornament className="mx-auto mb-5" />
            <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl mb-4">
              Offer a Seva During Chaturmas
            </h2>
            <p className="mx-auto max-w-xl text-base text-muted-foreground">
              Every charity performed in these holy months yields manifold benefits. Support the ongoing worship,
              prasadam distribution and cow protection at HKM Vizag.
            </p>
          </motion.div>

          {/* Donate card — highlighted CTA panel: button on top, trust badges below */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            animate={inView6 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mx-auto max-w-3xl"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-gold/25 bg-white/85 p-8 shadow-[0_28px_90px_hsl(42,92%,46%,0.14)] backdrop-blur-sm sm:p-10 dark:bg-background/85">
              <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[hsl(42,92%,56%,0.12)] blur-3xl" aria-hidden />

              {/* CTA button — the hero of the section */}
              <div className="relative text-center">
                <button
                  onClick={() => setSevaPickerOpen((o) => !o)}
                  className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-gold px-10 py-4 text-lg font-bold text-[hsl(220,60%,12%)] shadow-[0_10px_32px_hsl(42,92%,46%,0.45)] transition-all duration-300 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-[0_16px_44px_hsl(42,92%,46%,0.55)] active:scale-95 md:px-12 md:py-5"
                >
                  <span className="pointer-events-none absolute -inset-2 -z-10 animate-pulse rounded-full bg-[hsl(42,92%,56%,0.4)] blur-xl" aria-hidden />
                  <Sparkles className="h-5 w-5 md:h-6 md:w-6" />
                  {selectedSeva ? "Choose Another Seva" : "Donate Now"}
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${sevaPickerOpen ? "rotate-180" : ""}`} />
                </button>
                <p className="mt-4 text-sm text-muted-foreground">
                  {selectedSeva
                    ? "Pick another seva below — or keep your current selection."
                    : "Choose a seva below, then pick your offering amount."}
                </p>
              </div>
            </div>
          </motion.div>

          <AnimatePresence>
            {sevaPickerOpen && (
              <motion.div
                ref={pickerRef}
                initial={reduce ? undefined : { opacity: 0, height: 0, y: -8 }}
                animate={reduce ? undefined : { opacity: 1, height: "auto", y: 0 }}
                exit={reduce ? undefined : { opacity: 0, height: 0, y: -8 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="scroll-mt-28 overflow-hidden"
              >
                <div className="mx-auto mt-10 max-w-6xl">
                  {/* Step indicator */}
                  <div className="mb-8 flex items-center justify-center gap-3 sm:gap-5">
                    {[
                      { n: 1, label: "Choose Seva" },
                      { n: 2, label: "Choose Amount" },
                    ].map((s, idx) => {
                      const active = selectedSeva ? 2 : 1;
                      const done = active > s.n;
                      const current = active === s.n;
                      return (
                        <div key={s.n} className="flex items-center gap-3">
                          {idx > 0 && (
                            <span className={`h-px w-8 sm:w-14 ${current ? "bg-gold/60" : "bg-border"}`} />
                          )}
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
                                done || current
                                  ? "bg-gradient-gold text-[hsl(220,90%,12%)] shadow-gold"
                                  : "border border-border text-muted-foreground"
                              } ${current ? "ring-4 ring-gold/15" : ""}`}
                            >
                              {done ? <Check className="h-4 w-4" /> : s.n}
                            </span>
                            <span
                              className={`hidden text-[11px] font-semibold uppercase tracking-[0.18em] sm:block ${
                                current ? "text-gold" : done ? "text-primary" : "text-muted-foreground/60"
                              }`}
                            >
                              {s.label}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {!selectedSeva ? (
                    /* ── Step 1 · choose a seva ── */
                    <>
                      <div className="mb-7 text-center">
                        <h3 className="font-heading text-2xl font-bold text-primary md:text-3xl">Choose Your Seva</h3>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                          Every seva performed during Chaturmas yields manifold blessings — pick one below and complete
                          your offering.
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center justify-center gap-3">
                        {sevas.map((seva, i) => (
                          <motion.button
                            key={seva.slug}
                            onClick={() => setSelectedSeva(seva)}
                            initial={reduce ? undefined : { opacity: 0, y: 12 }}
                            animate={reduce ? undefined : { opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.05 * i }}
                            whileHover={{ y: -2 }}
                            whileTap={{ scale: 0.97 }}
                            className="group inline-flex items-center gap-2 rounded-full border border-border bg-card px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-gold/60 hover:bg-[hsl(42,92%,56%,0.08)] hover:text-gold hover:shadow-warm"
                          >
                            <span className="text-base leading-none">{seva.icon}</span>
                            {seva.shortTitle}
                            <ArrowRight className="h-3.5 w-3.5 text-gold opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                          </motion.button>
                        ))}
                      </div>
                    </>
                  ) : (
                    /* ── Step 2 · compact campaign-style donation form ── */
                    <>
                      <div className="mb-5 text-center">
                        <button
                          type="button"
                          onClick={() => setSelectedSeva(null)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-gold hover:text-gold"
                        >
                          <ArrowLeft className="h-3.5 w-3.5" /> Change Seva
                        </button>
                      </div>

                      {/* Compact two-column form — same style as the Square Foot campaign */}
                      <div ref={formRef} className="mx-auto w-full max-w-4xl scroll-mt-28">
                        <DonationForm
                          seva={selectedSeva}
                          sourcePage="chaturmas"
                          festivalSlug="chaturmas"
                          thankYouType="seva"
                          thankYouSource="the Chaturmas seva programme"
                          trackContentName="Chaturmas"
                          variant="grid"
                        />
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Trust badges — reassurance below the seva options */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            animate={inView6 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mx-auto mt-12 max-w-3xl"
          >
            <div className="flex items-center gap-4" aria-hidden>
              <span className="h-px flex-1 bg-gold/25" />
              <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gold/70">
                Payment made safe &amp; simple
              </span>
              <span className="h-px flex-1 bg-gold/25" />
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              {trustBadges.map((b) => (
                <span
                  key={b.label}
                  className="inline-flex items-center gap-2 rounded-full border border-gold/25 bg-[hsl(42,92%,56%,0.08)] px-4 py-2 text-xs font-semibold text-primary transition-colors hover:bg-[hsl(42,92%,56%,0.15)] md:text-sm"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gold/15 text-gold">
                    <b.icon className="h-3.5 w-3.5" />
                  </span>
                  {b.label}
                </span>
              ))}
            </div>
          </motion.div>

          <p className="mt-10 text-center text-xs text-muted-foreground">
            80G Tax Exemption available · Secured by Razorpay · Donations go to Hare Krishna Movement India, Visakhapatnam
          </p>
        </div>
      </section>

      {/* ── IMPORTANCE ──────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, hsl(220,70%,12%) 0%, hsl(220,60%,18%) 40%, hsl(200,55%,22%) 100%)" }}
        ref={ref2}
      >
        {!reduce && (
          <motion.div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            aria-hidden
            style={{
              background: "radial-gradient(ellipse at 30% 50%, #e8b54a, transparent 50%)",
            }}
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 30 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#e8b54a]/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e8b54a]/80">Why It Matters</span>
              <span className="h-px w-8 bg-[#e8b54a]/50" />
            </div>
            <h2 className="font-serif-display text-4xl font-bold text-white md:text-5xl">Importance of Chaturmas</h2>
          </motion.div>

          {/* Featured scripture quote */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            animate={inView2 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.05 }}
            className="mx-auto mb-12 max-w-4xl"
          >
            <div className="relative rounded-3xl border border-[#e8b54a]/15 bg-white/[0.04] p-10 text-center backdrop-blur-sm md:p-14">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e8b54a]/20 ring-1 ring-[#e8b54a]/30">
                  <Quote className="h-4 w-4 text-[#e8b54a]" />
                </div>
              </div>
              <p className="font-serif-display text-xl font-medium italic leading-relaxed text-[#e8b54a]/90 md:text-2xl">
                &ldquo;One who passes the Chaturmasya season without observing religious vows, austerities and chanting
                of japa, such a fool, although living, should be considered to be a dead man.&rdquo;
              </p>
              <div className="mt-8 flex items-center justify-center gap-3">
                <span className="h-px w-6 bg-[#e8b54a]/30" />
                <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#e8b54a]/60">
                  Bhavishya Purana
                </p>
                <span className="h-px w-6 bg-[#e8b54a]/30" />
              </div>
            </div>
          </motion.div>

          <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 20 }}
              animate={inView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8b54a]/10 ring-1 ring-[#e8b54a]/20">
                  <Quote className="h-5 w-5 text-[#e8b54a]" />
                </div>
                <h3 className="font-serif-display text-lg font-bold text-white">Manifold Benefits</h3>
              </div>
              <p className="text-white/70 leading-relaxed italic">
                &ldquo;There is a 4-month period in a year known as Chaturmasya wherein any Dana, Vrata, Japa and Homa
                performed brings forth countless merits — yielding multifold benefits.&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-2">
                <span className="h-px w-4 bg-[#e8b54a]/30" />
                <p className="text-[10px] uppercase tracking-[0.25em] text-[#e8b54a]/60 font-semibold">
                  Lord Varaha to Bhu Devi
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 20 }}
              animate={inView2 ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.18 }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-8 backdrop-blur-sm"
            >
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e8b54a]/10 ring-1 ring-[#e8b54a]/20">
                  <Moon className="h-5 w-5 text-[#e8b54a]" />
                </div>
                <h3 className="font-serif-display text-lg font-bold text-white">The Lord&apos;s Yoga-nidra</h3>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">
                The sun travels in the southern hemisphere, and Lord Narayana and all the demigods go to sleep during
                these four months — yoga-nidra, a manifestation of His internal potency. Therefore it is prohibited to
                perform materially pious work (marriages, Bhoomi Pujan, Grah Pravesh, etc.). One should instead perform
                more and more spiritual activities to receive His blessings.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── FOOD RESTRICTIONS ───────────────────────────────────── */}
      <section id="restrictions" className="relative overflow-hidden bg-[#f5f7fa] py-20 md:py-28" ref={ref3}>
        <div className="pointer-events-none absolute left-0 top-1/2 h-[400px] w-[400px] -translate-y-1/2 rounded-full bg-[#1a8caa]/5 blur-[120px]" aria-hidden />
        <div className="container mx-auto px-4">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 30 }}
            animate={inView3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-14"
          >
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#c4903a]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c4903a]">The Chaturmas Vrat</span>
              <span className="h-px w-8 bg-[#c4903a]" />
            </div>
            <h2 className="font-serif-display text-4xl font-bold text-[#0f1d35] md:text-5xl">Food Restrictions</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-[#3d4f6a]/80">
              During each month of Chaturmas, devotees restrict themselves from certain food items.
              These restrictions are aimed solely at performing austerity and pleasing Lord Krishna.
            </p>
          </motion.div>

          {/* Restriction cards */}
          <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2">
            {restrictionMonths.map((m, i) => (
              <motion.div
                key={m.month}
                initial={reduce ? undefined : { opacity: 0, y: 20 }}
                animate={inView3 ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.08 * i }}
                className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:shadow-lg ${m.border}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${m.color} opacity-0 transition-opacity group-hover:opacity-100`} />
                <div className="relative p-6 md:p-7">
                  {/* Month header */}
                  <div className="mb-5 flex items-center gap-3">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f5f7fa] text-2xl shadow-sm ring-1 ring-black/5">
                      {m.emoji}
                    </span>
                    <div>
                      <span className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${m.badge}`}>
                        {m.month}
                      </span>
                      <h3 className="mt-1 font-serif-display text-lg font-bold text-[#0f1d35]">{m.title}</h3>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Avoid */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-red-500/70">Avoid</p>
                      <ul className="space-y-1.5">
                        {m.avoid.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-[#3d4f6a]">
                            <X className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* Permitted */}
                    <div>
                      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-600/70">Permitted</p>
                      <ul className="space-y-1.5">
                        {m.permitted.map((item) => (
                          <li key={item} className="flex items-start gap-2 text-sm text-[#3d4f6a]">
                            <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Global note */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24 }}
            animate={inView3 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mx-auto mt-8 max-w-6xl"
          >
            <div className="flex flex-col items-center gap-6 rounded-2xl p-8 md:flex-row md:p-10"
              style={{ background: "linear-gradient(135deg, hsl(220,70%,12%) 0%, hsl(220,60%,18%) 40%, hsl(200,55%,22%) 100%)" }}
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-dashed border-[#e8b54a]/30 bg-[#e8b54a]/10">
                <ScrollText className="h-8 w-8 text-[#e8b54a]" />
              </div>
              <div className="text-center md:text-left">
                <h3 className="font-serif-display text-xl font-bold text-white">A Note for All Four Months</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60 md:text-base">
                  Throughout Chaturmas, avoid eating any <span className="font-semibold text-[#e8b54a]">non-vegetarian food</span>,{" "}
                  <span className="font-semibold text-[#e8b54a]">onion</span> and <span className="font-semibold text-[#e8b54a]">garlic</span>.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── RULES & OBSERVANCE ──────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#0c1a2e] py-20 md:py-28" ref={ref4}>
        <div className="pointer-events-none absolute -bottom-24 left-0 h-80 w-80 rounded-full bg-[#1a4060]/20 blur-[120px]" aria-hidden />
        <div className="pointer-events-none absolute top-0 right-0 h-72 w-72 rounded-full bg-[#1a8caa]/10 blur-[120px]" aria-hidden />
        <div className="relative container mx-auto px-4">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 30 }}
            animate={inView4 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#e8b54a]/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e8b54a]/80">How to Observe</span>
              <span className="h-px w-8 bg-[#e8b54a]/50" />
            </div>
            <h2 className="font-serif-display text-4xl font-bold text-white md:text-5xl">Rules of Chaturmas</h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/50">
              Anyone can easily observe Chaturmas by following these simple primary and secondary rules.
            </p>
          </motion.div>

          {/* Primary rules */}
          <div className="mx-auto mb-16 max-w-5xl">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-[#e8b54a]/20 bg-[#e8b54a]/5 px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-[#e8b54a]">
                <Sparkles className="h-3.5 w-3.5" /> Primary Rules
              </span>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {primaryRules.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={reduce ? undefined : { opacity: 0, y: 20 }}
                  animate={inView4 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.12 * i }}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 transition-all duration-500 hover:-translate-y-1 hover:border-[#e8b54a]/20 hover:bg-white/[0.06]"
                >
                  <span className="absolute -right-4 -top-6 font-serif-display text-[80px] font-bold text-[#e8b54a]/[0.04] select-none" aria-hidden>
                    0{i + 1}
                  </span>
                  <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e8b54a]/20 to-[#e8b54a]/5 ring-1 ring-[#e8b54a]/20">
                    <r.icon className="h-6 w-6 text-[#e8b54a]" />
                  </div>
                  <h3 className="font-serif-display text-base font-bold text-white mb-3">{r.title}</h3>
                  <p className="text-sm leading-relaxed text-white/50">{r.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Secondary rules */}
          <div className="mx-auto max-w-5xl">
            <div className="mb-8 text-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/50">
                <Heart className="h-3.5 w-3.5 text-[#e8b54a]" /> Secondary Rules
              </span>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {secondaryRules.map((r, i) => (
                <motion.div
                  key={r.title}
                  initial={reduce ? undefined : { opacity: 0, y: 20 }}
                  animate={inView4 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 + 0.08 * i }}
                  className="group rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 transition-all duration-500 hover:-translate-y-1 hover:border-[#e8b54a]/20 hover:bg-white/[0.05]"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/[0.06] transition-colors group-hover:bg-[#e8b54a]/15">
                    <r.icon className="h-5 w-5 text-[#e8b54a]" />
                  </div>
                  <h4 className="font-serif-display text-sm font-bold text-white mb-2">{r.title}</h4>
                  <p className="text-xs leading-relaxed text-white/40">{r.desc}</p>
                </motion.div>
              ))}
            </div>
            <p className="mt-12 text-center text-sm italic text-white/30">
              As far as possible, one should try to stay at some holy place (pilgrimage) during the period of Chaturmas.
            </p>
          </div>
        </div>
      </section>

      {/* ── BENEFITS ────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f5f7fa] py-20 md:py-28" ref={ref5}>
        <div className="pointer-events-none absolute right-0 bottom-0 h-[400px] w-[400px] rounded-full bg-[#e8b54a]/5 blur-[120px]" aria-hidden />
        <div className="container mx-auto px-4">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 30 }}
            animate={inView5 ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-14"
          >
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#c4903a]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c4903a]">The Fruit of Austerity</span>
              <span className="h-px w-8 bg-[#c4903a]" />
            </div>
            <h2 className="font-serif-display text-4xl font-bold text-[#0f1d35] md:text-5xl">Benefits of Chaturmas Vrat</h2>
          </motion.div>
          <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
            <div className="space-y-5">
              {benefits.map((b, i) => (
                <motion.div
                  key={b.title}
                  initial={reduce ? undefined : { opacity: 0, y: 20 }}
                  animate={inView5 ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * i }}
                  className="flex gap-5 rounded-2xl border border-[#e8b54a]/20 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-md hover:border-[#e8b54a]/40"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e8b54a]/20 to-[#c4903a]/10">
                    <b.icon className="h-5 w-5 text-[#c4903a]" />
                  </div>
                  <div>
                    <h3 className="font-serif-display font-bold text-[#0f1d35] mb-1.5">{b.title}</h3>
                    <p className="text-sm text-[#3d4f6a]/80 leading-relaxed">{b.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={reduce ? undefined : { opacity: 0, x: 30 }}
              animate={inView5 ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 }}
              className="space-y-6"
            >
              <Image
                src="https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786540909689-1786540908653-benefits-of-chaturmas-vrat.webp"
                alt="Benefits of Chaturmas Vrat"
                width={600}
                height={460}
                className="w-full rounded-2xl border border-[#e8b54a]/20 object-cover shadow-lg"
              />
              <div className="relative rounded-2xl border border-[#e8b54a]/20 bg-white p-7 shadow-sm">
                <div className="absolute -top-3 left-6">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8b54a]/20">
                    <Quote className="h-3 w-3 text-[#c4903a]" />
                  </div>
                </div>
                <p className="text-sm leading-relaxed text-[#3d4f6a] italic mt-1">
                  <em>apama somam amrta abhuma</em> and{" "}
                  <em>akshayyam ha vai caturmasya-yajinah sukrtam bhavati</em> — those who perform the four-month
                  penances become eligible to drink the soma-rasa beverages to become immortal and happy forever.
                  (Bhagavad-gita 2.42)
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── HISTORICAL EVENTS ───────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-28"
        style={{ background: "linear-gradient(135deg, hsl(220,70%,12%) 0%, hsl(220,60%,18%) 40%, hsl(200,55%,22%) 100%)" }}
      >
        <div className="pointer-events-none absolute -top-20 right-0 h-80 w-80 rounded-full bg-[#e8b54a]/5 blur-[120px]" aria-hidden />
        <div className="relative container mx-auto px-4">
          <div className="text-center mb-16">
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#e8b54a]/50" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#e8b54a]/80">Revealed Scripture</span>
              <span className="h-px w-8 bg-[#e8b54a]/50" />
            </div>
            <h2 className="font-serif-display text-4xl font-bold text-white md:text-5xl">
              Significant Events During Chaturmas
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-base text-white/45">
              The auspicious Chaturmas period marks multiple historical events mentioned in the revealed scriptures.
            </p>
          </div>
          <div className="mx-auto max-w-4xl">
            {historyEvents.map((ev, i) => (
              <motion.div
                key={ev.title}
                initial={reduce ? undefined : { opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: 0.06 * i }}
                className="relative flex gap-5 pb-8 last:pb-0"
              >
                {i < historyEvents.length - 1 && (
                  <span className="absolute left-[19px] top-12 bottom-0 w-px bg-gradient-to-b from-[#e8b54a]/20 to-transparent" aria-hidden />
                )}
                <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e8b54a]/10 ring-1 ring-[#e8b54a]/20">
                  <span className="font-serif-display text-sm font-bold text-[#e8b54a]">{i + 1}</span>
                </div>
                <div className="flex-1 rounded-2xl border border-white/[0.06] bg-white/[0.03] p-7 backdrop-blur-sm transition-colors hover:border-[#e8b54a]/15 hover:bg-white/[0.05]">
                  <h3 className="font-serif-display text-base font-bold text-[#e8b54a] mb-3">{ev.title}</h3>
                  <p className="text-sm leading-relaxed text-white/55">{ev.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── JOIN WHATSAPP CHANNEL ─────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f5f7fa] py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#075e54] to-[#128c7e] p-8 md:p-12 shadow-lg">
              <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" aria-hidden />
              <div className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-[#25D366]/20 blur-xl" aria-hidden />
              <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                  <svg viewBox="0 0 32 32" className="h-9 w-9 fill-white">
                    <path d="M16.001 3C9.096 3 3.5 8.596 3.5 15.5c0 2.42.69 4.68 1.887 6.6L3 29l7.09-2.35a12.42 12.42 0 0 0 5.91 1.5c6.905 0 12.5-5.596 12.5-12.5S22.906 3 16.001 3Zm0 22.688a10.15 10.15 0 0 1-5.176-1.42l-.371-.22-4.207 1.394 1.412-4.1-.242-.386a10.13 10.13 0 0 1-1.604-5.456c0-5.606 4.582-10.188 10.19-10.188 5.606 0 10.187 4.582 10.187 10.188 0 5.605-4.581 10.188-10.189 10.188Zm5.583-7.634c-.306-.153-1.81-.893-2.09-.994-.28-.102-.484-.153-.688.153-.204.306-.79.994-.968 1.198-.178.204-.357.23-.663.077-.306-.153-1.292-.476-2.462-1.518-.91-.812-1.525-1.815-1.703-2.121-.178-.306-.019-.472.134-.624.137-.137.306-.357.459-.535.153-.178.204-.306.306-.51.102-.204.051-.383-.026-.535-.077-.153-.688-1.658-.943-2.271-.248-.596-.5-.516-.688-.525-.178-.009-.382-.011-.586-.011-.204 0-.535.077-.815.383-.28.306-1.069 1.044-1.069 2.548 0 1.503 1.094 2.956 1.247 3.16.153.204 2.153 3.287 5.216 4.608.729.314 1.297.502 1.74.643.731.232 1.396.199 1.921.121.586-.088 1.81-.74 2.065-1.454.255-.714.255-1.325.178-1.454-.076-.128-.28-.204-.586-.357Z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white md:text-2xl">Join Our WhatsApp Channel</h3>
                  <p className="mt-2 text-sm text-white/75 md:text-base">
                    Get daily spiritual updates, Chaturmas reminders, festival schedules, and connect with fellow devotees.
                  </p>
                </div>
                <a
                  href={WA_CHANNEL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-bold text-[#075e54] shadow-lg transition-all hover:-translate-y-0.5 hover:shadow-xl"
                >
                  <Users className="h-4 w-4" />
                  Join Channel
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#f5f7fa] py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <div className="mb-6 flex items-center justify-center gap-3">
              <span className="h-px w-8 bg-[#c4903a]" />
              <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#c4903a]">Doubts Cleared</span>
              <span className="h-px w-8 bg-[#c4903a]" />
            </div>
            <h2 className="font-serif-display text-4xl font-bold text-[#0f1d35] md:text-5xl">
              Frequently Asked Questions
            </h2>
          </div>
          <div className="mx-auto max-w-3xl space-y-3">
            {faqs.map((f, i) => {
              const open = openFaq === i;
              return (
                <div
                  key={f.q}
                  className={`overflow-hidden rounded-2xl border transition-all duration-300 ${
                    open
                      ? "border-[#e8b54a]/40 bg-white shadow-md"
                      : "border-[#e8b54a]/15 bg-white/70 hover:border-[#e8b54a]/30"
                  }`}
                >
                  <button
                    onClick={() => setOpenFaq(open ? null : i)}
                    className="flex w-full items-center justify-between gap-4 px-7 py-6 text-left"
                    aria-expanded={open}
                  >
                    <span className="font-serif-display text-sm font-bold text-[#0f1d35] md:text-base">{f.q}</span>
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                        open
                          ? "rotate-180 bg-[#e8b54a]/15"
                          : "bg-[#e8b54a]/10"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4 text-[#c4903a]" />
                    </span>
                  </button>
                  <AnimatePresence>
                    {open && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                      >
                        <div className="px-7 pb-6">
                          <div className="h-px w-full bg-[#e8b54a]/10 mb-4" />
                          <p className="text-sm leading-relaxed text-[#3d4f6a]">{f.a}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CONCLUSION ───────────────────────────────────────────── */}
      <section className="relative overflow-hidden py-20 md:py-24"
        style={{ background: "linear-gradient(135deg, hsl(220,70%,12%) 0%, hsl(220,60%,18%) 40%, hsl(200,55%,22%) 100%)" }}
      >
        <div className="pointer-events-none absolute -top-24 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-[#e8b54a]/5 blur-[120px]" aria-hidden />
        <div className="relative container mx-auto px-4 text-center">
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mx-auto max-w-3xl"
          >
            <div className="mb-6 flex items-center justify-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e8b54a]/10 ring-1 ring-[#e8b54a]/20">
                <ScrollText className="h-7 w-7 text-[#e8b54a]" />
              </div>
            </div>
            <h2 className="font-serif-display text-3xl font-bold text-white md:text-4xl mb-6">
              Utilise These Holy Months
            </h2>
            <p className="text-white/60 leading-relaxed mb-4 text-base">
              Devotional activities performed during Chaturmas yield immense blessings of Lord Krishna. By reducing
              bodily necessities, staying in holy places and associating with great devotees, one should utilise this
              holy period of the year.
            </p>
            <p className="text-white/60 leading-relaxed mb-10 text-base">
              Perform more and more austerity, charity and devotional service during Chaturmas to purify one&apos;s
              existence and please Lord Sri Krishna.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="tel:+918977761187"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#e8b54a] to-[#c4903a] px-8 py-4 text-sm font-bold text-[#3b1605] shadow-[0_8px_24px_rgba(232,181,74,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(232,181,74,0.4)]"
              >
                <Phone className="h-4 w-4" />
                Call the Temple
              </a>
              <a
                href={WA_CHANNEL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-[#25D366]/40 bg-[#25D366]/10 px-8 py-4 text-sm font-semibold text-[#25D366] transition-all hover:-translate-y-0.5 hover:bg-[#25D366]/20"
              >
                <MessageCircle className="h-4 w-4" />
                Join WhatsApp Channel
              </a>
              <a
                href={MAPS_DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:bg-white/10"
              >
                <Navigation className="h-4 w-4" />
                Visit the Temple
              </a>
            </div>
          </motion.div>
        </div>
      </section>

    </PageLayout>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { HandHeart, Home, Scale, Sparkles } from "lucide-react";
import Ornament from "@/components/Ornament";

// Annadana at the hospitals — the section argues that giving food is the supreme
// offering, and showing it happening is more persuasive than another paragraph.
const ANNADANA_IMAGE =
  "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786100757954-1786100756855-annadan2.jpg";

// Banner palette — matches the campaign art (see PitruPakshaClient for the
// full token map). Dark band stays dark: deep saffron → burnt orange gradient
// with golden amber decor and warm ivory text.
const C = {
  deepGreen: "#59321F", // warm brown ink / gradient base
  emerald: "#C93F05", // deep burnt saffron
  teal: "#C95718", // warm terracotta
  gold: "#E9A62A", // golden amber
  softGold: "#FFF5D9", // warm ivory (text on dark)
  magenta: "#D24A0A", // burnt orange
  lightMint: "#FFF5D9", // warm ivory
} as const;

const WHY_DONATE = [
  {
    icon: HandHeart,
    title: "Reaches Ancestors Directly",
    text: "Offerings made this fortnight — food, water or charity — are said by scripture to reach the pitrs directly, bringing them peace.",
  },
  {
    icon: Scale,
    title: "Fulfils Pitr-Rna",
    text: "The debt owed to our ancestors (pitr-rna) is counted among the five great debts; seva during this period repays it with gratitude.",
  },
  {
    icon: Sparkles,
    title: "The Highest Purification",
    text: "Annadana performed with devotion purifies giver and receiver alike, transforming grief into grace for the entire family.",
  },
  {
    icon: Home,
    title: "Blessings Upon the Family",
    text: "Pleased ancestors bless their descendants with prosperity, progeny and peace — grace that returns to your home.",
  },
];

export default function PitruImportanceSection() {
  const reduce = useReducedMotion();

  const fade = (delay = 0) =>
    reduce
      ? undefined
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: "-80px" },
          transition: { duration: 0.6, delay, ease: "easeOut" as const },
        };

  return (
      <section
        className="relative overflow-hidden px-4 py-16 md:py-24"
        style={{
          background: `linear-gradient(135deg, ${C.gold} 0%, ${C.softGold} 48%, #FFFFFF 140%)`,
        }}
      >
      {/* Radially-placed golden glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% -8%, ${C.gold}33, transparent 65%), radial-gradient(ellipse 8% 40% at 95% 30%, ${C.gold}2d, transparent 65%)`,
        }}
      />
      {/* A faint woven texture. On a full-bleed gradient this is the difference
          between "a coloured panel" and "a surface" — barely perceptible on its
          own, but the section stops looking flat. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(45deg, ${C.gold} 0 1px, transparent 1px 14px)`,
        }}
      />
      {/* Soft sheen sweeping diagonally */}
      {!reduce && (
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            background: `linear-gradient(115deg, transparent 35%, ${C.gold} 50%, transparent 65%)`,
            backgroundSize: "220% 220%",
          }}
          animate={{ backgroundPosition: ["100% 100%", "0% 0%"] }}
          transition={{ duration: 9, repeat: Infinity, ease: "linear" }}
        />
      )}

      <div className="relative mx-auto max-w-6xl">
        {/* ── Header ── */}
        <motion.div {...fade(0)} className="mx-auto max-w-3xl text-center">
          <Ornament className="mx-auto mb-6" />
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em] md:text-sm"
            style={{ color: C.deepGreen }}
          >
            Importance of Pitru Paksha &amp; Why We Donate
          </p>
          <h2
            className="mt-4 text-3xl font-bold leading-tight md:text-5xl"
            style={{ color: C.deepGreen }}
          >
            The Sacred Fortnight of
            <span className="block" style={{ color: C.emerald }}>
              Remembering the Departed
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-[15px] leading-8 text-[#59321F]/85 md:text-lg">
            Pitru Paksha is the fortnight the scriptures set apart for one
            purpose alone — gratitude. Everything given with love in these
            sixteen days becomes an offering that reaches those who gave us life.
          </p>
        </motion.div>

        {/* ── Scripture band ──
            The shloka used to sit in the left column underneath a block of
            prose, where the most beautiful thing on the page was also the
            easiest to scroll past. Given the full width it becomes the
            section's centrepiece, and the two columns below it read as
            commentary on it rather than competing with it. */}
        <motion.figure
          {...fade(0.05)}
          className="relative mx-auto mt-12 max-w-4xl overflow-hidden rounded-3xl px-6 py-10 text-center md:mt-16 md:px-12 md:py-12"
          style={{
            background: `linear-gradient(135deg, ${C.gold}1f, rgba(255,255,255,0.05) 55%, ${C.gold}14)`,
            boxShadow: `inset 0 0 60px ${C.gold}12, 0 24px 60px -30px rgba(0,0,0,0.6)`,
            border: `1px solid ${C.gold}38`,
          }}
        >
          <span
            aria-hidden
            className="pointer-events-none absolute -left-10 -top-12 select-none font-serif text-[9rem] leading-none opacity-[0.10]"
            style={{ color: C.gold }}
          >
            ॐ
          </span>

          <blockquote
            className="relative font-serif text-xl leading-[2.1] md:text-[1.75rem] md:leading-[2]"
            style={{ color: C.deepGreen }}
          >
            अन्नदानं महादानं जलदानं ततः परम्।
            <br />
            सर्वेषामेव दानानां प्राणदानं विशिष्यते॥
          </blockquote>

          <div
            className="mx-auto my-6 h-px w-24"
            style={{ background: `linear-gradient(to right, transparent, ${C.gold}, transparent)` }}
            aria-hidden
          />

          <figcaption className="mx-auto max-w-2xl">
            <p className="text-[15px] italic leading-8 text-white/85 md:text-base">
              The gift of food is the greatest gift; the gift of water is greater
              still. Yet of all gifts, the gift of life is the supreme.
            </p>
            <p
              className="mt-3 text-xs font-bold uppercase tracking-[0.22em]"
              style={{ color: C.gold }}
            >
              — Garuḍa Purāṇa
            </p>
          </figcaption>
        </motion.figure>

        {/* ── Two-panel body ── */}
        <div className="mt-12 grid gap-8 lg:mt-16 lg:grid-cols-[0.95fr_1.05fr] lg:gap-12">
          {/* LEFT — Importance narrative */}
          <motion.div {...fade(0.1)} className="flex flex-col">
            <p
              className="text-xs font-bold uppercase tracking-[0.24em] md:text-sm"
              style={{ color: C.gold }}
            >
              The Importance
            </p>
            <h3
              className="mt-3 text-2xl font-bold leading-snug md:text-3xl"
              style={{ color: C.deepGreen }}
            >
              Honouring Those Who Came Before Us
            </h3>

            <div
            className="mt-5 space-y-5 border-l-2 border-l-[#E9A62A]/30 pl-5 text-[15px] leading-8 text-[#59321F]/85 md:pl-6 md:text-base"
            style={{ borderColor: `${C.gold}4d` }}
            >
              <p>
                During Pitru Paksha, the ancestors (pitrs) are said to descend
                near the mortal world to receive the offerings of their
                descendants. Through shraddha, tarpan and charity, the living
                fulfil the love they owe to those who shaped their lives.
              </p>
              <p>
                The scriptures praise giving during this period with singular
                emphasis — a handful of food offered to a deserving soul is said
                to carry more merit than grand gifts made at other times. It is a
                season where even the smallest seva becomes an act of deep
                reverence.
              </p>
            </div>

            {/* The column was pure prose against a 2×2 grid of cards, which
                left it feeling like the lesser half of the layout. */}
            <figure className="group relative mt-8 overflow-hidden rounded-3xl border" style={{ borderColor: `${C.gold}3d` }}>
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                <Image
                  src={ANNADANA_IMAGE}
                  alt="Annadana being served at ISKCON Kakinada"
                  fill
                  unoptimized
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.05]"
                />
                <div
                  aria-hidden
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(to top, #2A1608F0 0%, rgba(42,22,8,0.62) 40%, transparent 78%)`,
                  }}
                />
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 p-5 md:p-6">
                <p
                  className="text-[10px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: C.softGold }}
                >
                  Annadana at the Hospitals
                </p>
                <p className="mt-1.5 text-sm leading-6 text-white/90">
                  Through the fortnight, every offering is cooked, sanctified and
                  served in your ancestors&apos; name.
                </p>
              </figcaption>
            </figure>
          </motion.div>

          {/* RIGHT — Why donate cards */}
          <motion.div {...fade(0.15)} className="flex flex-col">
            <p
              className="text-xs font-bold uppercase tracking-[0.24em] md:text-sm"
              style={{ color: C.deepGreen }}
            >
              Why Donate
            </p>
            <h3
              className="mt-3 text-2xl font-bold leading-snug md:text-3xl"
              style={{ color: C.deepGreen }}
            >
              Four Reasons to Offer Seva
            </h3>

            {/* Hover styling moved from inline onMouseEnter/onMouseLeave
                handlers into CSS. The handlers overwrote element.style
                directly, which both fought the declared transition and meant
                a card left mid-hover (touch, or the pointer leaving the
                window) could stay stuck in its hovered state. */}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {WHY_DONATE.map(({ icon: Icon, title, text }, i) => (
                <div
                  key={title}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-white/[0.14] bg-white/[0.06] px-5 py-6 backdrop-blur transition-all duration-300 hover:-translate-y-1 hover:border-[rgba(233,166,42,0.8)] hover:bg-white/[0.1] hover:shadow-[0_18px_40px_-22px_rgba(0,0,0,0.8)]"
                >
                  <span
                    aria-hidden
                    className="absolute right-4 top-3 font-serif text-3xl font-bold leading-none opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                    style={{ color: C.gold }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <span
                    className="flex h-12 w-12 items-center justify-center rounded-full transition-shadow duration-300 group-hover:shadow-lg"
                    style={{
                      background: `${C.gold}22`,
                      boxShadow: `inset 0 0 0 1px ${C.gold}66`,
                    }}
                  >
                    <Icon className="h-5 w-5" style={{ color: C.gold }} />
                  </span>

                  <h4
                    className="mt-4 text-base font-bold leading-snug"
                    style={{ color: C.deepGreen }}
                  >
                    {title}
                  </h4>
                  {/* Was 13px at white/78 — small and dim enough on this
                      gradient to be genuinely hard work to read. */}
                  <p className="mt-2 text-sm leading-7 text-[#59321F]/85">{text}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── CTA ── */}
        <motion.div {...fade(0.2)} className="mt-14 text-center lg:mt-16">
          <Link
            href="#offer-seva"
            className="inline-flex items-center gap-2 rounded-full px-9 py-4 text-sm font-bold uppercase tracking-[0.08em] shadow-lg transition-transform duration-300 hover:scale-[1.03]"
            style={{
              background: "#D83B05",
              color: "#FFFFFF",
              boxShadow: `0 10px 30px -10px rgba(216,59,5,0.75)`,
            }}
          >
            Offer Your Seva This Pitru Paksha
            <span aria-hidden>→</span>
          </Link>
          <p className="mx-auto mt-4 max-w-md text-xs leading-6 text-white/65">
            Every offering, however small, is received with the same devotion at
            the temple altar.
          </p>
        </motion.div>
      </div>
    </section>
  );
}

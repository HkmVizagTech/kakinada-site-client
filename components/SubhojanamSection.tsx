"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check } from "lucide-react";

const benefits = [
  "Support daily prasadam seva",
  "Offer meals with devotion",
  "80G tax benefits",
  "Monthly seva participation",
];

const impact = [
  { value: "2 Lakh+", label: "Meals Every Day" },
  { value: "₹25", label: "Feeds One Person" },
  { value: "80G", label: "Tax Exemption" },
];

const SubhojanamSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative overflow-hidden py-12 md:py-16">
      {/* Full-bleed photo with navy scrim */}
      <Image
        src="/assets/home-subhojanam-banner.webp"
        alt="Subhojanam meal distribution"
        fill
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(100deg,hsl(220,85%,10%,0.94)_30%,hsl(220,85%,12%,0.72)_70%,hsl(220,85%,14%,0.5))]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
          >
            <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-[hsl(var(--gold))]">
              Subhojanam · Anna Daan
            </p>
            <h2 className="mb-5 font-heading text-3xl font-bold leading-[1.15] text-white md:text-5xl">
              No One Should Go{" "}
              <em className="font-serif-display italic text-[hsl(var(--gold))]">Hungry</em>{" "}
              Within Our Reach
            </h2>
            <p className="mb-8 max-w-xl leading-relaxed text-white/85">
              Through Subhojanam, we serve fresh, sanctified mid-day meals to school children and
              the underprivileged across Visakhapatnam — every single day. Your monthly support
              sustains this uninterrupted seva.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="mb-9 flex flex-wrap gap-x-10 gap-y-5"
          >
            {impact.map((s) => (
              <div key={s.label}>
                <b className="block text-3xl font-bold leading-none text-[hsl(var(--gold))] md:text-4xl">{s.value}</b>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-white/70">{s.label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="mb-9 grid max-w-md grid-cols-2 gap-3"
          >
            {benefits.map((b) => (
              <div key={b} className="flex items-center gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[hsl(42,92%,56%,0.25)]">
                  <Check className="h-3 w-3 text-[hsl(var(--gold))]" />
                </span>
                <span className="text-xs text-white/85 md:text-sm">{b}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            <Link
              href="/subhojanam"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-4 text-base font-bold text-[hsl(220,60%,12%)] shadow-gold transition-transform hover:-translate-y-0.5"
            >
              🍛 Sponsor Meals Today
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SubhojanamSection;

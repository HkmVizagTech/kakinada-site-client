"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Ornament from "@/components/Ornament";
import { sevas, getSevaHref } from "@/lib/sevaConfig";

const SevasSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const router = useRouter();
  const [selected, setSelected] = useState<Record<string, number>>(
    Object.fromEntries(sevas.map((s) => [s.slug, 0]))
  );

  const handleSponsor = (slug: string, tierIndex?: number) => {
    const seva = sevas.find((s) => s.slug === slug);
    if (!seva) return;
    const ti = tierIndex ?? selected[slug] ?? 0;
    const amount = seva.tiers[ti]?.amount;
    const hash = seva.externalHref ? "#donate" : "#donation-form";
    router.push(`${getSevaHref(seva)}?amount=${amount}${hash}`);
  };

  return (
    <section id="sevas" className="bg-white dark:bg-background py-12 md:py-16">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gold">Temple Sevas</p>
          <Ornament className="mb-5" />
          <h2 className="mb-6 font-heading text-3xl font-bold text-foreground md:text-5xl">
            Donate to Build the Temple
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Contribute to building the Hare Krishna Vaikuntham Temple, an upcoming cultural and spiritual
            center in Visakhapatnam. All donations qualify for 80G tax benefits.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-7 sm:grid-cols-2 lg:grid-cols-3">
          {sevas.map((seva, i) => (
            <motion.div
              key={seva.slug}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.08 }}
              className="group overflow-hidden rounded-3xl border border-border bg-card shadow-warm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-elevated"
            >
              <div className="relative aspect-[16/11] overflow-hidden">
                <Image
                  src={seva.image}
                  alt={seva.title}
                  fill
                  sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 92vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,85%,10%,0.78)] via-transparent to-transparent" />
                <h3 className="absolute bottom-4 left-5 font-heading text-xl font-bold text-white">
                  {seva.icon} {seva.title}
                </h3>
              </div>
              <div className="p-6">
                <div className="mb-4 grid grid-cols-2 gap-2.5">
                  {seva.tiers.map((tier, ti) => (
                    <button
                      key={tier.label}
                      type="button"
                      onClick={() => setSelected((s) => ({ ...s, [seva.slug]: ti }))}
                      className={`rounded-xl border-[1.5px] px-2.5 py-2.5 text-center text-[12.5px] font-semibold leading-tight transition-all ${
                        selected[seva.slug] === ti
                          ? "border-[hsl(var(--gold-deep))] bg-[hsl(42,92%,56%,0.15)] text-gold shadow-sm"
                          : "border-border text-foreground hover:border-[hsl(var(--gold-deep))] hover:bg-[hsl(42,92%,56%,0.05)]"
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
                <p className="mb-5 text-xs text-muted-foreground">{seva.tagline}</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSponsor(seva.slug)}
                  className="w-full rounded-full bg-gradient-gold py-3.5 text-[15px] font-bold text-[hsl(220,60%,12%)] shadow-gold transition-transform"
                >
                  Sponsor {seva.shortTitle}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SevasSection;

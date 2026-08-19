"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import { Heart, BookOpen, Users, Flower2 } from "lucide-react";
import Ornament from "@/components/Ornament";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

const DEFAULT_HEADING = "A Legacy of Devotion & Service";
const DEFAULT_BODY =
  "Following in the footsteps of our revered Founder-Acharya Srila Prabhupada, ISKCON Visakhapatnam — Hare Krishna Movement India (HKMI) — has been conducting spiritual, educational and cultural activities in Gambheeram since 2008, bringing about physical, emotional and spiritual well-being.";

const highlights = [
  { icon: Heart, title: "Spiritual Well-being", desc: "Programs for physical, emotional and spiritual growth" },
  { icon: BookOpen, title: "Vedic Wisdom", desc: "Insights from ancient scriptures for modern living" },
  { icon: Users, title: "Community Service", desc: "Feeding the needy and serving society with compassion" },
  { icon: Flower2, title: "Value Education", desc: "Inculcating values in children through engaging programs" },
];

const stats = [
  { value: "2008", label: "Serving Since" },
  { value: "2 Lakh+", label: "Meals Daily" },
  { value: "21+", label: "Festivals a Year" },
];

const AboutSection = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [customHeading, setCustomHeading] = useState("");
  const [customBody, setCustomBody] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/site-content`);
        if (res.ok) {
          const data = await res.json();
          setCustomHeading(data.content?.about?.heading || "");
          setCustomBody(data.content?.about?.body || "");
        }
      } catch {}
    })();
  }, []);

  return (
    <section id="about" className="py-12 md:py-16 bg-white dark:bg-background overflow-hidden">
      <div className="container mx-auto px-4" ref={ref}>
        {/* Welcome split — circular deity photo + copy */}
        <div className="mx-auto mb-24 grid max-w-5xl items-center gap-14 md:grid-cols-[1fr_1.15fr] md:gap-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={inView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.9 }}
            className="relative mx-auto w-full max-w-sm"
          >
            <div className="absolute -inset-4 rounded-full ring-gold-dashed animate-slow-spin" aria-hidden />
            <div className="relative aspect-square overflow-hidden rounded-full shadow-elevated">
              <Image
                src="/assets/home-gallery-radha-krishna.webp"
                alt="Sri Sri Radha Madan Mohan"
                fill
                sizes="(min-width: 768px) 400px, 90vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -right-2 bottom-[8%] rounded-2xl bg-card px-5 py-3.5 text-center shadow-elevated">
              <b className="block text-2xl font-bold leading-none text-primary">18+</b>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Years of Seva</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.15 }}
          >
            <Ornament className="mb-4 !justify-start" />
            {customHeading ? (
              <h2 className="mb-5 font-heading text-3xl font-bold leading-[1.14] text-foreground md:text-4xl lg:text-[2.6rem]">
                {customHeading}
              </h2>
            ) : (
              <h2 className="mb-5 font-heading text-3xl font-bold leading-[1.14] text-foreground md:text-4xl lg:text-[2.6rem]">
                Spreading{" "}
                <em className="font-serif-display font-semibold not-italic italic text-gold">
                  Krishna Consciousness
                </em>{" "}
                in the City of Destiny
              </h2>
            )}
            <p className="mb-4 leading-relaxed text-muted-foreground">
              {customBody || DEFAULT_BODY}
            </p>
            <blockquote className="my-6 rounded-r-2xl border-l-[3px] border-[hsl(var(--gold))] bg-[hsl(42,92%,56%,0.07)] px-5 py-4">
              <p className="font-serif-display italic text-foreground">
                &ldquo;If you want peace, then you must develop Krishna consciousness. This is the only way.&rdquo;
              </p>
              <cite className="mt-1.5 block text-[11px] font-semibold not-italic uppercase tracking-wider text-muted-foreground">
                — Srila Prabhupada
              </cite>
            </blockquote>
            <div className="grid grid-cols-3 gap-3">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="rounded-2xl border border-border bg-card px-3 py-4 text-center"
                >
                  <b className="block text-xl font-bold text-primary md:text-2xl">{s.value}</b>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mx-auto mb-14 max-w-3xl text-center"
        >
          <p className="text-muted-foreground leading-relaxed">
            The advancement of Science and Technology has come to drastically change the dynamics of life.
            HKMI digs deep into the ancient Vedic scriptures to derive insights that address the important
            questions and enigmas of life, bringing about alternative paradigms for better living.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item, i) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 30 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 + i * 0.1 }}
              className="group rounded-2xl border border-border bg-card p-8 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
            >
              <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-gradient-gold group-hover:text-[hsl(220,60%,12%)]">
                <item.icon className="h-7 w-7 text-primary transition-colors group-hover:text-[hsl(220,60%,12%)]" />
              </div>
              <h3 className="mb-2 font-heading text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AboutSection;

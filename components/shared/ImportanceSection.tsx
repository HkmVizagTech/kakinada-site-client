"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import Ornament from "@/components/Ornament";

export default function ImportanceSection() {
  return (
    <section className="bg-white dark:bg-background py-8 md:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Ornament className="mb-4" />
        <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Why it matters
          </p>
          <h2 className="mb-6 font-heading text-2xl font-bold text-primary md:text-3xl">
            The Importance of Seva
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 md:p-8"
        >
          <div className="flex items-start gap-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold/10 text-gold">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Every act of seva (selfless service) is an offering to the
                Supreme Lord. When you serve with love and devotion, the Lord
                reciprocates by purifying your heart and drawing you closer to
                Him. Seva is the essence of bhakti yoga — the path of loving
                devotion.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

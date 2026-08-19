"use client";

import { motion } from "framer-motion";
import Ornament from "@/components/Ornament";

export default function FounderSection() {
  return (
    <section className="bg-white dark:bg-background py-8 md:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Ornament className="mb-4" />
        <div className="text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            A message from
          </p>
          <h2 className="mb-6 font-heading text-2xl font-bold text-primary md:text-3xl">
            Our Founder
          </h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border bg-card p-6 md:p-8 text-center"
        >
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            &ldquo;The purpose of life is to love God, to love Krishna, to love
            God. Try to love God, try to love Krishna. That is the beginning of
            life perfection.&rdquo;
          </p>
          <p className="mt-4 text-xs font-semibold text-gold">
            — His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
          </p>
        </motion.div>
      </div>
    </section>
  );
}

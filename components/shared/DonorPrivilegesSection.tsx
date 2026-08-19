"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Gift, Award } from "lucide-react";
import Ornament from "@/components/Ornament";

export default function DonorPrivilegesSection({
  scrollToDonate,
}: {
  scrollToDonate?: () => void;
}) {
  const privileges = [
    {
      icon: Gift,
      title: "Prasadam",
      description:
        "Receive sanctified prasadam as a token of gratitude for your generous offering.",
    },
    {
      icon: Award,
      title: "Contribution Certificate",
      description:
        "Get a formal certificate acknowledging your seva contribution to the temple.",
    },
    {
      icon: ShieldCheck,
      title: "80G Tax Exemption",
      description:
        "Donations above ₹1,000 qualify for 80G tax exemption under the Income Tax Act.",
    },
  ];

  return (
    <section className="bg-white dark:bg-background py-8 md:py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Ornament className="mb-4" />
        <div className="mb-6 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
            Donor benefits
          </p>
          <h2 className="font-heading text-2xl font-bold text-primary md:text-3xl">
            Privileges for Donors
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {privileges.map((priv, i) => (
            <motion.div
              key={priv.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              className="rounded-2xl border border-border bg-card p-5 text-center"
            >
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-gold/10 text-gold">
                <priv.icon className="h-5 w-5" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-foreground">
                {priv.title}
              </h3>
              <p className="text-xs leading-relaxed text-muted-foreground">
                {priv.description}
              </p>
            </motion.div>
          ))}
        </div>

        {scrollToDonate && (
          <div className="mt-6 text-center">
            <button
              onClick={scrollToDonate}
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-bold text-[hsl(220,90%,12%)] shadow-gold transition-transform hover:-translate-y-0.5"
            >
              Donate Now
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

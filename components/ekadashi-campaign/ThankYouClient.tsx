"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { CheckCircle2, Home, Repeat, MessageCircle, FileText } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import Ornament from "@/components/Ornament";

const SHLOKA = {
  sanskrit: "दत्ते भक्त्या तद् गृह्णामि पश्य मे प्रियम् अर्जुन ।",
  translation:
    "If one offers Me with love and devotion a leaf, a flower, fruit, or water, I will accept it.",
  reference: "Bhagavad Gita 9.26",
};

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const seva = searchParams.get("seva") || "Ekadashi Seva";
  const amount = searchParams.get("amount");

  return (
    <PageLayout>
      <main className="bg-white dark:bg-background min-h-screen">
        <section className="flex min-h-[80vh] items-center justify-center px-4 py-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full max-w-lg text-center"
          >
            <Ornament className="mb-8" />

            {/* Success icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.2 }}
              className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/10"
            >
              <CheckCircle2 className="h-12 w-12 text-green-500" />
            </motion.div>

            {/* Heading */}
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mb-3 font-heading text-3xl font-bold text-primary md:text-4xl"
            >
              Thank You for Your Seva!
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mb-8 text-sm leading-relaxed text-muted-foreground md:text-base"
            >
              Your offering has been received with gratitude. May Lord Krishna bless you
              and your family throughout Chaturmas.
            </motion.p>

            {/* Donation summary card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                Donation Summary
              </p>
              <p className="mb-4 font-heading text-lg font-bold text-primary">{seva}</p>
              {amount && (
                <p className="mb-4 text-2xl font-extrabold text-gold">
                  ₹{Number(amount).toLocaleString("en-IN")}
                </p>
              )}
              <div className="flex flex-col gap-3 rounded-xl bg-background p-4 text-left text-xs text-muted-foreground">
                <div className="flex items-center gap-2.5">
                  <FileText className="h-4 w-4 shrink-0 text-gold" />
                  <span>A PDF receipt will be sent to your email and WhatsApp number shortly.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <MessageCircle className="h-4 w-4 shrink-0 text-green-500" />
                  <span>Your 80G tax exemption certificate (if applicable) will be processed separately.</span>
                </div>
              </div>
            </motion.div>

            {/* Shloka */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mb-8 rounded-2xl border border-gold/20 bg-gold/5 p-5 text-center"
            >
              <p className="mb-2 font-heading text-sm leading-relaxed text-primary md:text-base">
                {SHLOKA.sanskrit}
              </p>
              <p className="mb-1 text-xs italic leading-relaxed text-muted-foreground md:text-sm">
                &ldquo;{SHLOKA.translation}&rdquo;
              </p>
              <p className="text-[10px] font-semibold text-gold">— {SHLOKA.reference}</p>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center"
            >
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)] transition-transform hover:scale-[1.02]"
              >
                <Home className="h-4 w-4" />
                Back to Home
              </Link>
              <Link
                href="/shayani-ekadashi"
                className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-6 py-3 text-sm font-semibold text-gold transition-colors hover:bg-gold/10"
              >
                <Repeat className="h-4 w-4" />
                Donate Again
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </PageLayout>
  );
}

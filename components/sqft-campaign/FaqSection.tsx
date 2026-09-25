"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import Ornament from "@/components/Ornament";

interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  faqs: FaqItem[];
  tone?: "default" | "mint" | "blue" | "sand";
}

export default function FaqSection({ faqs, tone = "default" }: FaqSectionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const mint = tone === "mint";
  const blue = tone === "blue";
  const sand = tone === "sand";

  // FAQPage structured data — lets Google show these Q&As directly in
  // search results (the "People also ask"-style rich snippet), which
  // meaningfully improves click-through even without a ranking change.
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section
      className={
        mint || blue || sand
          ? "py-12 md:py-16"
          : "bg-white dark:bg-background py-12 md:py-16"
      }
      style={
        mint
          ? { background: "#F2FAF7" }
          : blue
            ? { background: "#F2F7FC" }
            : sand
              ? { background: "#FFF5D9" } // Pitru Paksha banner palette — warm ivory
              : undefined
      }
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <div className="container mx-auto max-w-3xl px-4">
        <Ornament className="mb-6" />
        <h2
          className={`mb-8 text-center font-heading text-2xl font-bold md:text-3xl ${
            mint
              ? "text-[#063D35]"
              : blue
                ? "text-[#0B2D4A]"
                : sand
                  ? "text-[#D24A0A]" // burnt orange headings
                  : "text-primary"
          }`}
        >
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div
              key={f.q}
              className={`overflow-hidden rounded-2xl border ${
                mint
                  ? "border-[#AEE4D2] bg-[#C9F3E8]"
                  : blue
                    ? "border-[#BFD2E6] bg-[#E6EDF6]"
                    : sand
                      ? "border-[#E9A62A] bg-[#FCE8B5]" // golden amber border, pale golden cream
                      : "border-border bg-card"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                aria-expanded={openFaq === i}
                className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
              >
                <span
                  className={`text-sm font-semibold md:text-base ${
                    mint
                      ? "text-[#063D35]"
                      : blue
                        ? "text-[#0B2D4A]"
                        : sand
                          ? "text-[#59321F]" // warm brown
                          : "text-foreground"
                  }`}
                >
                  {f.q}
                </span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-gold transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <p
                  className={`border-t px-5 py-4 text-sm leading-relaxed ${
                    mint
                      ? "border-[#AEE4D2] text-[#2C5B4E]"
                      : blue
                        ? "border-[#BFD2E6] text-[#2E4358]"
                        : sand
                          ? "border-[#E9A62A] text-[#59321F]"
                          : "border-border text-muted-foreground"
                  }`}
                >
                  {f.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

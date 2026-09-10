"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Heart, ShieldCheck, Sparkles,
  Gift, Award, Crown, ArrowRight,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import Ornament from "@/components/Ornament";
import TempleCarousel from "@/components/TempleCarousel";
import { sevas, getSevaHref, type Seva } from "@/lib/sevaConfig";

const PRIVILEGES = [
  { icon: Gift, title: "Prasadam at Home", desc: "Receive blessed prasadam delivered every month" },
  { icon: Sparkles, title: "Sankalpam Puja", desc: "Your name chanted in the temple's daily worship" },
  { icon: Award, title: "80G Tax Benefit", desc: "Government-recognized exemption certificate" },
  { icon: Crown, title: "Priority Access", desc: "VIP entry to special festivals and donor events" },
];

// The donation hub carousel shows each seva's own designed banner (same ones
// used at the top of the seva pages), linking through to the seva itself —
// instead of the home page hero banners.
const SEVA_SLIDES = [
  {
    src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785586948250-1785586945893-Gau-banner-desk.webp",
    mobileSrc: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785586947654-1785586945558-Gau-banner-mob.webp",
    title: "Gau Seva",
    linkUrl: "/gau-seva",
  },
  {
    src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785586501452-1785586500800-annadan-banner-desk.webp",
    mobileSrc: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785584926984-1785584925444-annadan-hero-mob.webp",
    title: "Anna Daan Seva",
    linkUrl: "/anna-daan-seva",
  },
  {
    src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785578235628-1785578235168-ChatGPTImageAug12026023314PM.webp",
    mobileSrc: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785578443691-1785578442854-ChatGPTImageAug12026032944PM.webp",
    title: "Gita Daan Seva",
    linkUrl: "/gita-daan-seva",
  },
  {
    src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785573838202-1785573837372-ChatGPTImageAug12026021301PM.webp",
    mobileSrc: "https://pub-a141ba4729a546b29a5015432b31bd23.r2.dev/media-library/1789026585499-1789026585358-kkdassq.jpg",
    title: "Vastra & Alankara Seva",
    linkUrl: "/alankara-vastra-seva",
  },

];

export default function DonateHubPage() {
  const [visibleSeva, setVisibleSeva] = useState<Seva | null>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  useEffect(() => {
    // Only run scroll detection on mobile — desktop uses hover
    const isMobile = () => window.innerWidth < 768;
    if (!isMobile()) return;

    const handleScroll = () => {
      if (!isMobile()) return;
      const viewportCenter = window.innerHeight / 2;
      let closestSlug: string | null = null;
      let closestDist = Infinity;

      cardRefs.current.forEach((el, slug) => {
        const rect = el.getBoundingClientRect();
        const cardCenter = rect.top + rect.height / 2;
        const dist = Math.abs(cardCenter - viewportCenter);
        if (rect.bottom > 0 && rect.top < window.innerHeight && dist < closestDist) {
          closestDist = dist;
          closestSlug = slug;
        }
      });

      if (closestSlug && closestDist < window.innerHeight * 0.35) {
        const seva = sevas.find((s) => s.slug === closestSlug);
        setVisibleSeva(seva || null);
      } else {
        setVisibleSeva(null);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <PageLayout>
      <main className="bg-white dark:bg-background">
        {/* ══ HERO — common to all donations, no seva-specific numbers ══ */}
        <section className="overflow-hidden pt-[88px] md:pt-[104px]">
          <TempleCarousel slides={SEVA_SLIDES} fetchApiBanners={false} />
        </section>

        {/* ══ OTHER SEVAS GRID ══ */}
        <section id="sevas" className="border-t border-border py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gold">More Ways to Serve</p>
              <Ornament className="mb-5" />
              <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-5xl">
                Choose Your Seva
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
                Beyond temple construction, there are many ways to serve — each one a form of devotion.
              </p>
            </div>

            <div className="mx-auto grid max-w-6xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {sevas.map((seva, index) => {
                return (
                  <motion.div
                    key={seva.slug}
                    ref={(el) => { if (el) cardRefs.current.set(seva.slug, el); }}
                    data-seva-slug={seva.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                  <Link
                    href={getSevaHref(seva)}
                    className="group relative block aspect-[3/2] overflow-hidden rounded-3xl border border-border shadow-warm transition-all duration-300 hover:-translate-y-2 hover:shadow-elevated"
                  >
                    {/* Poster fills entire card */}
                    <Image
                      src={seva.image}
                      alt={seva.title}
                      fill
                      sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 92vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    {/* Gradient overlay at bottom for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    {/* Seva name at bottom — shifts down and shrinks when donate button appears on mobile */}
                    <div className={`absolute left-0 right-0 transition-all duration-500 md:bottom-0 md:p-6 ${
                      visibleSeva?.slug === seva.slug
                        ? "bottom-2 px-6 pb-3 md:!bottom-0 md:!p-6"
                        : "bottom-0 p-6"
                    }`}>
                      <h3 className={`font-heading font-bold text-white drop-shadow-lg transition-all duration-500 md:text-2xl ${
                        visibleSeva?.slug === seva.slug
                          ? "text-lg md:!text-2xl"
                          : "text-2xl"
                      }`}>
                        {seva.title}
                      </h3>
                      <p className={`text-white/80 transition-all duration-500 md:text-sm ${
                        visibleSeva?.slug === seva.slug
                          ? "mt-0.5 text-xs md:!text-sm"
                          : "mt-1 text-sm"
                      }`}>
                        {seva.tagline}
                      </p>
                    </div>

                    {/* Mobile: Donate button appears when card is in center of screen */}
                    <div className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-500 md:hidden ${visibleSeva?.slug === seva.slug ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                      <span className="flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-3.5 text-sm font-bold text-[hsl(220,60%,12%)] shadow-gold">
                        🪔 Donate Now <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>

                    {/* Desktop: Donate button on hover */}
                    <div className="absolute inset-0 hidden items-center justify-center bg-black/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
                      <span className="flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-3.5 text-sm font-bold text-[hsl(220,60%,12%)] shadow-gold">
                        🪔 Donate Now <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>



        {/* ══ DONOR PRIVILEGES ══ */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-3 font-heading text-2xl font-bold text-foreground md:text-3xl">
                Donor Privileges
              </h2>
              <p className="mx-auto max-w-xl text-muted-foreground">
                Every devotee who contributes receives these blessings
              </p>
            </div>
            <div className="mx-auto grid max-w-4xl grid-cols-2 gap-4 md:grid-cols-4">
              {PRIVILEGES.map((p) => (
                <div key={p.title} className="rounded-2xl border border-border bg-card p-5 text-center transition-all hover:-translate-y-1 hover:shadow-elevated">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(42,92%,56%,0.12)] text-gold">
                    <p.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-1.5 text-sm font-semibold">{p.title}</h3>
                  <p className="text-xs text-muted-foreground">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ BOTTOM CTA ══ */}
        <section className="relative overflow-hidden bg-gradient-ocean py-16 text-center md:py-20">
          <div className="container mx-auto px-4">
            <h2 className="mb-3 font-heading text-2xl font-bold text-white md:text-4xl">
              Be Part of Building Krishna&apos;s Home
            </h2>
            <p className="mx-auto mb-8 max-w-xl text-white/85">
              Every contribution — big or small — brings us closer to completing this divine vision for Lord Krishna.
            </p>
            <Link
              href="/donate#sevas"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-8 py-3.5 text-sm font-bold text-[hsl(220,60%,12%)] shadow-gold transition-transform hover:-translate-y-0.5 md:text-base"
            >
              <Heart className="h-4 w-4 fill-current" /> Donate Now
            </Link>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-white/70">
              <ShieldCheck className="h-3.5 w-3.5" /> Secured by Razorpay · 80G Tax Exempt
            </p>
          </div>
        </section>
      </main>
    </PageLayout>
  );
}

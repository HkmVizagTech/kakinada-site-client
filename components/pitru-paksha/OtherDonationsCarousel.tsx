"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Ornament from "@/components/Ornament";

// Banner palette — matches the campaign art (see PitruPakshaClient for the
// full token map). Dark band stays dark: deep saffron → brown gradient with
// golden amber decor.
const C = {
  deepGreen: "#59321F", // warm brown ink / scrim base
  emerald: "#C93F05", // deep burnt saffron
  teal: "#C95718", // warm terracotta
  gold: "#E9A62A", // golden amber
  softGold: "#FFF5D9", // warm ivory (text on dark)
  magenta: "#D24A0A", // burnt orange
  lightMint: "#FFF5D9", // warm ivory
} as const;

const AUTOPLAY_MS = 5000;

interface DonationCard {
  href: string;
  title: string;
  tagline: string;
  blurb: string;
  image: string;
}

// Curated rail of the temple's other online donation pages. Art is chosen so
// it crops gracefully in the rounded card frame (banners with baked-in text
// are avoided here for the same reason as on the seva grid).
const OTHER_DONATIONS: DonationCard[] = [
  {
    href: "/alankara-vastra-seva",
    title: "Vastra & Alankara Seva",
    tagline: "Adorn the Lordships",
    blurb: "Offer silks, ornaments and fresh garlands for the daily shringar of the Deities.",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677419371-1783677418690-DietyPhotos.jpeg",
  },
  {
    href: "/gita-daan-seva",
    title: "Gita Daan Seva",
    tagline: "Share the Song of God",
    blurb: "Place the Bhagavad Gita into the hands of a seeker and share timeless wisdom.",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672760162-1783672758959-ChatGPTImageJul92026043444PM.png",
  },
  {
    href: "/govardhan-puja",
    title: "Govardhan Puja",
    tagline: "Annual festival sevas",
    blurb: "Participate in the Annakut offering and the worship of Giri Govardhan.",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1790154839039-1790154837479-govardhan.webp",
  },
  {
    href: "/shayani-ekadashi",
    title: "Ekadashi Seva",
    tagline: "Observe the sacred fast",
    blurb: "Honour the most auspicious day of the fortnight with fasting and seva.",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/ekadashi-posters/ad%20poster%201%2016-9%20%20final%20.jpg.webp",
  },
  {
    href: "/anna-daan-seva",
    title: "Anna Daan Seva",
    tagline: "The highest charity",
    blurb: "Serve sanctified prasadam to those who need it most — the greatest of all gifts.",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1786100757954-1786100756855-annadan2.jpg",
  },
  {
    href: "/gau-seva",
    title: "Gau Seva",
    tagline: "Serve Gau Mata",
    blurb: "Provide fodder, shelter and loving care for the temple's sacred cows.",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1790154838469-1790154837450-gauseva.webp",
  },
  {
    href: "/subhojanam",
    title: "Subhojanam",
    tagline: "Hospital prasadam seva",
    blurb: "Free, wholesome meals for patients and families at hospitals in Kakinada and Vizag.",
    image:
      "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg",
  },
];

export default function OtherDonationsCarousel() {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "center",
    loop: true,
    // Snap trimming fights centre alignment on a looping coverflow: it clamps
    // the first and last snaps so those slides never reach the middle, leaving
    // the front card off-centre at the ends of the rail.
    containScroll: false,
    slidesToScroll: 1,
    dragFree: false,
  });
  const [selected, setSelected] = useState(0);
  const [paused, setPaused] = useState(false);
  const router = useRouter();

  // Coverflow: the centred slide sits at full size in front while its
  // neighbours shrink, dim, blur, desaturate and tuck in behind it.
  //
  // The offset is normalised by the distance between two adjacent slide
  // CENTRES — card width plus flex gap — so the immediate neighbour is always
  // exactly ±1 at every breakpoint. (The original divided by half the card
  // width, putting every neighbour at ≈2.05; since the opacity curve zeroed
  // out at 2 they rendered completely invisible, which is why the rail looked
  // like one card floating in empty space.)
  const applyCoverflow = useCallback(() => {
    if (!emblaApi) return;
    const root = emblaApi.rootNode().getBoundingClientRect();
    const viewportCenter = root.left + root.width / 2;
    const gap = parseFloat(getComputedStyle(emblaApi.containerNode()).columnGap || "0") || 0;

    emblaApi.slideNodes().forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (!rect.width) return;
      const slideCenter = rect.left + rect.width / 2;
      const off = (slideCenter - viewportCenter) / (rect.width + gap);
      const abs = Math.abs(off);
      const ramp = Math.min(abs, 2);

      const scale = 1 - ramp * 0.12;
      const opacity = abs > 2.6 ? 0 : 1 - ramp * 0.26;
      // A small inward pull closes the gap left by the shrink, so neighbours
      // read as tucked behind the front card rather than drifting apart.
      const translateX = -Math.sign(off) * ramp * 4;
      const translateY = ramp * 2.5;

      node.style.transform = `translate3d(${translateX}%, ${translateY}%, 0) scale(${scale})`;
      node.style.opacity = opacity.toFixed(3);
      node.style.filter =
        ramp > 0.05 ? `blur(${(ramp * 1.1).toFixed(2)}px) saturate(${(1 - ramp * 0.45).toFixed(2)})` : "none";
      node.style.zIndex = String(30 - Math.round(Math.min(abs, 3) * 10));

      // Parallax: the photograph drifts against the card's own travel, which
      // is what stops a coverflow feeling like flat pictures sliding past.
      const art = node.querySelector<HTMLElement>("[data-parallax]");
      if (art) art.style.transform = `translate3d(${(off * 7).toFixed(2)}%, 0, 0) scale(1.16)`;
    });
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    applyCoverflow();
    const onSelect = () => {
      applyCoverflow();
      setSelected(emblaApi.selectedScrollSnap());
    };
    emblaApi.on("scroll", applyCoverflow);
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    window.addEventListener("resize", applyCoverflow);
    return () => {
      emblaApi.off("scroll", applyCoverflow);
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
      window.removeEventListener("resize", applyCoverflow);
    };
  }, [emblaApi, applyCoverflow]);

  // Pause auto-advance while dragging.
  useEffect(() => {
    if (!emblaApi) return;
    const down = () => setPaused(true);
    const up = () => setPaused(false);
    emblaApi.on("pointerDown", down);
    emblaApi.on("pointerUp", up);
    return () => {
      emblaApi.off("pointerDown", down);
      emblaApi.off("pointerUp", up);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || paused) return;
    const id = setInterval(() => emblaApi.scrollNext(), AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [emblaApi, paused]);

  const snapCount = emblaApi ? emblaApi.scrollSnapList().length : OTHER_DONATIONS.length;

  return (
    <section
      className="relative overflow-hidden px-4 py-16 md:py-24"
      style={{
        background: `linear-gradient(160deg, ${C.emerald} 0%, ${C.gold} 52%, ${C.softGold} 130%)`,
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
        if (e.key === "ArrowRight") emblaApi?.scrollNext();
      }}
    >
      {/* Ambient glow accents */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: `${C.gold}26` }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -bottom-28 -left-24 h-96 w-96 rounded-full blur-[120px]"
        style={{ background: `${C.teal}2b` }}
        aria-hidden
      />
      {/* A pool of light behind the rail, so the front card reads as lit rather
          than pasted onto a flat panel. */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[440px] w-[min(1100px,92vw)] -translate-x-1/2 -translate-y-1/2 rounded-[50%] blur-[90px]"
        style={{ background: `${C.gold}16` }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-10 text-center md:mb-14">
          <Ornament className="mx-auto mb-6" />
          <p
            className="text-xs font-semibold uppercase tracking-[0.28em] md:text-sm"
            style={{ color: C.deepGreen }}
          >
            Continue your seva
          </p>
          <h2
            className="mt-3 text-3xl font-bold text-white md:text-5xl"
            style={{ textShadow: `0 0 40px ${C.gold}33` }}
          >
            Other Donations
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-7 text-white/85 md:text-base">
            Beyond Pitru Paksha, your devotion can bless the temple in many ways
            — from feeding and cow care to the very stones of the Lord&apos;s
            abode.
          </p>
        </div>

        <div
          className="relative"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          {/* Desktop arrows flank the rail rather than sitting under it, so the
              next and previous cards are reachable where the eye already is. */}
          <button
            type="button"
            aria-label="Previous donations"
            onClick={() => emblaApi?.scrollPrev()}
            className="absolute -left-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[rgba(233,166,42,0.9)] hover:bg-black/45 hover:text-[#FFF5D9] lg:flex"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            aria-label="Next donations"
            onClick={() => emblaApi?.scrollNext()}
            className="absolute -right-2 top-1/2 z-40 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/25 bg-black/25 text-white/90 backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:border-[rgba(233,166,42,0.9)] hover:bg-black/45 hover:text-[#FFF5D9] lg:flex"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          <div ref={emblaRef} className="overflow-hidden">
            {/* 42% of a 7xl container ≈ 540px on desktop — wide enough to be the
                clear subject, narrow enough to leave a generous slice of each
                neighbour showing either side. */}
            <div className="flex items-stretch gap-5 py-10 md:gap-6">
              {OTHER_DONATIONS.map((d, i) => {
                const isFront = selected === i;
                return (
                  <button
                    key={d.href}
                    type="button"
                    aria-label={isFront ? `Open ${d.title}` : `Show ${d.title}`}
                    aria-current={isFront || undefined}
                    tabIndex={isFront ? 0 : -1}
                    onClick={() => {
                      if (isFront) router.push(d.href);
                      else emblaApi?.scrollTo(i);
                    }}
                    className="group shrink-0 grow-0 basis-[74%] cursor-pointer select-none outline-none sm:basis-[54%] lg:basis-[42%]"
                    style={{ willChange: "transform, opacity, filter" }}
                  >
                    <div
                      className={
                        "relative aspect-[4/3] w-full overflow-hidden rounded-3xl border text-left transition-[border-color,box-shadow] duration-500 " +
                        (isFront
                          ? "border-[rgba(233,166,42,0.9)] shadow-[0_34px_90px_-24px_rgba(0,0,0,0.8)]"
                          : "border-white/10 shadow-[0_14px_44px_rgba(0,0,0,0.4)]")
                      }
                    >
                      <div data-parallax className="absolute inset-0 will-change-transform">
                        <Image
                          src={d.image}
                          alt={d.title}
                          fill
                          unoptimized
                          sizes="(max-width: 640px) 74vw, (max-width: 1024px) 54vw, 42vw"
                          className="object-cover"
                        />
                      </div>

                      {/* A deeper, taller scrim than before: these captions sit
                          on nine different photographs, several of them bright,
                          and the old overlay left the small gold tagline
                          fighting the artwork underneath it. */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to top, ${C.deepGreen}F5 0%, ${C.deepGreen}D6 28%, rgba(42,22,8,0.42) 56%, rgba(42,22,8,0.08) 82%, transparent 100%)`,
                        }}
                      />
                      <div
                        className={
                          "absolute inset-x-0 top-0 h-[3px] origin-left transition-transform duration-500 " +
                          (isFront ? "scale-x-100" : "scale-x-0")
                        }
                        style={{
                          background: `linear-gradient(to right, ${C.gold}, ${C.softGold})`,
                        }}
                      />

                      <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                        <p
                          className="text-[11px] font-bold uppercase tracking-[0.2em] md:text-xs"
                          style={{ color: C.softGold, textShadow: "0 2px 8px rgba(0,0,0,0.65)" }}
                        >
                          {d.tagline}
                        </p>
                        <h3 className="mt-1.5 text-xl font-bold leading-snug text-white [text-shadow:0_2px_12px_rgba(0,0,0,0.7)] md:text-2xl">
                          {d.title}
                        </h3>

                        {/* The blurb and CTA belong to the focused card only —
                            revealing them on all nine would turn the rail into
                            a wall of competing text. */}
                        <div
                          className={
                            "grid transition-all duration-500 " +
                            (isFront
                              ? "mt-2 grid-rows-[1fr] opacity-100"
                              : "grid-rows-[0fr] opacity-0")
                          }
                        >
                          <div className="overflow-hidden">
                            <p className="max-w-md text-[13px] leading-6 text-white/85 md:text-sm">
                              {d.blurb}
                            </p>
                            <span
                              className="mt-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-[11px] font-bold uppercase tracking-[0.12em] transition-transform duration-300 group-hover:translate-x-1 md:text-xs"
                              style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.softGold} 190%)`, color: "#FFFFFF" }}
                            >
                              Donate
                              <ArrowRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Controls — one element, not two.
            The separate progress bar and dot row said the same thing twice:
            where you are in the rail, and how long until it moves. Merging them
            makes the ACTIVE dot the timer — it widens into a track that fills
            with gold as the interval runs — so position and countdown are read
            in a single glance, on every breakpoint. */}
        <div className="mt-7 flex items-center justify-center gap-4 md:mt-9">
          <button
            type="button"
            aria-label="Previous donations"
            onClick={() => emblaApi?.scrollPrev()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-all duration-300 hover:border-[rgba(233,166,42,0.85)] hover:text-[#FFF5D9] lg:hidden"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center gap-2">
            {Array.from({ length: snapCount }).map((_, i) => {
              const active = i === selected;
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Go to slide ${i + 1} of ${snapCount}`}
                  aria-current={active || undefined}
                  onClick={() => emblaApi?.scrollTo(i)}
                  // The visible bar is 6px tall; the button pads it out to a
                  // ~36px touch target so the dots stay tappable on a phone.
                  className="group py-3"
                >
                  <span
                    className="relative block h-1.5 overflow-hidden rounded-full transition-all duration-300 group-hover:bg-white/50"
                    style={{
                      width: active ? 34 : 6,
                      background: active ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.35)",
                    }}
                  >
                    {active && (
                      // Restarting rather than resuming on pause is deliberate:
                      // the autoplay interval is itself torn down and recreated
                      // on pause/resume, so a bar that picked up mid-fill would
                      // promise a tick that isn't coming.
                      <motion.span
                        key={`${selected}-${paused}`}
                        className="absolute inset-y-0 left-0 block rounded-full"
                        style={{ background: `linear-gradient(to right, ${C.gold}, ${C.softGold})` }}
                        initial={{ width: paused ? "100%" : "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: paused ? 0 : AUTOPLAY_MS / 1000, ease: "linear" }}
                      />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            aria-label="Next donations"
            onClick={() => emblaApi?.scrollNext()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 text-white/80 transition-all duration-300 hover:border-[rgba(233,166,42,0.85)] hover:text-[#FFF5D9] lg:hidden"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}

"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Ornament from "@/components/Ornament";
import type { CampaignConfig } from "@/lib/campaignConfig";
import { SQFT_CAMPAIGN } from "@/lib/campaignConfig";

const CLOUDINARY_BASE = "https://guptvrindavandham.org/media/campaign";

const CAROUSEL_IMAGES = [
  { src: `${CLOUDINARY_BASE}/mhaprashdam_image_gallery.webp`, caption: "Maha Prasadam" },
  { src: `${CLOUDINARY_BASE}/80g_Wbxrdiv_gFmZMqH.webp`, caption: "80G Tax Exemption" },
  { src: `${CLOUDINARY_BASE}/SANKALPA_SQUARE_FEET_SEVA.webp`, caption: "Sankalpa & Aarti" },
  { src: `${CLOUDINARY_BASE}/NARSIMHA_KAVACH_SUTRA_SQUARE_FEET.webp`, caption: "Narasimha Kavach Sutra" },
  { src: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1785398618210-1785398617184-sqftcert.webp", caption: "Contribution Certificate" },
  { src: `${CLOUDINARY_BASE}/narsimha_tilak_1.webp`, caption: "Narasimha Yagna Tilak" },
  { src: `${CLOUDINARY_BASE}/Picture_of_Krishna_image_gallery_YWVbbL6.webp`, caption: "Sri Krishna" },
];

const PRIVILEGES = [
  { lead: "Maha Prasadam", rest: " from the temple kitchen, sent to your home as a blessing for your seva." },
  { lead: "Sankalp and Aarti", rest: " will be performed on your name." },
  { lead: "Spiritual Books", rest: " — a special gift to deepen your journey in Krishna consciousness." },
  { lead: "80G Tax Exemption", rest: " on your donation, under Section 80G of the Income Tax Act." },
  { lead: "Digital Contribution Certificate", rest: " honouring your valued seva to the temple." },
  { lead: "Narasimha Kavach Sutra", rest: " for protection from all dangers." },
  { lead: "Narasimha Yagna Tilak", rest: " — a sacred tilak blessed during yagna." },
];

const OTHER_PRIVILEGES = [
  { src: `${CLOUDINARY_BASE}/Untitled_design.webp`, caption: "Name Inscription" },
  { src: `${CLOUDINARY_BASE}/3_UhAzXJT.png`, caption: "Special Family Pujas" },
  { src: `${CLOUDINARY_BASE}/mahaprashdam_box_image.webp`, caption: "Maha Prasadam Box" },
  { src: `${CLOUDINARY_BASE}/7.png`, caption: "Spiritual Books Set" },
  { src: `${CLOUDINARY_BASE}/6_FDX1D3S.webp`, caption: "Inauguration Invitation" },
  { src: `${CLOUDINARY_BASE}/1_vT6BI21.png`, caption: "Deity Blessings" },
  { src: `${CLOUDINARY_BASE}/4.png`, caption: "Premium Donor Gifts" },
];

function PrivilegeCarousel({ extraImage }: { extraImage?: { src: string; caption: string } }) {
  const [index, setIndex] = useState(0);
  const touchStartX = useRef(0);

  // Brick campaigns append the temple's laser engraving machine — the image
  // that shows how a donor's name ends up on the actual brick.
  const images = extraImage ? [...CAROUSEL_IMAGES, extraImage] : CAROUSEL_IMAGES;

  useEffect(() => {
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % images.length);
    }, 4000);
    return () => clearInterval(id);
  }, [images.length]);

  const next = () => setIndex((i) => (i + 1) % images.length);
  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length);

  return (
    <div
      className="relative aspect-[4/3] w-full overflow-hidden rounded-[28px] border border-border shadow-sm sm:aspect-[5/4]"
      onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
      onTouchEnd={(e) => {
        const diff = e.changedTouches[0].clientX - touchStartX.current;
        if (Math.abs(diff) > 50) diff > 0 ? prev() : next();
      }}
    >
      {images.map((img, i) => (
        <div
          key={img.src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === index ? 1 : 0 }}
        >
          <Image
            src={img.src}
            alt={img.caption}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
      ))}
      <div className="absolute bottom-4 right-4 flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Previous image"
          onClick={prev}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-foreground/70 transition hover:bg-gold hover:text-white"
        >
          <ChevronLeft className="h-3 w-3" />
        </button>
        {images.map((img, i) => (
          <button
            key={img.src}
            type="button"
            aria-label={`Show ${img.caption}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-5 bg-gold" : "w-1.5 bg-white/60 hover:bg-white/80"
            }`}
          />
        ))}
        <button
          type="button"
          aria-label="Next image"
          onClick={next}
          className="flex h-5 w-5 items-center justify-center rounded-full bg-white/60 text-foreground/70 transition hover:bg-gold hover:text-white"
        >
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function OtherPrivilegesGallery({ config = SQFT_CAMPAIGN }: { config?: CampaignConfig }) {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollBy = (dir: 1 | -1) => {
    scrollerRef.current?.scrollBy({ left: dir * 380, behavior: "smooth" });
  };

  return (
    <div className="relative mt-16">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h3 className="font-heading text-2xl font-bold text-primary md:text-3xl">
          Other Donor Privileges
        </h3>
        <div className="hidden gap-2 sm:flex">
          <button
            type="button"
            aria-label="Scroll left"
            onClick={() => scrollBy(-1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-gold hover:text-gold"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            aria-label="Scroll right"
            onClick={() => scrollBy(1)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-gold hover:text-gold"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <p className="mb-6 text-sm font-semibold text-primary">
        Each of our respected contributors who donate more than 1 {config.unitName} will receive the following privileges based on Donation Level.
      </p>

      <div
        ref={scrollerRef}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {OTHER_PRIVILEGES.map((p) => (
          <div
            key={p.caption}
            className="relative aspect-[4/5] w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-border min-[360px]:w-80 sm:w-96"
          >
            <Image src={p.src} alt={p.caption} fill sizes="(max-width: 640px) 320px, 384px" className="object-cover" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DonorPrivilegesSection({ scrollToDonate, config = SQFT_CAMPAIGN }: { scrollToDonate?: () => void; config?: CampaignConfig }) {
  // Brick Seva alone: a donor's name is engraved on the very brick they
  // sponsor, so lead the privilege list with it and show the machine that
  // does the engraving in the carousel.
  const brickEngravingImage =
    config.type === "BRICK" && config.engravingImage
      ? { src: config.engravingImage, caption: "Laser Name Engraving" }
      : undefined;
  const privileges = brickEngravingImage
    ? [
        {
          lead: "Your Name on a Brick",
          rest: ` — the ${config.unitName} you sponsor is laser-engraved with your name before it is laid in the temple.`,
        },
        ...PRIVILEGES,
      ]
    : PRIVILEGES;

  return (
    <section className="bg-[radial-gradient(circle_at_top,_rgba(255,221,91,0.14),_transparent_45%)] bg-white dark:bg-background py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <Ornament className="mb-6" />
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.3em] text-gold">Our gratitude to every donor</p>
          <h2 className="font-heading text-3xl font-bold text-primary md:text-4xl">Donor Privileges</h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="grid items-center gap-10 lg:grid-cols-2"
        >
          <PrivilegeCarousel extraImage={brickEngravingImage} />

          <div>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Each of our respected contributors will receive these privileges as our heartfelt gratitude:
            </p>
            <ol className="space-y-4">
              {privileges.map((p, i) => (
                <li key={p.lead} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-xs font-bold text-gold">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground md:text-base">
                    <span className="font-bold text-primary">{p.lead}</span>
                    {p.rest}
                  </p>
                </li>
              ))}
            </ol>

            {scrollToDonate && (
              <button
                onClick={scrollToDonate}
                className="mt-8 rounded-full bg-gradient-gold px-8 py-3.5 text-sm font-bold text-[hsl(220,90%,12%)] shadow-[var(--shadow-gold)] transition-transform hover:scale-105 md:text-base"
              >
                Donate Now
              </button>
            )}
          </div>
        </motion.div>

        <OtherPrivilegesGallery config={config} />
      </div>
    </section>
  );
}

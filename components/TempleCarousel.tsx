"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

const FALLBACK_IMG = "/assets/home-banner-chaitanya-bhavan.webp";
const FALLBACK_IMG_MOBILE = "/assets/home-banner-chaitanya-bhavan-mobile.webp";

export interface TempleCarouselSlide {
  src: string;
  mobileSrc: string;
  title: string;
  linkUrl: string;
}

interface TempleCarouselProps {
  /** Override the default home slides with a custom banner set. */
  slides?: TempleCarouselSlide[];
  /** Set false to skip loading live banners from /hero-banners. */
  fetchApiBanners?: boolean;
}

const defaultSlides: TempleCarouselSlide[] = [
  {
    src: "/assets/home-banner-chaitanya-bhavan.webp",
    mobileSrc: "/assets/home-banner-chaitanya-bhavan-mobile.webp",
    title: "Chaitanya Bhavan",
    linkUrl: "",
  },
  {
    src: "/assets/home-banner-daily-darshan.webp",
    mobileSrc: "/assets/home-banner-daily-darshan-mobile.webp",
    title: "Daily Darshan",
    linkUrl: "",
  },
  {
    src: "/assets/home-banner-radha-madan-mohan.webp",
    mobileSrc: "/assets/home-banner-radha-madan-mohan-mobile.webp",
    title: "Sri Sri Radha Madan Mohan",
    linkUrl: "",
  },
  {
    src: "/assets/home-banner-jagannatha-rath-yatra.webp",
    mobileSrc: "/assets/home-banner-jagannatha-rath-yatra-mobile.webp",
    title: "Jagannatha Rath Yatra",
    linkUrl: "",
  },
  {
    src: "/assets/home-banner-srinivasa-govinda.webp",
    mobileSrc: "/assets/home-banner-srinivasa-govinda-mobile.webp",
    title: "Srinivasa Govinda Temple",
    linkUrl: "",
  },
];

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

const TempleCarousel = ({ slides: propSlides, fetchApiBanners = true }: TempleCarouselProps = {}) => {
  const [slides, setSlides] = useState<TempleCarouselSlide[]>(propSlides || defaultSlides);
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (!fetchApiBanners) return;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/hero-banners`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.banners) && data.banners.length > 0) {
            setSlides(
              data.banners.map((b: any) => ({
                src: b.desktopImage,
                mobileSrc: b.mobileImage,
                title: b.title,
                linkUrl: b.linkUrl || "",
              }))
            );
          }
        }
      } catch {}
    })();
  }, [fetchApiBanners]);

  const next = useCallback(() => {
    setDirection(1);
    setCurrent((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prev = useCallback(() => {
    setDirection(-1);
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    const interval = setInterval(next, 6000);
    return () => clearInterval(interval);
  }, [next]);

  useEffect(() => {
    setCurrent(0);
  }, [slides.length]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const pointerStartX = useRef(0);
  const isDragging = useRef(false);

  const startDrag = (clientX: number) => {
    pointerStartX.current = clientX;
    isDragging.current = false;
    setDragging(false);
  };

  const moveDrag = (clientX: number) => {
    if (!isDragging.current && Math.abs(clientX - pointerStartX.current) > 5) {
      isDragging.current = true;
      setDragging(true);
    }
  };

  const endDrag = useCallback((clientX: number) => {
    setDragging(false);
    if (!isDragging.current) {
      const slide = slides[current];
      if (slide?.linkUrl) {
        const url = slide.linkUrl;
        if (/^https?:\/\//i.test(url)) window.open(url, "_blank", "noopener");
        else window.location.href = url;
      }
      return;
    }
    const dx = clientX - pointerStartX.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) next();
      else prev();
    }
    isDragging.current = false;
  }, [next, prev, slides, current]);

  useEffect(() => {
    const el = carouselRef.current;
    if (!el) return;

    const onPointerDown = (e: PointerEvent) => {
      startDrag(e.clientX);
      el.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => moveDrag(e.clientX);

    const onPointerUp = (e: PointerEvent) => endDrag(e.clientX);

    const onPointerCancel = () => {
      isDragging.current = false;
      setDragging(false);
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove);
    el.addEventListener("pointerup", onPointerUp);
    el.addEventListener("pointercancel", onPointerCancel);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", onPointerUp);
      el.removeEventListener("pointercancel", onPointerCancel);
    };
  }, [endDrag]);

  const variants = {
    enter: (dir: number) => ({ x: dir > 0 ? "100%" : "-100%", opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir: number) => ({ x: dir > 0 ? "-100%" : "100%", opacity: 0 }),
  };

  const currentSlide = slides[current] || slides[0];
  const desktopBroken = imgErrors[currentSlide.src];
  const mobileBroken = imgErrors[currentSlide.mobileSrc];

  const slideImages = (
    <>
      <Image
        src={mobileBroken ? FALLBACK_IMG_MOBILE : currentSlide.mobileSrc}
        alt={currentSlide.title}
        fill
        sizes="100vw"
        draggable={false}
        className="select-none object-cover object-center md:hidden"
        priority
        onError={() => setImgErrors((prev) => ({ ...prev, [currentSlide.mobileSrc]: true }))}
      />
      <Image
        src={desktopBroken ? FALLBACK_IMG : currentSlide.src}
        alt={currentSlide.title}
        fill
        sizes="100vw"
        draggable={false}
        className="hidden select-none object-cover object-center md:block"
        priority
        onError={() => setImgErrors((prev) => ({ ...prev, [currentSlide.src]: true }))}
      />
    </>
  );

  return (
    <section className="w-full bg-white dark:bg-background select-none">
      <div
        ref={carouselRef}
        onDragStart={(e) => e.preventDefault()}
        className="relative w-full overflow-hidden rounded-b-3xl bg-foreground aspect-[962/1635] md:aspect-[1920/730]"
        style={{ cursor: dragging ? "grabbing" : "grab", touchAction: "pan-y" }}
      >
        <AnimatePresence custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: [0.25, 0.8, 0.25, 1] }}
            className="absolute inset-0"
          >
            {slideImages}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};

export default TempleCarousel;

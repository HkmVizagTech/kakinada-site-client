"use client";

// Live "Today's Darshan" section for the homepage. Pulls real photos
// uploaded via Admin → Gallery (category "Daily Darshan" / type "darshan").
// Shows today's upload if the priest has posted one; otherwise falls back
// to the most recent darshan date so the section is never empty. Links
// through to the full /gallery date-scroller experience.

import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, X, ChevronLeft, ChevronRight } from "lucide-react";
import Ornament from "@/components/Ornament";
import { getGalleryImages } from "@/lib/galleryApi";

interface DarshanPhoto {
  src: string;
  title: string;
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TodaysDarshan() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  const [photos, setPhotos] = useState<DarshanPhoto[]>([]);
  const [dateLabel, setDateLabel] = useState<string>("");
  const [isToday, setIsToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    getGalleryImages({ type: "darshan", status: "active" })
      .then((items: any[]) => {
        if (!items || items.length === 0) return;

        // Group by date, keep the newest first (server already sorts desc).
        const byDate = new Map<string, DarshanPhoto[]>();
        for (const item of items) {
          const key = (item.date || "").slice(0, 10);
          if (!key) continue;
          if (!byDate.has(key)) byDate.set(key, []);
          for (const src of item.images || []) {
            byDate.get(key)!.push({ src, title: item.title || "Darshan" });
          }
        }
        if (byDate.size === 0) return;

        const today = todayKey();
        const chosenKey = byDate.has(today) ? today : Array.from(byDate.keys()).sort((a, b) => b.localeCompare(a))[0];

        setPhotos(byDate.get(chosenKey) || []);
        setIsToday(chosenKey === today);
        setDateLabel(
          new Date(chosenKey + "T00:00:00").toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })
        );
      })
      .finally(() => setLoading(false));
  }, []);

  // Nothing uploaded yet at all — don't show a broken/empty section.
  if (!loading && photos.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-[hsl(42,90%,97%)] to-white py-12 dark:from-background dark:to-background md:py-16" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="mb-10 text-center"
        >
          <p className="mb-3 flex items-center justify-center gap-1.5 text-sm font-medium uppercase tracking-[0.2em] text-gold">
            <Sparkles className="h-4 w-4" /> {isToday ? "Live from the Temple" : "Latest Darshan"}
          </p>
          <Ornament className="mb-5" />
          <h2 className="mb-3 font-heading text-3xl font-bold text-foreground md:text-5xl">
            {isToday ? "Today's Darshan" : "Darshan"}
          </h2>
          {dateLabel && (
            <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">{dateLabel}</p>
          )}
        </motion.div>

        {loading ? (
          <div className="mx-auto grid max-w-5xl grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
            ))}
          </div>
        ) : (
          <div className="mx-auto mb-8 grid max-w-5xl grid-cols-2 gap-3.5 md:grid-cols-4 md:gap-4">
            {photos.slice(0, 8).map((photo, i) => (
              <motion.div
                key={photo.src + i}
                initial={{ opacity: 0, scale: 0.94 }}
                animate={inView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + i * 0.06 }}
                className="group relative aspect-square cursor-pointer overflow-hidden rounded-2xl shadow-warm"
                onClick={() => setLightboxIndex(i)}
              >
                <Image
                  src={photo.src}
                  alt={photo.title}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[hsl(220,85%,10%,0.72)] via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <p className="font-heading text-sm font-semibold text-white">{photo.title}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        <div className="text-center">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 rounded-full border-2 border-gold px-6 py-3 text-sm font-bold text-gold transition-colors hover:bg-gold/10"
          >
            View Full Darshan Gallery <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-foreground/95 p-4"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            className="absolute right-6 top-6 text-background/80 hover:text-background"
            onClick={() => setLightboxIndex(null)}
          >
            <X className="h-8 w-8" />
          </button>
          {lightboxIndex > 0 && (
            <button
              className="absolute left-4 text-background/70 hover:text-background md:left-8"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
            >
              <ChevronLeft className="h-10 w-10" />
            </button>
          )}
          {lightboxIndex < Math.min(photos.length, 8) - 1 && (
            <button
              className="absolute right-4 text-background/70 hover:text-background md:right-8"
              onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
            >
              <ChevronRight className="h-10 w-10" />
            </button>
          )}
          <div className="relative h-[80vh] w-[90vw] max-w-full" onClick={(e) => e.stopPropagation()}>
            <Image
              src={photos[lightboxIndex].src}
              alt={photos[lightboxIndex].title}
              fill
              sizes="90vw"
              className="object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
}

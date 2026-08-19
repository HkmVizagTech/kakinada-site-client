"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Image as ImageIcon } from "lucide-react";
import Ornament from "@/components/Ornament";
import { getGalleryImages } from "@/lib/galleryApi";

interface GalleryTile {
  src: string;
  title: string;
  span: string;
}

// Asymmetric editorial grid — one hero tile, one tall tile, four standard
const SPANS = ["col-span-2 row-span-2", "row-span-2", "", "", "", ""];

const MAX_TILES = 6;

const GalleryPreview = () => {
  const [tiles, setTiles] = useState<GalleryTile[] | null>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getGalleryImages({ status: "active" })
      .then((items: any[]) => {
        if (cancelled || !items) return;

        // Only images the admin marked for the Temple Gallery section
        // (Today's Darshan owns type "darshan", so they never overlap).
        const galleryItems = items.filter((it) => it.type !== "darshan");
        if (galleryItems.length === 0) {
          setTiles([]);
          return;
        }

        const flat: GalleryTile[] = [];
        for (const item of galleryItems) {
          for (const src of item.images || []) {
            if (flat.length >= MAX_TILES) break;
            flat.push({ src, title: item.title || "Darshan", span: "" });
          }
          if (flat.length >= MAX_TILES) break;
        }
        if (flat.length === 0) {
          setTiles([]);
          return;
        }

        // With fewer than 3 images the hero/tall spans leave holes, so use a
        // uniform grid there and keep the editorial spans otherwise.
        const spans = flat.length < 3 ? Array(flat.length).fill("") : SPANS;
        setTiles(flat.map((t, i) => ({ ...t, span: spans[i] || "" })));

        const total = galleryItems.reduce((n, item) => n + (item.images || []).length, 0);
        setHasMore(total > MAX_TILES);
      })
      .catch(() => {
        if (!cancelled) setTiles([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Hidden while loading and when the admin hasn't uploaded Temple Gallery
  // images yet, so no stale/static content and no lonely empty heading.
  if (!tiles || tiles.length === 0) return null;

  return (
    <section className="bg-white dark:bg-background py-12 md:py-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-14 text-center"
        >
          <p className="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-gold">Divine Moments</p>
          <Ornament className="mb-5" />
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground md:text-5xl">
            Temple Gallery
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Glimpses of darshan, worship, prasadam distribution, and festival life at Hare Krishna Vaikuntham.
          </p>
        </motion.div>

        <div className="mx-auto mb-10 grid max-w-6xl auto-rows-[200px] grid-cols-2 gap-3.5 md:auto-rows-[260px] md:grid-cols-4 md:gap-4">
          {tiles.map((img, i) => (
            <motion.div
              key={img.src}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 + i * 0.08 }}
              className={`group relative overflow-hidden rounded-2xl shadow-warm ${img.span}`}
            >
              <Image
                src={img.src}
                alt={img.title}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.07]"
              />
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-[hsl(220,85%,10%,0.72)] via-transparent to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <p className="font-heading text-sm font-semibold text-white">{img.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center">
            <Link
              href="/gallery"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 font-semibold text-primary-foreground transition-all hover:-translate-y-0.5 hover:opacity-90"
            >
              <ImageIcon className="h-4 w-4" />
              View Full Gallery
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default GalleryPreview;

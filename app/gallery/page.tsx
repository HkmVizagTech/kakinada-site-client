"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn } from "lucide-react";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import PageHero from "@/components/PageHero";
import Ornament from "@/components/Ornament";
import DailyDarshanGallery from "@/components/DailyDarshanGallery";
import { getGalleryImages, GALLERY_CATEGORIES } from "@/lib/galleryApi";

type GalleryImage = {
  title: string;
  date: string;
  category: string;
  images: string[];
  description?: string;
};

type GroupModalState = { group: GalleryImage } | null;
type LightboxState = { images: string[]; index: number; group: GalleryImage } | null;

const categories = ["All", ...GALLERY_CATEGORIES];

export default function GalleryPage() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [activeDate, setActiveDate] = useState<string>("All Dates");
  const [groupModal, setGroupModal] = useState<GroupModalState>(null);
  const [lightbox, setLightbox] = useState<LightboxState>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  function groupImages(images: GalleryImage[]): GalleryImage[] {
    const map = new Map<string, GalleryImage>();
    for (const img of images) {
      const key = `${img.title}|${img.date}|${img.category}`;
      if (!map.has(key)) {
        map.set(key, {
          title: img.title,
          date: img.date,
          category: img.category,
          images: [...img.images],
          description: img.description,
        });
      } else {
        map.get(key)!.images.push(...img.images);
      }
    }
    return Array.from(map.values());
  }

  useEffect(() => {
    getGalleryImages({ status: "active" }).then((items) => {
      setGalleryImages(items);

      if (items && items.length > 0) {
        const raw = items.map((it: GalleryImage) => ((it.date || "").slice(0, 10)) as string);
        const datesSet = new Set<string>(raw.filter(Boolean));
        const dates: string[] = Array.from(datesSet).sort((a, b) => b.localeCompare(a));
        if (dates.length > 0) setActiveDate(dates[0]);
      }
      setLoading(false);
    });
  }, []);


  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (lightbox) setLightbox(null);
        else if (groupModal) setGroupModal(null);
      }
      if (!lightbox) return;
      if (e.key === "ArrowLeft") {
        setLightbox((lb) => {
          if (!lb) return lb;
          const prev = (lb.index - 1 + lb.images.length) % lb.images.length;
          return { ...lb, index: prev };
        });
      }
      if (e.key === "ArrowRight") {
        setLightbox((lb) => {
          if (!lb) return lb;
          const next = (lb.index + 1) % lb.images.length;
          return { ...lb, index: next };
        });
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [groupModal, lightbox]);

  const dateData: Record<string, { images: { src: string; title: string }[]; festival?: string }> = {};
  for (const item of galleryImages) {
    const dateKey = (item.date || "").slice(0, 10);
    if (!dateKey) continue;
    if (!dateData[dateKey]) dateData[dateKey] = { images: [], festival: undefined };
    for (const src of item.images || []) {
      dateData[dateKey].images.push({ src, title: item.title || "" });
    }
  }


  const grouped = groupImages(
    activeCategory === "All" ? galleryImages : galleryImages.filter((img) => img.category === activeCategory)
  );

  // Don't block rendering of the full page while images load.
  // Previously we returned early which made the whole page show a single
  // "Loading gallery..." message until the client fetch completed. Keep the
  // PageHero and surrounding UI visible and show skeleton cards in the grid
  // while the gallery data is being fetched.

  return (
    <PageLayout>
      <PageHero
        title="Gallery"
        subtitle="Divine moments captured — Darshan, Festivals, Seva & Community"
        breadcrumb="Gallery"
        backgroundImage="https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677419371-1783677418690-DietyPhotos.jpeg"
      />

  <DailyDarshanGallery
        selectedDate={activeDate === "All Dates" ? undefined : activeDate}
        onDateChange={(d) => setActiveDate(d)}
        dateData={dateData}
      />

      <section className="py-12 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-warm"
                    : "bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <AnimatePresence mode="popLayout">
              {loading
                ? // Render 8 skeleton cards while loading so layout doesn't jump
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={`skeleton-${i}`}
                      className="animate-pulse bg-card rounded-2xl aspect-square"
                    />
                  ))
                : grouped.map((group, i) => (
                    <motion.div
                      key={group.title + group.date + group.category}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.4, delay: i * 0.05 }}
                      className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square"
                      onClick={() => setGroupModal({ group })}
                    >
                      <Image
                        src={group.images[0]}
                        alt={group.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <p className="text-background font-heading font-semibold text-sm">{group.title}</p>
                        <p className="text-background/60 text-xs mt-1">{group.date}</p>
                      </div>
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-9 h-9 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
                          <ZoomIn className="w-4 h-4 text-background" />
                        </div>
                      </div>
                      {group.images.length > 1 && (
                        <span className="absolute bottom-3 right-3 bg-background/80 text-xs px-2 py-0.5 rounded-full font-semibold">
                          +{group.images.length}
                        </span>
                      )}
                    </motion.div>
                  ))}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
      <AnimatePresence>
        {groupModal && groupModal.group && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4"
            onClick={() => setGroupModal(null)}
          >
            <button
              className="absolute top-6 right-6 text-background/80 hover:text-background"
              onClick={() => setGroupModal(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-background rounded-2xl p-6 w-[95vw] max-w-[1200px] max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="font-heading text-2xl font-bold mb-4 text-center">
                {groupModal.group.title}
              </h2>
              <p className="text-center text-sm text-muted-foreground mb-6">{groupModal.group.description}</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6">
                {groupModal.group.images.map((src, idx) => (
                  <div key={src} className="flex flex-col">
                    <div
                      className="relative h-56 sm:h-64 md:h-72 lg:h-80 cursor-pointer group rounded-lg overflow-hidden"
                      onClick={() =>
                        setLightbox({
                          images: groupModal.group.images,
                          index: idx,
                          group: groupModal.group,
                        })
                      }
                    >
                      <Image
                        src={src}
                        alt={groupModal.group.title}
                        fill
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 30vw"
                        className="object-cover rounded-lg"
                      />
                      <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <ZoomIn className="w-10 h-10 text-background" />
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground line-clamp-2">{groupModal.group.title}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {lightbox && lightbox.images && typeof lightbox.index === "number" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 text-background/80 hover:text-background"
              onClick={() => setLightbox(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative w-[90vw] h-[90vh] flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <GallerySingleImage images={lightbox.images} startIndex={lightbox.index} />
            </motion.div>
            <div className="absolute bottom-8 text-center">
              <p className="text-background font-heading text-2xl font-semibold">
                {lightbox.group ? lightbox.group.title : ""}
              </p>
              <p className="text-background/60 text-lg mt-1">
                {lightbox.group ? lightbox.group.date : ""}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </PageLayout>
  );
}

type GallerySingleImageProps = { images: string[]; startIndex?: number };

function GallerySingleImage({ images, startIndex = 0 }: GallerySingleImageProps) {
  const [index, setIndex] = useState<number>(startIndex);
  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);
  if (!images || images.length === 0) return null;
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <button
        className="absolute left-6 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-4 z-10 shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          setIndex((i) => (i - 1 + images.length) % images.length);
        }}
        disabled={images.length <= 1}
      >
        <span className="text-4xl">&#8592;</span>
      </button>
  <div className="relative w-full h-full flex items-center justify-center max-w-[1200px] max-h-[80vh]">
        <Image
          src={images[index]}
          alt="Gallery Image"
          fill
          loading="lazy"
          sizes="90vw"
          className="object-contain rounded-2xl"
        />
      </div>
      <button
        className="absolute right-6 top-1/2 -translate-y-1/2 bg-background/80 rounded-full p-4 z-10 shadow-lg"
        onClick={(e) => {
          e.stopPropagation();
          setIndex((i) => (i + 1) % images.length);
        }}
        disabled={images.length <= 1}
      >
        <span className="text-4xl">&#8594;</span>
      </button>
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-4">
        {images.map((img, i) => (
          <button
            key={img + i}
            className={`w-4 h-4 rounded-full cursor-pointer focus:outline-none ${
              i === index ? "bg-primary" : "bg-muted-foreground"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            aria-label={`Go to image ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

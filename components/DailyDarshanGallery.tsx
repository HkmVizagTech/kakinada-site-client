"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X, ZoomIn, Calendar } from "lucide-react";
import Image from "next/image";

const dailyDarshanData: Record<string, { images: { src: string; title: string }[]; festival?: string }> = {
  "2026-03-06": {
    festival: "Gaura Purnima",
    images: [
      { src: "/assets/gallery-darshan-1.jpg", title: "Sri Sri Radha Krishna — Morning Shringar" },
      { src: "/assets/gallery-aarti.jpg", title: "Mangala Aarti Darshan" },
      { src: "/assets/gallery-festival-1.jpg", title: "Special Festival Decoration" },
      { src: "/assets/hero-temple.jpg", title: "Temple Hall Overview" },
    ],
  },
  "2026-03-05": {
    images: [
      { src: "/assets/gallery-aarti.jpg", title: "Morning Mangala Aarti" },
      { src: "/assets/gallery-darshan-1.jpg", title: "Shringar Darshan" },
      { src: "/assets/temple-seva.jpg", title: "Deity Abhishekam" },
    ],
  },
  "2026-03-04": {
    festival: "Ekadashi",
    images: [
      { src: "/assets/gallery-darshan-1.jpg", title: "Ekadashi Special Darshan" },
      { src: "/assets/gallery-festival-2.jpg", title: "Flower Decoration" },
      { src: "/assets/gallery-annadaan-1.jpg", title: "Prasadam Distribution" },
      { src: "/assets/about-community.jpg", title: "Evening Kirtan" },
    ],
  },
  "2026-03-03": {
    images: [
      { src: "/assets/gallery-aarti.jpg", title: "Sandhya Aarti" },
      { src: "/assets/gallery-darshan-1.jpg", title: "Evening Darshan" },
      { src: "/assets/gallery-class.jpg", title: "Bhagavad Gita Class" },
    ],
  },
  "2026-03-02": {
    festival: "Sunday Feast",
    images: [
      { src: "/assets/gallery-festival-1.jpg", title: "Sunday Feast Kirtan" },
      { src: "/assets/gallery-annadaan-1.jpg", title: "Feast Prasadam" },
      { src: "/assets/subhojanam.jpg", title: "Community Gathering" },
      { src: "/assets/anna-daan.jpg", title: "Food Distribution" },
      { src: "/assets/gallery-darshan-1.jpg", title: "Special Darshan" },
    ],
  },
  "2026-03-01": {
    images: [
      { src: "/assets/gallery-darshan-1.jpg", title: "Sri Krishna Morning Darshan" },
      { src: "/assets/gallery-aarti.jpg", title: "Aarti Ceremony" },
    ],
  },
  "2026-02-28": {
    images: [
      { src: "/assets/gallery-festival-2.jpg", title: "Temple Decoration" },
      { src: "/assets/gallery-darshan-1.jpg", title: "Darshan" },
      { src: "/assets/gallery-class.jpg", title: "Discourse Session" },
    ],
  },
};

const sortedDates = Object.keys(dailyDarshanData).sort((a, b) => b.localeCompare(a));

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr + "T00:00:00");
  return {
    day: date.getDate(),
    weekday: date.toLocaleDateString("en-US", { weekday: "short" }),
    month: date.toLocaleDateString("en-US", { month: "short" }),
    year: date.getFullYear(),
    full: date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }),
  };
};

type DailyDarshanGalleryProps = {
  selectedDate?: string;
  onDateChange?: (date: string) => void;
  dateData?: Record<string, { images: { src: string; title: string }[]; festival?: string }>; 
};

const DailyDarshanGallery = ({ selectedDate: externalSelectedDate, onDateChange, dateData }: DailyDarshanGalleryProps) => {
  const sourceDates = dateData ? Object.keys(dateData) : Object.keys(dailyDarshanData);
  const sortedDatesLocal = sourceDates.sort((a, b) => b.localeCompare(a));
  const [internalSelectedDate, setInternalSelectedDate] = useState<string>(sortedDatesLocal[0]);
  const selectedDate = externalSelectedDate || internalSelectedDate;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [page, setPage] = useState(0);

  const datesPerPage = 7;
  const totalPages = Math.ceil(sortedDatesLocal.length / datesPerPage);
  const visibleDates = sortedDatesLocal.slice(page * datesPerPage, (page + 1) * datesPerPage);

  const currentData = dateData ? dateData[selectedDate] : dailyDarshanData[selectedDate];
  const formatted = formatDate(selectedDate);

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        {
}
        <div className="text-center mb-12">
          <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-medium">
            Daily Darshan
          </p>
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Select a Date for Darshan
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Click on a date to view the divine darshan gallery for that day.
          </p>
        </div>

        {
}
        <div className="flex items-center justify-center gap-2 mb-12">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex gap-3 overflow-hidden">
            {visibleDates.map((dateStr) => {
              const d = formatDate(dateStr);
              const isActive = dateStr === selectedDate;
              const hasFestival = !!(dateData ? dateData[dateStr]?.festival : dailyDarshanData[dateStr]?.festival);

              return (
                <motion.button
                  key={dateStr}
                  onClick={() => {
                    if (onDateChange) onDateChange(dateStr);
                    else setInternalSelectedDate(dateStr);
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center px-4 py-3 rounded-2xl min-w-[72px] transition-all duration-300 ${
                    isActive
                      ? "bg-primary text-primary-foreground shadow-warm"
                      : "bg-card border border-border text-muted-foreground hover:border-primary/30 hover:text-foreground"
                  }`}
                >
                  <span className={`text-xs font-medium ${isActive ? "text-primary-foreground/70" : ""}`}>
                    {d.weekday}
                  </span>
                  <span className="text-2xl font-heading font-bold leading-tight">{d.day}</span>
                  <span className={`text-xs ${isActive ? "text-primary-foreground/70" : ""}`}>
                    {d.month}
                  </span>
                  {hasFestival && (
                    <span className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      isActive ? "bg-primary-foreground" : "bg-primary"
                    }`} />
                  )}
                </motion.button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
            className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/30 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {
}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedDate}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-center gap-3 mb-8">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-heading text-xl md:text-2xl font-semibold text-foreground">
                {formatted.full}
              </h3>
              {currentData?.festival && (
                <span className="px-3 py-1 bg-primary/10 text-primary text-sm font-medium rounded-full">
                  {currentData.festival}
                </span>
              )}
            </div>

            {
}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentData?.images.map((img, i) => (
                <motion.div
                  key={img.title + i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative overflow-hidden rounded-2xl cursor-pointer aspect-square"
                  onClick={() => setLightboxIndex(i)}
                >
                  <Image
                    src={img.src}
                    alt={img.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="text-background font-heading font-semibold text-sm">{img.title}</p>
                  </div>
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 rounded-full bg-background/20 backdrop-blur-sm flex items-center justify-center">
                      <ZoomIn className="w-4 h-4 text-background" />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {
}
        <AnimatePresence>
          {lightboxIndex !== null && currentData && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4"
              onClick={() => setLightboxIndex(null)}
            >
              <button
                className="absolute top-6 right-6 text-background/80 hover:text-background"
                onClick={() => setLightboxIndex(null)}
              >
                <X className="w-8 h-8" />
              </button>

              {
}
              {lightboxIndex > 0 && (
                <button
                  className="absolute left-4 md:left-8 text-background/70 hover:text-background"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex - 1); }}
                >
                  <ChevronLeft className="w-10 h-10" />
                </button>
              )}
              {lightboxIndex < currentData.images.length - 1 && (
                <button
                  className="absolute right-4 md:right-8 text-background/70 hover:text-background"
                  onClick={(e) => { e.stopPropagation(); setLightboxIndex(lightboxIndex + 1); }}
                >
                  <ChevronRight className="w-10 h-10" />
                </button>
              )}

              <motion.div
                key={lightboxIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="relative max-w-full max-h-[85vh] w-[90vw] h-[80vh]"
                onClick={(e) => e.stopPropagation()}
              >
                <Image
                  src={currentData.images[lightboxIndex]?.src}
                  alt={currentData.images[lightboxIndex]?.title}
                  fill
                  loading="lazy"
                  sizes="90vw"
                  className="object-contain rounded-2xl"
                />
              </motion.div>
              <div className="absolute bottom-8 text-center">
                <p className="text-background font-heading text-lg font-semibold">
                  {currentData.images[lightboxIndex]?.title}
                </p>
                <p className="text-background/60 text-sm mt-1">
                  {formatted.full}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default DailyDarshanGallery;

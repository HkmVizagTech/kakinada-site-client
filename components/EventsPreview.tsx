"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import Ornament from "@/components/Ornament";
import { ArrowRight } from "lucide-react";
import EventCard from "@/components/EventCard";


import { useEffect, useState } from "react";

const futureDate = (daysAhead: number) =>
  new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

const fallbackEvents = [
  {
    title: "Janmashtami Celebrations",
    date: futureDate(45),
    time: "6:00 AM - 12:00 AM",
    location: "Temple Premises",
    description: "Grand celebration of Lord Krishna's appearance day with abhishekam, kirtan, and midnight aarti.",
    image: "/assets/home-event-janmashtami.webp",
  },
  {
    title: "Radhashtami Festival",
    date: futureDate(75),
    time: "6:00 AM - 9:00 PM",
    location: "Temple Premises",
    description: "Celebration of Srimati Radharani's appearance with special darshan and offerings.",
    image: "/assets/home-event-radhashtami.webp",
  },
  {
    title: "Gita Jayanti",
    date: futureDate(135),
    time: "5:00 AM - 8:00 PM",
    location: "Temple Premises",
    description: "Commemoration of the day when Lord Krishna spoke the Bhagavad Gita to Arjuna.",
    image: "/assets/home-event-gita-jayanti.webp",
  },
];



const EventsPreview = () => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });
  const [events, setEvents] = useState(fallbackEvents);

  useEffect(() => {
    async function fetchEvents() {
      try {
  const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003"}/events?limit=4`, { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.events) && data.events.length > 0) {
          const sorted = (data.events as any[])
            .map((e) => ({
              ...e,
              date: e.date ? new Date(e.date) : null,
              image: (e.images && e.images[0]) || e.image || fallbackEvents[0].image,
            }))
            .filter((e) => e.date)
            .sort((a, b) => (b.date as Date).getTime() - (a.date as Date).getTime())
            .slice(0, 4)
            .map((e) => ({
              ...e,
              date: (e.date as Date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })
            }));
          setEvents(sorted);
        }
      } catch {}
    }
    fetchEvents();
  }, []);

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-background">
      <div className="container mx-auto px-4" ref={ref}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">Events</p>
          <Ornament className="mb-5" />
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Upcoming Celebrations
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Join us for festivals, kirtans, and special spiritual programs throughout the year.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto space-y-6">
          {events.map((event, index) => (
            <EventCard key={event.title + index} event={event} href={`/events/${(event as any)._id || event.title}`} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            View All Events <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default EventsPreview;

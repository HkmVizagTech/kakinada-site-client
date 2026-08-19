"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Bell } from "lucide-react";
import EventCard from "@/components/EventCard";
import PageLayout from "@/components/PageLayout";
import WhatsAppCommunityCTA from "@/components/WhatsAppCommunityCTA";
import PageHero from "@/components/PageHero";
type ImportantDate = {
  _id: string;
  title: string;
  date: string;
  description?: string;
  type: "Ekadashi" | "Festival" | "Other";
};



const getEvents = async () => {
  try {
    const res = await fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003"}/events`, { cache: "no-store", credentials: 'include' });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.events || []).map((e: any) => ({
      ...e,
      image: (e.images && e.images[0]) || e.image || undefined,
    }));
  } catch {
    return [];
  }
};

const Countdown = ({ targetDate }: { targetDate: string }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const diff = new Date(targetDate).getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        mins: Math.floor((diff / (1000 * 60)) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-3">
      {[
        { val: timeLeft.days, label: "Days" },
        { val: timeLeft.hours, label: "Hrs" },
        { val: timeLeft.mins, label: "Min" },
        { val: timeLeft.secs, label: "Sec" },
      ].map((item) => (
        <div key={item.label} className="text-center">
          <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-1">
            <span className="text-xl font-bold text-primary font-heading">
              {String(item.val).padStart(2, "0")}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">{item.label}</span>
        </div>
      ))}
    </div>
  );
};






export default function EventsPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);

  useEffect(() => {
    getEvents().then((ev) => {
      setEvents(ev);
      setLoading(false);
    });
    fetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/important-dates`, { credentials: 'include' })
      .then((res) => res.json())
      .then((data) => setImportantDates(Array.isArray(data) ? data : data.dates || []))
      .catch(() => {});
  }, []);

  const nextEvent = events[0];

  const filteredEvents = events;

  return (
    <PageLayout>
      <PageHero
        title="Upcoming Events"
        subtitle="Join us in celebrating the divine festivals and spiritual gatherings"
        breadcrumb="Events"
        backgroundImage="/assets/gallery-festival-2.jpg"
      />

      {
}
      {!loading && nextEvent && (
        <section className="py-12 md:py-16 bg-white dark:bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto">
              <EventCard event={nextEvent} href={`/events/${nextEvent._id || nextEvent.title}`} />
              <div className="flex justify-center mt-6">
                <Countdown targetDate={nextEvent.date} />
              </div>
            </div>
          </div>
        </section>
      )}

      {
}
      <section className="py-12 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
            <div>
              <p className="text-primary text-sm tracking-[0.2em] uppercase mb-2 font-medium">Upcoming Events</p>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">All Temple Events & Festivals</h2>
            </div>
            <div />
          </div>

          <div className="mx-auto grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {!loading && filteredEvents.length > 0 ? (
              filteredEvents.map((event: any) => (
                <EventCard key={event._id || event.title} event={event} href={`/events/${event._id || event.title}`} smallCard />
              ))
            ) : (
              <div className="text-center text-muted-foreground py-10 col-span-full">No events found.</div>
            )}
            {loading && <div className="text-center text-muted-foreground py-10 col-span-full">Loading events...</div>}
          </div>
        </div>
      </section>

      {
}
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-14">
            <p className="text-primary text-sm tracking-[0.2em] uppercase mb-4 font-medium">Vaishnava Calendar</p>
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground">
              Important Dates & Ekadashis
            </h2>
          </div>
          {
}
          <div className="max-w-4xl mx-auto grid md:grid-cols-3 gap-6">
            {Object.entries(
              importantDates.reduce((acc, date) => {
                const d = new Date(date.date);
                const key = d.toLocaleString("default", { month: "long" }) + " " + d.getFullYear();
                if (!acc[key]) acc[key] = [];
                acc[key].push(date);
                return acc;
              }, {} as Record<string, ImportantDate[]>)
            ).map(([month, items]) => (
              <div key={month} className="bg-card rounded-2xl border border-border p-6">
                <h3 className="font-heading text-lg font-bold text-foreground mb-4 pb-3 border-b border-border">
                  {month}
                </h3>
                <div className="space-y-3">
                  {items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((date) => (
                    <div key={date._id} className="flex items-start gap-3">
                      <div className="w-14 text-xs font-semibold text-primary bg-primary/5 rounded-lg px-2 py-1.5 text-center shrink-0">
                        {new Date(date.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-foreground leading-snug pt-1 font-semibold">
                          {date.title}
                          <span className={`ml-2 text-xs font-bold ${date.type === "Festival" ? "text-yellow-700" : date.type === "Ekadashi" ? "text-blue-700" : "text-gray-500"}`}>
                            {date.type}
                          </span>
                        </p>
                        {date.description && <p className="text-xs text-muted-foreground mt-1">{date.description}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {
}
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <Bell className="w-12 h-12 text-primary mx-auto mb-6" />
          <h2 className="font-heading text-3xl font-bold text-foreground mb-4">
            Never Miss a Festival
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Follow our social channels to stay updated on festivals, special darshan timings, 
            and spiritual events at Hare Krishna Movement Vizag.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.youtube.com/@harekrishnavizag"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Subscribe on YouTube
            </a>
            <a
              href="https://www.facebook.com/harekrishnavizag"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary/5 transition-colors"
            >
              Follow on Facebook
            </a>
          </div>
        </div>
      </section>
      <WhatsAppCommunityCTA />
    </PageLayout>
  );
}

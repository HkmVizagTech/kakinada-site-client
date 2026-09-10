"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Bell, CalendarDays, Calendar, MapPin, ArrowRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";
import PageHero from "@/components/PageHero";
import Ornament from "@/components/Ornament";
import WhatsAppCommunityCTA from "@/components/WhatsAppCommunityCTA";
import {
  getFallbackEvents,
  getFallbackImportantDates,
} from "@/lib/eventsFallback";

type ImportantDate = {
  _id: string;
  title: string;
  date: string;
  description?: string;
  type: "Ekadashi" | "Festival" | "Other";
  /** Printed on the tag instead of "Other" (e.g. "Appearance"). */
  label?: string;
  fastNote?: string;
};

type DisplayEvent = {
  _id?: string;
  title: string;
  date: string;
  description?: string;
  image?: string;
  location?: string;
  href?: string;
  isFallback?: boolean;
};

const API_BASE =
  (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") ||
  "http://localhost:3003";

const FALLBACK_IMAGE = "/assets/gallery-festival-2.jpg";

const getEvents = async (): Promise<DisplayEvent[]> => {
  try {
    const res = await fetch(`${API_BASE}/events`, {
      cache: "no-store",
      credentials: "include",
    });
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

const getImportantDates = async (): Promise<ImportantDate[]> => {
  try {
    const res = await fetch(`${API_BASE}/important-dates`, {
      credentials: "include",
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.dates || [];
  } catch {
    return [];
  }
};

/* ─────────────────────────── helpers ─────────────────────────── */

const asDate = (s: string) => new Date(s.length === 10 ? `${s}T00:00:00` : s);

const fmtLong = (s: string) =>
  asDate(s).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

/** Colour family for a calendar entry — festivals gold, Ekadashis navy. */
const kindOf = (type: ImportantDate["type"]) =>
  type === "Ekadashi" ? "eka" : type === "Festival" ? "fest" : "obs";

const CHIP_STYLES: Record<string, string> = {
  eka: "bg-primary/10 text-primary border-primary/20",
  fest: "bg-[hsla(42,92%,56%,0.16)] text-gold border-[hsla(42,92%,56%,0.32)]",
  obs: "bg-muted text-muted-foreground border-border",
};

const PILL_STYLES: Record<string, string> = {
  eka: "bg-primary/10 text-primary",
  fest: "bg-[hsla(42,92%,56%,0.18)] text-gold",
  obs: "bg-muted text-muted-foreground",
};

/* ─────────────────────────── countdown ─────────────────────────── */

function Countdown({ targetDate }: { targetDate: string }) {
  const [left, setLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = asDate(targetDate).getTime() - Date.now();
      if (diff <= 0) return setLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      setLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff / 3600000) % 24),
        mins: Math.floor((diff / 60000) % 60),
        secs: Math.floor((diff / 1000) % 60),
      });
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2.5">
      {[
        [left.days, "Days"],
        [left.hours, "Hrs"],
        [left.mins, "Min"],
        [left.secs, "Sec"],
      ].map(([val, label]) => (
        <div
          key={label as string}
          className="w-[62px] rounded-2xl border border-white/20 bg-white/10 py-2.5 text-center backdrop-blur-sm md:w-[66px]"
        >
          <span className="block text-xl font-extrabold leading-none text-white tabular-nums md:text-[22px]">
            {String(val).padStart(2, "0")}
          </span>
          <span className="mt-1.5 block text-[10px] uppercase tracking-[0.12em] text-white/65">
            {label as string}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ─────────────────────────── section heading ─────────────────────────── */

function SectionHead({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-10 text-center md:mb-12">
      <p className="mb-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
        {eyebrow}
      </p>
      <Ornament className="mb-4" />
      <h2 className="font-heading text-[27px] font-extrabold tracking-tight text-foreground md:text-[34px]">
        {title}
      </h2>
      {sub && (
        <p className="mx-auto mt-2.5 max-w-xl text-sm text-muted-foreground md:text-[15px]">
          {sub}
        </p>
      )}
    </div>
  );
}

/* ─────────────────────────── page ─────────────────────────── */

export default function EventsPage() {
  const [events, setEvents] = useState<DisplayEvent[]>([]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMonth, setActiveMonth] = useState(0);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getEvents(), getImportantDates()]).then(([apiEvents, apiDates]) => {
      if (cancelled) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const upcomingFromApi = apiEvents
        .filter((e) => e.date && asDate(e.date) >= today)
        .sort((a, b) => asDate(a.date).getTime() - asDate(b.date).getTime());

      setEvents(upcomingFromApi.length > 0 ? upcomingFromApi : getFallbackEvents());
      setImportantDates(apiDates.length > 0 ? apiDates : getFallbackImportantDates());
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const featured = events[0];
  const rest = events.slice(1);
  const hrefFor = (e: DisplayEvent) => e.href || `/events/${e._id || e.title}`;

  const months = useMemo(() => {
    const groups = new Map<string, ImportantDate[]>();
    for (const item of importantDates) {
      const key = asDate(item.date).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric",
      });
      groups.set(key, [...(groups.get(key) || []), item]);
    }
    return Array.from(groups, ([name, items]) => ({
      name,
      short: name.split(" ")[0],
      items: items
        .slice()
        .sort((a, b) => asDate(a.date).getTime() - asDate(b.date).getTime()),
    }));
  }, [importantDates]);

  const current = months[Math.min(activeMonth, Math.max(0, months.length - 1))];

  return (
    <PageLayout>
      <PageHero
        title="Upcoming Events"
        subtitle="Join us in celebrating the divine festivals and spiritual gatherings"
        breadcrumb="Events"
        backgroundImage="/assets/gallery-festival-2.jpg"
      />

      {/* ── Next celebration ─────────────────────────────────────── */}
      {!loading && featured && (
        <section className="bg-white py-14 dark:bg-background md:py-16">
          <div className="container mx-auto px-4">
            <SectionHead eyebrow="Coming Up Next" title="The Next Celebration" />

            <div className="relative mx-auto grid max-w-6xl overflow-hidden rounded-3xl bg-gradient-navy shadow-elevated md:grid-cols-12">
              <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

              <div className="relative min-h-[220px] md:col-span-5 md:min-h-[360px]">
                <img
                  src={featured.image || FALLBACK_IMAGE}
                  alt={featured.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,90%,18%)] via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:via-transparent md:to-[hsl(220,90%,18%)]" />
              </div>

              <div className="relative z-10 flex flex-col justify-center gap-3.5 p-7 text-white md:col-span-7 md:p-11">
                <span className="text-[11px] font-bold uppercase tracking-[0.22em] text-gold">
                  Next Celebration
                </span>
                <h3 className="font-heading text-2xl font-extrabold leading-tight tracking-tight md:text-[34px]">
                  {featured.title}
                </h3>
                <div className="flex flex-col gap-2 text-[13.5px] text-white/85 sm:flex-row sm:flex-wrap sm:gap-5">
                  <span className="inline-flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    {fmtLong(featured.date)}
                  </span>
                  <span className="inline-flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {featured.location || "Temple Premises"}
                  </span>
                </div>
                {featured.description && (
                  <p className="line-clamp-3 text-sm leading-relaxed text-white/80">
                    {featured.description}
                  </p>
                )}
                <Countdown targetDate={featured.date} />
                <Link
                  href={hrefFor(featured)}
                  className="mt-2 inline-flex w-fit items-center gap-2 rounded-full bg-gradient-gold px-6 py-3 text-sm font-bold text-[hsl(220,60%,12%)] shadow-gold transition-transform hover:-translate-y-0.5"
                >
                  View Details
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Upcoming festivals grid ──────────────────────────────── */}
      <section className="bg-white pb-14 pt-4 dark:bg-background md:pb-16">
        <div className="container mx-auto px-4">
          <SectionHead
            eyebrow="Upcoming Events"
            title="Temple Events & Festivals"
            sub="Every festival and celebration on the temple calendar for the season ahead."
          />

          {loading && (
            <p className="py-10 text-center text-muted-foreground">Loading events...</p>
          )}

          {!loading && rest.length === 0 && !featured && (
            <div className="mx-auto max-w-md rounded-2xl border border-border bg-card p-10 text-center">
              <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Nothing scheduled right now
              </h3>
              <p className="text-sm text-muted-foreground">
                Please check back soon — new festivals are added regularly.
              </p>
            </div>
          )}

          {!loading && rest.length > 0 && (
            <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
              {rest.map((event, i) => {
                const d = asDate(event.date);
                return (
                  <motion.div
                    key={event._id || event.title}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-40px" }}
                    transition={{ delay: Math.min(i, 5) * 0.06, duration: 0.45 }}
                  >
                    <Link
                      href={hrefFor(event)}
                      className="group flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-card transition-all duration-300 hover:-translate-y-1.5 hover:border-primary/35 hover:shadow-elevated"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden bg-primary/5">
                        <img
                          src={event.image || FALLBACK_IMAGE}
                          alt={event.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
                        />
                        <div className="absolute left-3 top-3 rounded-2xl bg-white/95 px-2.5 py-1.5 text-center leading-none shadow-md">
                          <span className="block text-[10px] font-extrabold uppercase tracking-[0.1em] text-gold">
                            {d.toLocaleDateString("en-IN", { month: "short" })}
                          </span>
                          <span className="mt-0.5 block text-lg font-extrabold text-primary">
                            {d.getDate()}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-2 p-5">
                        <h3 className="line-clamp-2 min-h-[43px] font-heading text-[16.5px] font-bold leading-snug text-foreground">
                          {event.title}
                        </h3>
                        {event.description && (
                          <p className="line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                            {event.description}
                          </p>
                        )}
                        <div className="mt-auto flex items-center justify-between border-t border-border pt-3.5">
                          <span className="inline-flex items-center gap-1.5 text-[11.5px] text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location || "Temple Premises"}
                          </span>
                          <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Important dates ──────────────────────────────────────── */}
      {months.length > 0 && current && (
        <section className="bg-white py-14 dark:bg-background md:py-16">
          <div className="container mx-auto px-4">
            <SectionHead
              eyebrow="Vaishnava Calendar"
              title="Important Dates & Ekadashis"
              sub="Ekadashis, festivals and observance days for the months ahead."
            />

            {/* month tabs */}
            <div className="mb-7 flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide sm:justify-center">
              {months.map((m, i) => {
                const on = m.name === current.name;
                return (
                  <button
                    key={m.name}
                    type="button"
                    onClick={() => setActiveMonth(i)}
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
                      on
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary"
                    }`}
                  >
                    {m.short}
                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                        on ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      }`}
                    >
                      {m.items.length}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* rows */}
            <div className="mx-auto max-w-3xl overflow-hidden rounded-[22px] border border-border bg-card shadow-warm">
              <ul>
                {current.items.map((item) => {
                  const d = asDate(item.date);
                  const kind = kindOf(item.type);
                  const tag = item.label || item.type;
                  const showTag = !item.title.toLowerCase().startsWith(tag.toLowerCase());
                  return (
                    <li
                      key={item._id}
                      className="flex gap-4 border-b border-border p-4 transition-colors last:border-0 hover:bg-primary/[0.03] md:gap-[18px] md:px-6 md:py-[18px]"
                    >
                      <div
                        className={`w-14 shrink-0 rounded-2xl border py-2.5 text-center leading-none ${CHIP_STYLES[kind]}`}
                      >
                        <span className="block text-xl font-extrabold">{d.getDate()}</span>
                        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-wider opacity-75">
                          {d.toLocaleDateString("en-IN", { weekday: "short" })}
                        </span>
                      </div>

                      <div className="min-w-0 pt-0.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4 className="text-[14.5px] font-semibold leading-snug text-foreground">
                            {item.title}
                          </h4>
                          {showTag && (
                            <span
                              className={`whitespace-nowrap rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${PILL_STYLES[kind]}`}
                            >
                              {tag}
                            </span>
                          )}
                          {item.fastNote && (
                            <span className="whitespace-nowrap rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[hsl(200,80%,30%)] dark:text-accent">
                              {item.fastNote}
                            </span>
                          )}
                        </div>
                        {item.description && (
                          <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-muted-foreground">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-7 text-center">
              <Link
                href="/vaishnav-calendar"
                className="inline-flex items-center gap-2 rounded-full border border-primary/35 px-6 py-3 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
              >
                <CalendarDays className="h-4 w-4" />
                See the Full Year Calendar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Stay updated ─────────────────────────────────────────── */}
      <section className="bg-white py-12 dark:bg-background md:py-16">
        <div className="container mx-auto max-w-2xl px-4 text-center">
          <Bell className="mx-auto mb-6 h-12 w-12 text-primary" />
          <h2 className="mb-4 font-heading text-3xl font-bold text-foreground">
            Never Miss a Festival
          </h2>
          <p className="mb-8 leading-relaxed text-muted-foreground">
            Follow our social channels to stay updated on festivals, special darshan timings,
            and spiritual events at ISKCON Kakinada.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://www.youtube.com/@harekrishnakakinada"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-opacity hover:opacity-90"
            >
              Subscribe on YouTube
            </a>
            <a
              href="https://www.facebook.com/harekrishnakakinada"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border-2 border-primary px-6 py-3 font-semibold text-primary transition-colors hover:bg-primary/5"
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

"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Moon, Sparkles, Star, ChevronLeft, ChevronRight, Clock, ArrowRight } from "lucide-react";
import Link from "next/link";
import PageLayout from "@/components/PageLayout";
import PageHero from "@/components/PageHero";
import {
  getDatesForMonth,
  getNextUpcomingEvent,
  getEventsForDate,
  type VaishnavaDate,
  type VaishnavaDateType,
} from "@/lib/vaishnavaCalendarData";

const typeConfig: Record<VaishnavaDateType, { badge: string; icon: typeof Moon; dot: string }> = {
  Ekadashi:      { badge: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",     icon: Moon,     dot: "bg-blue-500" },
  Festival:      { badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300", icon: Sparkles, dot: "bg-amber-500" },
  Appearance:    { badge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",  icon: Star,     dot: "bg-green-500" },
  Disappearance: { badge: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300", icon: Star,  dot: "bg-purple-500" },
  Observance:    { badge: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",        icon: Star,     dot: "bg-gray-400" },
};

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS_SHORT = ["Su","Mo","Tu","We","Th","Fr","Sa"];
const TODAY = new Date();
const CURRENT_MONTH = TODAY.getMonth();

const discoverCards = [
  { title: "Daily Schedule",  subtitle: "Aarti timings & programs", href: "/daily-schedule",  cta: "View Schedule" },
  { title: "Volunteer",       subtitle: "Serve with us at the temple", href: "/volunteer",     cta: "Join Now" },
  { title: "Subhojanam",      subtitle: "Hospital prasadam seva",   href: "/subhojanam",      cta: "Learn More" },
  { title: "Anna Daan Seva",  subtitle: "Feed the hungry",          href: "/anna-daan-seva",  cta: "Sponsor Now" },
  { title: "Contact Us",      subtitle: "Visit, call, or write",    href: "/contact",         cta: "Get in Touch" },
  { title: "Donate",          subtitle: "Support temple activities", href: "/donate",          cta: "Donate Now" },
];

export default function VaishnavCalendarPage() {
  const [selectedMonth, setSelectedMonth] = useState(CURRENT_MONTH);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthEvents = useMemo(() => getDatesForMonth(selectedMonth), [selectedMonth]);
  const selectedDateEvents = useMemo(() => selectedDate ? getEventsForDate(selectedDate) : [], [selectedDate]);
  const nextEvent = useMemo(() => getNextUpcomingEvent(), []);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(2026, selectedMonth, 1).getDay();
    const daysInMonth = new Date(2026, selectedMonth + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [selectedMonth]);

  const isToday = (day: number) =>
    day === TODAY.getDate() && selectedMonth === TODAY.getMonth() && 2026 === TODAY.getFullYear();

  const getEventsForDay = (day: number): VaishnavaDate[] => {
    const dateStr = `2026-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return getEventsForDate(dateStr);
  };

  const formatSelectedDate = () => {
    if (!selectedDate) {
      const todayStr = `2026-${String(CURRENT_MONTH + 1).padStart(2, "0")}-${String(TODAY.getDate()).padStart(2, "0")}`;
      return new Date(todayStr + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
    }
    return new Date(selectedDate + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
  };

  const currentDateEvents = selectedDate ? selectedDateEvents : (() => {
    if (selectedMonth !== CURRENT_MONTH || 2026 !== TODAY.getFullYear()) return [];
    const todayStr = `2026-${String(CURRENT_MONTH + 1).padStart(2, "0")}-${String(TODAY.getDate()).padStart(2, "0")}`;
    return getEventsForDate(todayStr);
  })();

  return (
    <PageLayout>
      <PageHero
        title="Vaishnava Calendar 2026"
        subtitle="Complete Gaudiya Vaishnava calendar with Ekadashis, festivals, and sacred observances"
        breadcrumb="Vaishnav Calendar"
      />

      <section className="py-8 md:py-12 bg-white dark:bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Description */}
          <p className="mb-6 max-w-3xl text-sm text-muted-foreground leading-relaxed">
            Stay updated on upcoming festivals and important occasions for devotees with the Gaudiya Vaishnava festival calendar, featuring all major celebrations in 2026.
          </p>

          {/* Next event banner */}
          {nextEvent && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 rounded-xl border border-border bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 p-3 md:p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15">
                  <Calendar className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Next Upcoming</p>
                  <p className="text-sm md:text-base font-semibold text-foreground">
                    {nextEvent.title}
                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                      &mdash; {new Date(nextEvent.date).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* ── 3-Panel Calendar Card ─────────────────────────────── */}
          <div className="rounded-2xl overflow-hidden border border-border bg-primary/[0.03] dark:bg-primary/[0.06] shadow-sm">
            <div className="flex flex-col lg:flex-row">

              {/* ── Left: Month Sidebar (desktop only) ──────────── */}
              <div className="hidden lg:flex flex-col bg-primary text-primary-foreground min-w-[200px] max-w-[200px] p-4">
                <h3 className="mb-3 text-xs font-bold uppercase tracking-widest opacity-70">2026</h3>
                <div className="flex flex-col gap-0.5">
                  {MONTHS.map((month, i) => {
                    const count = getDatesForMonth(i).length;
                    const isSelected = i === selectedMonth;
                    const isCurrent = i === CURRENT_MONTH;
                    return (
                      <button
                        key={month}
                        onClick={() => { setSelectedMonth(i); setSelectedDate(null); }}
                        className={`relative flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                          isSelected
                            ? "bg-white/20 text-white"
                            : "text-white/70 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {month}
                          {isCurrent && !isSelected && (
                            <span className="h-1.5 w-1.5 rounded-full bg-white/80" />
                          )}
                        </span>
                        {count > 0 && (
                          <span className={`text-[10px] font-bold ${isSelected ? "opacity-90" : "opacity-50"}`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* ── Mobile: Horizontal Month Pills ──────────────── */}
              <div className="lg:hidden bg-primary p-3">
                <div className="overflow-x-auto scrollbar-hide">
                  <div className="flex gap-1.5 min-w-max">
                    {MONTHS.map((month, i) => {
                      const isSelected = i === selectedMonth;
                      const isCurrent = i === CURRENT_MONTH;
                      return (
                        <button
                          key={month}
                          onClick={() => { setSelectedMonth(i); setSelectedDate(null); }}
                          className={`relative rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                            isSelected
                              ? "bg-white/25 text-white"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          {month.slice(0, 3)}
                          {isCurrent && !isSelected && (
                            <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-white" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* ── Center: Calendar Grid ───────────────────────── */}
              <div className="flex-1 p-4 md:p-6 lg:border-r lg:border-primary/10">
                {/* Month + Nav arrows */}
                <div className="mb-4 flex items-center justify-between">
                  <button
                    onClick={() => { setSelectedMonth((p) => (p - 1 + 12) % 12); setSelectedDate(null); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <h2 className="text-lg font-bold text-foreground">{MONTHS[selectedMonth]} 2026</h2>
                  <button
                    onClick={() => { setSelectedMonth((p) => (p + 1) % 12); setSelectedDate(null); }}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Weekday headers */}
                <div className="mb-1 grid grid-cols-7">
                  {WEEKDAYS_SHORT.map((day, i) => (
                    <div key={`wd-${i}`} className="py-1.5 text-center text-[11px] font-semibold text-muted-foreground">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Day cells */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, idx) => {
                    if (day === null) return <div key={`empty-${idx}`} className="aspect-square" />;

                    const events = getEventsForDay(day);
                    const today = isToday(day);
                    const dateStr = `2026-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                    const isSelected = selectedDate === dateStr;
                    const hasEvents = events.length > 0;
                    const eventTypes = [...new Set(events.map((e) => e.type))];

                    return (
                      <div key={day} className="flex items-center justify-center p-0.5">
                        <button
                          onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                          className={`relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-sm transition-all ${
                            isSelected
                              ? "bg-primary text-primary-foreground font-bold shadow-md"
                              : today
                                ? "ring-2 ring-primary text-primary font-bold"
                                : hasEvents
                                  ? "hover:bg-primary/10 text-foreground font-medium"
                                  : "hover:bg-muted/50 text-muted-foreground"
                          }`}
                        >
                          <span className="leading-none">{day}</span>
                          {hasEvents && !isSelected && (
                            <div className="absolute bottom-1 flex gap-px">
                              {eventTypes.slice(0, 3).map((type) => (
                                <span key={type} className={`h-1 w-1 rounded-full ${typeConfig[type]?.dot || "bg-gray-400"}`} />
                              ))}
                            </div>
                          )}
                          {hasEvents && isSelected && (
                            <div className="absolute bottom-1 flex gap-px">
                              {eventTypes.slice(0, 3).map((type) => (
                                <span key={type} className="h-1 w-1 rounded-full bg-white/60" />
                              ))}
                            </div>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-border/50 pt-3">
                  {([["Ekadashi","bg-blue-500"],["Festival","bg-amber-500"],["Appearance","bg-green-500"],["Disappearance","bg-purple-500"]] as const).map(([type, dotClass]) => (
                    <div key={type} className="flex items-center gap-1.5">
                      <span className={`h-2 w-2 rounded-full ${dotClass}`} />
                      <span className="text-[11px] text-muted-foreground">{type}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ── Right: Event Detail Panel ───────────────────── */}
              <div className="lg:min-w-[300px] lg:max-w-[340px] p-4 md:p-6 border-t lg:border-t-0 border-border/30">
                <h3 className="mb-4 text-sm font-bold text-foreground">
                  {formatSelectedDate()}
                </h3>

                {currentDateEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted/50">
                      <Calendar className="h-5 w-5 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">No Notable Events</p>
                    <p className="mt-1 text-xs text-muted-foreground/70">on This Day</p>
                  </div>
                ) : (
                  <div className="space-y-3 lg:max-h-[360px] lg:overflow-y-auto lg:pr-1 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-primary/20">
                    {currentDateEvents.map((event) => {
                      const config = typeConfig[event.type];
                      const Icon = config.icon;
                      return (
                        <div
                          key={event.date + event.title}
                          className="rounded-xl border border-border/50 bg-card p-3.5 transition-all hover:shadow-sm"
                        >
                          <div className="flex items-start gap-2.5">
                            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${config.badge}`}>
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold leading-snug text-foreground">{event.title}</p>
                              {event.description && (
                                <p className="mt-1 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                                  {event.description}
                                </p>
                              )}
                              <div className="mt-2 flex flex-wrap gap-1.5">
                                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${config.badge}`}>
                                  {event.type}
                                </span>
                                {event.fastUntilNoon && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300">
                                    <Clock className="h-2.5 w-2.5" />Fast until noon
                                  </span>
                                )}
                                {event.completeFast && (
                                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-medium text-red-700 dark:bg-red-900/30 dark:text-red-300">
                                    <Clock className="h-2.5 w-2.5" />Complete fast
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Discover Section ──────────────────────────────── */}
          <div className="mt-10">
            <h2 className="mb-2 text-xl font-bold text-foreground">Discover HKM Vizag</h2>
            <p className="mb-5 text-sm text-muted-foreground">Learn more about what you can do.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {discoverCards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group rounded-xl border border-border bg-card p-4 transition-all hover:shadow-md hover:border-primary/30 hover:-translate-y-0.5"
                >
                  <h4 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                    {card.title}
                  </h4>
                  <p className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                    {card.subtitle}
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-primary">
                    {card.cta}
                    <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

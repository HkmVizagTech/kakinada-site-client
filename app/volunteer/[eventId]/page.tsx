"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Calendar,
  MapPin,
  ArrowLeft,
  Loader2,
  Clock,
  Users,
} from "lucide-react";
import PageLayout from "@/components/PageLayout";
import Ornament from "@/components/Ornament";
import { Button } from "@/components/ui/button";
import VolunteerRegistrationForm from "@/components/VolunteerRegistrationForm";

const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");

interface VolunteerEvent {
  _id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;
  location?: string;
  image?: string;
  slots?: number;
  filledSlots?: number;
  category?: string;
  status?: string;
  formFields?: Array<{
    id: string;
    type: string;
    label: string;
    placeholder?: string;
    required?: boolean;
    options?: string[];
  }>;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatDateShort(d: string) {
  return new Date(d).toLocaleDateString("en-IN", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function sameDay(a: string, b: string) {
  return new Date(a).toDateString() === new Date(b).toDateString();
}

export default function VolunteerEventPage() {
  const params = useParams<{ eventId: string }>();
  const eventId = params.eventId;

  const [event, setEvent] = useState<VolunteerEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchEvent = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`${API_URL}/volunteers/${eventId}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setEvent(data.event || null);
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  const registrationOpen = event?.status === "active";

  return (
    <PageLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-[88px] md:pt-[104px]">
        <div className="relative min-h-[320px] bg-gradient-navy">
          {event?.image && (
            <img
              src={event.image}
              alt={event.title}
              className="absolute inset-0 h-full w-full object-cover opacity-40"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[hsl(220,85%,12%,0.95)] via-[hsl(220,80%,20%,0.6)] to-transparent" />
          <div className="relative mx-auto flex max-w-4xl flex-col items-center px-4 py-16 text-center md:py-20">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.2em] text-white/90 backdrop-blur-sm">
              <Users className="h-3.5 w-3.5" />
              Volunteer Registration
            </p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-heading text-3xl font-bold leading-tight text-white drop-shadow-lg sm:text-4xl md:text-5xl"
            >
              {event?.title || "Event Registration"}
            </motion.h1>
            {event?.description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/80 sm:text-base">
                {event.description}
              </p>
            )}
            {event && (
              <>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs font-medium text-white sm:gap-3 sm:text-sm">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                    <Calendar className="h-3.5 w-3.5 text-amber-300" />
                    {event.endDate && !sameDay(event.date, event.endDate)
                      ? `${formatDateShort(event.date)} — ${formatDateShort(event.endDate)}`
                      : formatDate(event.date)}
                  </span>
                  {event.location && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm">
                      <MapPin className="h-3.5 w-3.5 text-amber-300" />
                      {event.location}
                    </span>
                  )}
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1.5 ${
                      registrationOpen
                        ? "bg-green-500/90 text-white"
                        : "bg-white/15 text-white/80"
                    }`}
                  >
                    {registrationOpen
                      ? "Registrations Open"
                      : event?.status === "registration_closed"
                        ? "Registrations Closed"
                        : "Registration Not Open"}
                  </span>
                </div>

              </>
            )}
          </div>
        </div>
      </section>

      {/* Body */}
      <section className="py-12 md:py-16 bg-white dark:bg-background">
        <div className="container mx-auto px-4">
          <Link
            href="/volunteer"
            className="mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to all volunteer opportunities
          </Link>

          <div className="mx-auto max-w-2xl">
            {loading ? (
              <div className="flex items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading event...
              </div>
            ) : notFound || !event ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-10 text-center shadow-warm"
              >
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h2 className="mb-2 text-xl font-bold text-foreground">
                  Event Not Found
                </h2>
                <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
                  We couldn&apos;t find this volunteer event. It may have been
                  removed or the link may be incorrect.
                </p>
                <Link href="/volunteer">
                  <Button className="rounded-full">
                    Browse Volunteer Opportunities
                  </Button>
                </Link>
              </motion.div>
            ) : !registrationOpen ? (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border bg-card p-10 text-center shadow-warm"
              >
                <Calendar className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
                <h2 className="mb-2 text-xl font-bold text-foreground">
                  {event.title}
                </h2>
                <p className="mx-auto mb-6 max-w-sm text-sm text-muted-foreground">
                  {event.status === "closed"
                    ? "Registrations for this event have closed."
                    : "Registration for this event is not open right now."}
                </p>
                <Link href="/volunteer">
                  <Button variant="outline" className="rounded-full">
                    Back to volunteer opportunities
                  </Button>
                </Link>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="text-center">
                  <p className="text-primary text-sm tracking-[0.2em] uppercase mb-3 font-medium">
                    Seva Registration
                  </p>
                  <Ornament className="mb-4" />
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-foreground">
                    Register for {event.title}
                  </h2>
                </div>
                <VolunteerRegistrationForm
                  event={event}
                  apiBase={API_URL}
                  variant="page"
                />
              </div>
            )}
          </div>
        </div>
      </section>
    </PageLayout>
  );
}

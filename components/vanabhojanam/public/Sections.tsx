"use client";

import { useState, type ReactNode } from "react";
import { BadgeIndianRupee, CalendarPlus, Leaf, MapPin, Navigation, QrCode, ScanLine, Ticket, CalendarDays } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { EVENT, HIGHLIGHTS, IMAGES, VANABHOJANA } from "@/lib/vanabhojanam/config";
import { downloadEventIcs, type PresentedEvent } from "@/lib/vanabhojanam/event";
import { formatINR } from "@/lib/vanabhojanam/format";
import { cn } from "@/lib/utils";
import { VbButton, vbButtonClass } from "../ui/Button";
import Reveal from "../ui/Reveal";
import SectionHeading from "../ui/SectionHeading";
import { useCurrentEvent } from "../context/CurrentEventContext";
import Figure from "./Figure";

// ───────────────────────── EventStrip ─────────────────────────

function Tile({ icon: Icon, label, children }: { icon: typeof MapPin; label: string; children: ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 md:p-4">
      <div className="rounded-xl bg-vb-brand-50 p-2.5 text-vb-brand-600">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex flex-col items-start">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-600">{label}</p>
        {children}
      </div>
    </div>
  );
}

export function EventStrip() {
  const { event } = useCurrentEvent();
  if (!event) return null;
  return (
    <div className="relative z-[2] mx-auto w-full max-w-5xl px-4 md:-mt-8 md:px-6">
      <Reveal>
        <div className="rounded-2xl border border-black/10 bg-white shadow-vb-soft">
          <div className="grid grid-cols-1 sm:grid-cols-3">
            <Tile icon={CalendarDays} label="Date">
              <p className="font-bold">{event.dateLabel}</p>
            </Tile>
            <Tile icon={MapPin} label="Venue">
              <p className="font-bold">{event.venue.name}</p>
              <p className="text-sm text-gray-600">{event.venue.address}</p>
            </Tile>
            <Tile icon={Ticket} label="Registration fee">
              {event.sameFee ? (
                <p className="font-bold">
                  <span className="text-vb-brand-600">{formatINR(event.fees.College.amount)}</span> {event.audience === "students" ? "per student" : event.audience === "working" ? "per person · working professionals" : "per person"}
                </p>
              ) : (
                <>
                  <p className="font-bold">
                    <span className="text-vb-brand-600">{formatINR(event.fees.College.amount)}</span> students
                  </p>
                  <p className="font-bold">
                    <span className="text-vb-brand-600">{formatINR(event.fees.Working.amount)}</span> working
                  </p>
                </>
              )}
            </Tile>
          </div>
          <div className="flex flex-col justify-center gap-3 px-4 pb-4 sm:flex-row">
            <VbButton size="sm" variant="outline" leftIcon={<CalendarPlus size={16} />} onClick={() => downloadEventIcs(event)}>
              Add to calendar
            </VbButton>
            <a href={event.venue.mapsUrl} target="_blank" rel="noopener noreferrer" className={vbButtonClass("outline", "sm")}>
              <Navigation size={16} />
              Get directions
            </a>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

// ───────────────────────── Highlights ─────────────────────────

function HighlightCard({ item }: { item: (typeof HIGHLIGHTS)[number] }) {
  const [active, setActive] = useState(false);
  return (
    <div
      className="h-full overflow-hidden rounded-2xl border border-black/30 bg-vb-brand-900 text-center transition-shadow duration-300 hover:shadow-vb-lift"
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onTouchStart={() => setActive(true)}
      onTouchEnd={() => setActive(false)}
    >
      <div style={{ backgroundImage: "radial-gradient(ellipse 70% 70% at 50% 55%, rgba(201,162,74,0.22), transparent 75%)" }}>
        <Figure name={item.figure} label={`Illustration: ${item.title}`} active={active} className="h-[120px] md:h-[170px]" />
      </div>
      <div className="px-2.5 pb-4 md:px-4 md:pb-5">
        <h3 className="font-vb-heading text-lg font-semibold text-white md:text-xl">{item.title}</h3>
        <p className="mt-1 text-xs text-white/70 md:text-sm">{item.text}</p>
      </div>
    </div>
  );
}

export function Highlights() {
  return (
    <section id="highlights" className="mx-auto mt-16 w-full max-w-6xl scroll-mt-[90px] px-4 md:mt-28 md:px-6">
      <SectionHeading eyebrow="What awaits you" title="One day. Four experiences." />
      <Reveal stagger={0.12} className="grid grid-cols-2 gap-3 md:gap-5 lg:grid-cols-4">
        {HIGHLIGHTS.map((item) => (
          <HighlightCard key={item.id} item={item} />
        ))}
      </Reveal>
    </section>
  );
}

// ───────────────────────── The story (What is Vanabhojanam?) ─────────────────────────

const SPARKS = [
  { left: "14%", top: "16%", delay: "0s" },
  { left: "34%", top: "9%", delay: "1.4s" },
  { left: "62%", top: "12%", delay: "0.7s" },
  { left: "80%", top: "24%", delay: "2.2s" },
  { left: "91%", top: "8%", delay: "3s" },
  { left: "50%", top: "30%", delay: "2.6s" },
];

/** Krishna and his friends sharing the forest meal: one painting, with light slowly drifting over it and fireflies. */
function MealScene({ label }: { label: string }) {
  return (
    <div role="img" aria-label={label} className="relative aspect-[4/3] w-full overflow-hidden bg-[#1a2a14]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGES.meal}
        alt=""
        draggable={false}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover"
        style={{ animation: "kcDrift 22s ease-in-out infinite alternate" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ backgroundImage: "linear-gradient(115deg, transparent 22%, rgba(255,236,170,0.16) 40%, transparent 54%)", animation: "kcRays 9s ease-in-out infinite" }}
      />
      {SPARKS.map((s, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute h-1 w-1 rounded-full bg-[#ffe9a8] shadow-[0_0_10px_3px_rgba(255,226,140,0.6)]"
          style={{ left: s.left, top: s.top, animation: `firefly 4.5s ease-in-out ${s.delay} infinite` }}
        />
      ))}
    </div>
  );
}

export function VanabhojanaStory() {
  return (
    <section id="about" className="relative mt-16 scroll-mt-[70px] overflow-hidden bg-vb-brand-800 py-14 text-white md:mt-28 md:py-24">
      <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6">
        <SectionHeading light eyebrow="The name" title={VANABHOJANA.title} />
        <div className="flex flex-col items-center gap-6 md:flex-row md:gap-12">
          <div className="w-full flex-[1.1] overflow-hidden rounded-2xl border border-white/20 shadow-[0_24px_48px_-26px_rgba(0,0,0,0.6)]">
            <MealScene label="Krishna and the cowherd boys sharing a meal in the forest" />
          </div>
          <div className="flex flex-1 flex-col items-start gap-5">
            <Reveal>
              <p className="text-base leading-[1.8] text-white/90 md:text-lg">{VANABHOJANA.lead}</p>
            </Reveal>
            <Reveal stagger={0.12} className="flex w-full flex-col gap-3">
              {VANABHOJANA.points.map((p) => (
                <div key={p} className="flex items-start gap-3 rounded-lg border border-white/20 bg-white/10 p-3">
                  <Leaf className="mt-1 h-5 w-5 shrink-0 text-vb-brass-300" />
                  <p>{p}</p>
                </div>
              ))}
            </Reveal>
          </div>
        </div>

        <Reveal stagger={0.12} className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 md:mt-14 md:gap-4 lg:grid-cols-4">
          {VANABHOJANA.steps.map((step, i) => (
            <div key={step.title} className="flex h-full gap-4 rounded-xl border border-white/20 bg-white/10 p-4 md:p-5 lg:flex-col">
              <p className="min-w-[1.4ch] font-vb-heading text-3xl font-medium leading-none text-vb-brass-300 lg:text-4xl">{i + 1}</p>
              <div>
                <p className="font-bold">{step.title}</p>
                <p className="mt-1 text-sm text-white/80">{step.text}</p>
              </div>
            </div>
          ))}
        </Reveal>

        <Reveal className="mx-auto mt-8 max-w-2xl text-center">
          <p className="font-vb-heading text-xl italic text-vb-brass-200 md:text-2xl">{VANABHOJANA.closing}</p>
        </Reveal>
      </div>
    </section>
  );
}

// ───────────────────────── How it works ─────────────────────────

const STEPS = [
  { icon: BadgeIndianRupee, title: "Register and pay", text: "Fill the short form and pay securely online." },
  {
    icon: QrCode,
    title: "Get your QR pass",
    text: "Your pass is sent to the WhatsApp number you registered with. Students receive it once their ID is verified.",
  },
  {
    icon: ScanLine,
    title: "Show it at the gate",
    text: "Bring your QR (and your student ID card if you registered as a student). One quick scan and you are in.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" className="mx-auto mt-16 w-full max-w-6xl scroll-mt-[90px] px-4 md:mt-28 md:px-6">
      <SectionHeading eyebrow="Simple" title="Three steps to your seat" />
      <Reveal stagger={0.14} className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-6">
        {STEPS.map((step, i) => (
          <div key={step.title} className="flex h-full flex-col rounded-2xl border border-black/10 bg-white p-5 shadow-vb-soft md:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div className="flex h-[52px] w-[52px] items-center justify-center rounded-xl bg-vb-brand-600 text-white">
                <step.icon size={24} />
              </div>
              <p className="font-vb-heading text-5xl font-medium leading-none text-vb-brass-400">{i + 1}</p>
            </div>
            <h3 className="font-vb-heading text-2xl font-semibold text-vb-brand-700">{step.title}</h3>
            <p className="mt-2 text-gray-600">{step.text}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}

// ───────────────────────── FAQ ─────────────────────────

/** Answers built from the current event, so they never go stale from year to year. */
function buildFaqs(event: PresentedEvent | null): { q: string; a: ReactNode }[] {
  const items: { q: string; a: ReactNode }[] = [];
  if (event) {
    items.push({
      q: "Who can join?",
      a:
        event.audience === "students"
          ? "This edition is open to college students. You will need to upload your student ID card while registering."
          : event.audience === "working"
            ? "This edition is open to working professionals."
            : "Students and working youth are both welcome.",
    });
    items.push({
      q: "How much is the registration fee?",
      a: event.audience !== "both"
        ? `${formatINR(event.fees.College.amount)} per person.`
        : event.sameFee
        ? `${formatINR(event.fees.College.amount)} per person, for students and working professionals alike.`
        : `${formatINR(event.fees.College.amount)} for students and ${formatINR(event.fees.Working.amount)} for working professionals.`,
    });
    items.push({
      q: "When and where is it?",
      a: `${event.dateLabel}${event.venue.name ? ` at ${event.venue.name}` : ""}${event.venue.address ? `, ${event.venue.address}` : ""}. Use the "Get directions" button near the top to open the map.`,
    });
  }
  items.push(
    {
      q: "What should I bring?",
      a: "Your QR pass from WhatsApp and, if you registered as a student, your student ID card for verification.",
    },
    {
      q: "I did not get my QR. What now?",
      a: "Your QR is sent only to the WhatsApp number you registered with. Students receive it after their ID is verified. If it has not arrived, contact us and we will resend it.",
    },
    {
      q: "Can I register friends or family?",
      a: "Yes. Each person registers separately. If you use the same WhatsApp number, you can see all of their QR codes together on one page, and each person scans their own at the gate.",
    },
    {
      q: "Who do I contact with questions?",
      a: (
        <>
          Write to{" "}
          <a href={`mailto:${EVENT.contact.email}`} className="font-bold text-vb-brand-600 underline">
            {EVENT.contact.email}
          </a>
          , or call{" "}
          <a href={`tel:${EVENT.contact.phone}`} className="font-bold text-vb-brand-600 underline">
            {EVENT.contact.phoneLabel}
          </a>
          .
        </>
      ),
    }
  );
  return items;
}

export function Faq() {
  const { event } = useCurrentEvent();
  const faqs = buildFaqs(event);
  return (
    <section id="faq" className="mx-auto mt-16 w-full max-w-3xl scroll-mt-[90px] px-4 md:mt-28 md:px-6">
      <SectionHeading eyebrow="Good to know" title="Questions, answered" />
      <Reveal>
        <Accordion type="single" collapsible defaultValue="faq-0" className="flex flex-col gap-3">
          {faqs.map((f, i) => (
            <AccordionItem
              key={f.q}
              value={`faq-${i}`}
              className={cn("overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_12px_28px_-24px_rgba(32,96,61,0.6)]")}
            >
              <AccordionTrigger className="px-4 py-4 text-left text-base font-bold hover:bg-black/[0.03] hover:no-underline md:px-6 md:text-lg">{f.q}</AccordionTrigger>
              <AccordionContent className="px-4 pb-5 text-gray-600 md:px-6">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
    </section>
  );
}

// ───────────────────────── Registration closed ─────────────────────────

/** Shown instead of the form when there is no edition, or its registration is closed. */
export function RegistrationClosed({ event, loading }: { event: PresentedEvent | null; loading: boolean }) {
  if (loading) {
    return (
      <div className="flex justify-center py-10">
        <div className="h-8 w-8 animate-spin rounded-full border-[3px] border-vb-brand-500 border-t-transparent" role="status" aria-label="Loading" />
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-6 text-center shadow-xl md:p-10">
      <h3 className="font-vb-heading text-3xl font-semibold text-vb-brand-700">{event ? "Registration is closed" : "Registration opens soon"}</h3>
      <p className="mt-3 text-gray-600">
        {event
          ? `Thank you for your interest in ${event.name}. Registrations are not being accepted right now.`
          : "The next Vanabhojanam has not been announced yet. Please check back soon."}
      </p>
      <p className="mt-2 text-sm text-gray-600">
        Questions?{" "}
        <a href={`mailto:${EVENT.contact.email}`} className="underline">
          {EVENT.contact.email}
        </a>
      </p>
    </div>
  );
}


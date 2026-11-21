import { EVENT } from "./config";

const ORDINAL = (n: number) =>
  n % 100 >= 11 && n % 100 <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" } as Record<number, string>)[n % 10] || "th";

/** "Sunday, 8th November 2026". Event dates are calendar days stored at UTC midnight, so format in UTC. */
export function formatEventDate(date?: string | Date | null): string {
  const d = new Date(date as string);
  if (Number.isNaN(d.getTime())) return "";
  const weekday = d.toLocaleDateString("en-IN", { weekday: "long", timeZone: "UTC" });
  const month = d.toLocaleDateString("en-IN", { month: "long", timeZone: "UTC" });
  const day = d.getUTCDate();
  return `${weekday}, ${day}${ORDINAL(day)} ${month} ${d.getUTCFullYear()}`;
}

export const toDateInput = (date?: string | Date | null) => (date ? new Date(date).toISOString().slice(0, 10) : "");

const mapsLink = (venue: { name?: string; address?: string; mapsUrl?: string }) =>
  venue.mapsUrl ||
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([venue.name, venue.address].filter(Boolean).join(" "))}`;

export interface PresentedEvent {
  id: string;
  name: string;
  title: string;
  year: string;
  dateISO: string;
  dateLabel: string;
  registrationOpen: boolean;
  /** Who the edition is open to. */
  audience: "both" | "students" | "working";
  /** Shown next to the fee, e.g. "for students"; empty when open to everyone. */
  audienceNote: string;
  /** True when only one amount applies (same fee for both, or only one group may register): show a single amount. */
  sameFee: boolean;
  venue: { name: string; address: string; short: string; mapsUrl: string };
  fees: {
    College: { amount: number; label: string; hint: string };
    Working: { amount: number; label: string; hint: string };
  };
}

/** API event -> the shape the pages render (labels, per-type fee info). */
export function presentEvent(api: any): PresentedEvent | null {
  if (!api) return null;
  const dateISO = toDateInput(api.date);
  const audience: "both" | "students" | "working" = api.audience === "students" || api.audience === "working" ? api.audience : "both";
  // A closed-off group has no fee; show the open group's fee everywhere so the pages stay simple.
  const college = audience === "working" ? api.fees.working : api.fees.college;
  const working = audience === "students" ? api.fees.college : api.fees.working;
  return {
    id: api.id,
    name: api.name,
    title: api.name,
    year: dateISO.slice(0, 4),
    dateISO,
    dateLabel: formatEventDate(api.date),
    registrationOpen: Boolean(api.registrationOpen),
    audience,
    audienceNote: audience === "students" ? "for students" : audience === "working" ? "for working professionals" : "",
    sameFee: audience !== "both" || Number(college) === Number(working),
    venue: {
      name: api.venue?.name || "",
      address: api.venue?.address || "",
      short: api.venue?.name || "",
      mapsUrl: mapsLink(api.venue || {}),
    },
    fees: {
      College: { amount: college, label: "Student Rate", hint: "College student" },
      Working: { amount: working, label: "Professional Rate", hint: "Others" },
    },
  };
}

// ---- calendar (.ics) ----

const compact = (iso: string) => iso.replaceAll("-", "");

const nextDay = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
};

/** All-day .ics for the festival (timings are not published, so none are invented). */
export const buildEventIcs = (event: PresentedEvent) =>
  [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Kartika Vanabhojanam//EN",
    "BEGIN:VEVENT",
    `UID:vanabhojanam-${event.dateISO}@iskconkakinada.org`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
    `DTSTART;VALUE=DATE:${compact(event.dateISO)}`,
    `DTEND;VALUE=DATE:${compact(nextDay(event.dateISO))}`,
    `SUMMARY:${event.title}`,
    `LOCATION:${event.venue.name}\\, ${event.venue.address}`,
    `DESCRIPTION:${EVENT.tagline}. Organised by ${EVENT.organiser}.`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

export const downloadEventIcs = (event: PresentedEvent) => {
  const blob = new Blob([buildEventIcs(event)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "vanabhojanam.ics";
  a.click();
  URL.revokeObjectURL(url);
};

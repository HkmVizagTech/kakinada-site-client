/**
 * "Major festival" shown in the navbar.
 *
 * One major festival is highlighted in the top navigation at a time. By
 * default it is picked automatically from the Vaishnava calendar 2026 — the
 * major celebration whose date is closest to today (within a small window) —
 * but every festival in this registry must also have a real page on the
 * site, which is what "if it has a page" means here. Admins can override the
 * pick (or hide it) through Admin → Content → Navigation, stored on the
 * server.
 *
 * Ported from Hare Krishna Movement Vizag's navbar. Kakinada currently has
 * pages for Janmashtami, Govardhan Puja and Chaturmas (no Radhashtami page),
 * so the registry below only lists those three.
 */

import { vaishnavaCalendar2026 } from "@/lib/vaishnavaCalendarData";

export type MajorFestivalKey = "janmashtami" | "govardhan" | "chaturmas";

export interface MajorFestival {
  key: MajorFestivalKey;
  label: string;
  href: string;
}

/** Only festivals with a dedicated page on the site belong here. */
export const MAJOR_FESTIVALS: MajorFestival[] = [
  { key: "janmashtami", label: "Janmashtami", href: "/janmashtami" },
  { key: "govardhan", label: "Govardhan Puja", href: "/govardhan-puja" },
  { key: "chaturmas", label: "Chaturmas", href: "/chaturmas" },
];

const FESTIVAL_KEYWORDS: Record<MajorFestivalKey, string[]> = {
  janmashtami: ["janmashtami", "nandotsav"],
  govardhan: ["govardhan"],
  chaturmas: ["chaturmas", "chaturmasya"],
};

// A festival counts as "current" from two weeks before to ten days after its
// celebration date — long enough to bridge the gap between consecutive major
// festivals without stale highlights lingering.
const DAYS_BEFORE = 14;
const DAYS_AFTER = 10;

export function findByKey(key: string | null | undefined): MajorFestival | null {
  if (!key) return null;
  return MAJOR_FESTIVALS.find((f) => f.key === key) ?? null;
}

function keyForCalendarTitle(title: string): MajorFestivalKey | null {
  const t = title.toLowerCase();
  for (const festival of MAJOR_FESTIVALS) {
    if (FESTIVAL_KEYWORDS[festival.key].some((kw) => t.includes(kw))) return festival.key;
  }
  return null;
}

/** Auto-pick the current major festival from the Vaishnava calendar. */
export function resolveCurrentFestival(now: Date = new Date()): MajorFestival | null {
  const dayMs = 86_400_000;
  const windowBefore = DAYS_BEFORE * dayMs;
  const windowAfter = DAYS_AFTER * dayMs;
  const nowTs = now.getTime();

  let best: { festival: MajorFestival; dist: number } | null = null;
  for (const entry of vaishnavaCalendar2026) {
    const key = keyForCalendarTitle(entry.title);
    if (!key) continue;
    const festival = findByKey(key);
    if (!festival) continue;
    const festivalTs = new Date(`${entry.date}T00:00:00Z`).getTime();
    const dist = festivalTs - nowTs;
    if (dist > windowAfter || dist < -windowBefore) continue;
    const abs = Math.abs(dist);
    if (!best || abs < best.dist) best = { festival, dist: abs };
  }
  return best?.festival ?? null;
}

/**
 * Resolve the festival to display, given the admin override stored on the
 * server (`"auto"` keeps automatic selection, `"none"` hides the highlight,
 * anything else must be a registry key).
 */
export function resolveMajorFestival(override?: string | null): MajorFestival | null {
  // No stored preference (or "none") → show nothing. An admin can pin a
  // festival explicitly via Admin → Content → Navigation, or opt into the
  // automatic pick with "auto".
  if (!override || override === "none") return null;
  if (override === "auto") return resolveCurrentFestival();
  return findByKey(override);
}

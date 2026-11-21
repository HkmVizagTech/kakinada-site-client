"use client";

import Image from "next/image";
import { ArrowDown, CalendarDays, MapPin, Sparkles } from "lucide-react";
import { EVENT, IMAGES } from "@/lib/vanabhojanam/config";
import { useCountdown } from "@/lib/vanabhojanam/hooks";
import { formatINR } from "@/lib/vanabhojanam/format";
import { cn } from "@/lib/utils";
import { VbButton } from "../ui/Button";
import { useCurrentEvent } from "../context/CurrentEventContext";

// Deterministic pseudo-random so the skyline is identical on every render (and on server and client).
const rng = (seed: number) => () => (seed = (seed * 9301 + 49297) % 233280) / 233280;

function treeLine(seed: number, count: number, minH: number, maxH: number) {
  const rand = rng(seed);
  const step = 1440 / count;
  let d = "";
  for (let i = 0; i <= count; i++) {
    const x = i * step + (rand() - 0.5) * step * 0.6;
    const h = minH + rand() * (maxH - minH);
    const w = step * (0.45 + rand() * 0.35);
    d += `M${(x - w).toFixed(1)},300 C${(x - w).toFixed(1)},${(300 - h * 0.55).toFixed(1)} ${(x - w * 0.3).toFixed(1)},${(300 - h * 0.85).toFixed(1)} ${x.toFixed(1)},${(300 - h).toFixed(1)} C${(x + w * 0.3).toFixed(1)},${(300 - h * 0.85).toFixed(1)} ${(x + w).toFixed(1)},${(300 - h * 0.55).toFixed(1)} ${(x + w).toFixed(1)},300 Z `;
  }
  return d;
}
const FOREST_BACK = treeLine(11, 17, 110, 220);
const FOREST_FRONT = treeLine(29, 11, 60, 140);
const FIREFLIES = Array.from({ length: 16 }, (_, i) => {
  const r = rng(100 + i);
  return { left: `${(6 + r() * 88).toFixed(2)}%`, top: `${(18 + r() * 52).toFixed(2)}%`, delay: `${(r() * 5).toFixed(1)}s`, size: 2 + Math.round(r() * 2) };
});

/** A quiet forest skyline with a few fireflies: the "vana" in Vanabhojanam, kept minimal. */
function HeroBackdrop() {
  return (
    <>
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[150px] md:h-[240px]">
        <svg viewBox="0 0 1440 300" preserveAspectRatio="none" width="100%" height="100%">
          <path d={FOREST_BACK} fill="#10281d" />
          <path d={FOREST_FRONT} fill="#0b1c15" />
          <rect x="0" y="296" width="1440" height="4" fill="#0b1c15" />
        </svg>
      </div>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        {FIREFLIES.map((f, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-[#f1d58a] shadow-[0_0_8px_2px_rgba(241,213,138,0.55)]"
            style={{ left: f.left, top: f.top, width: f.size, height: f.size, animation: `firefly 4.5s ease-in-out ${f.delay} infinite` }}
          />
        ))}
      </div>
    </>
  );
}

function Countdown({ dateISO }: { dateISO: string }) {
  const left = useCountdown(`${dateISO}T00:00:00+05:30`);
  if (!left) return null;
  const cells: [string, number][] = [
    ["Days", left.days],
    ["Hours", left.hours],
    ["Mins", left.minutes],
    ["Secs", left.seconds],
  ];
  return (
    <div className="flex gap-2" role="timer" aria-label="Time until the festival">
      {cells.map(([label, n]) => (
        <div key={label} className="flex min-w-[60px] flex-col items-center rounded-lg border border-white/20 bg-white/10 py-2.5 md:min-w-[68px]">
          <span className="text-2xl font-semibold leading-none text-white tabular-nums md:text-3xl">{String(n).padStart(2, "0")}</span>
          <span className="mt-1 text-[10px] font-bold uppercase tracking-widest text-white/70">{label}</span>
        </div>
      ))}
    </div>
  );
}

/** Staggered entrance without a JS animation library: each piece rises in turn (skipped when motion is reduced). */
const rise = (i: number) => ({ animation: `vb-rise 0.9s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.1}s both` });

export default function Hero({ onRegister }: { onRegister: () => void }) {
  const { event } = useCurrentEvent();
  const closed = event && !event.registrationOpen;

  return (
    <section
      className="relative overflow-hidden bg-vb-night pb-28 pt-[110px] text-white md:pb-44 md:pt-[150px]"
      style={{
        backgroundImage: `radial-gradient(ellipse 55% 55% at 50% 38%, rgba(10,21,17,0.55), transparent 80%), linear-gradient(180deg, rgba(10,21,17,0.80) 0%, rgba(10,21,17,0.74) 55%, rgba(10,21,17,0.94) 100%), url(${IMAGES.forest})`,
        backgroundSize: "cover",
        backgroundPosition: "center bottom",
      }}
    >
      <HeroBackdrop />
      <div className="relative z-[1] mx-auto w-full max-w-6xl px-4 md:px-6">
        <div className="flex justify-center">
          <div className="flex max-w-3xl flex-col items-center gap-4 text-center md:gap-6">
            {event ? (
              <div
                style={rise(0)}
                className="flex flex-col items-center justify-center gap-x-3 gap-y-1.5 rounded-2xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-medium text-white/90 md:flex-row md:rounded-full md:px-4 md:py-2"
              >
                <span className="flex items-center gap-2">
                  <CalendarDays size={16} />
                  {event.dateLabel}
                </span>
                {event.venue.short && (
                  <>
                    <span className="hidden opacity-40 md:block">·</span>
                    <span className="flex items-center gap-2">
                      <MapPin size={16} />
                      {event.venue.short}
                    </span>
                  </>
                )}
              </div>
            ) : (
              <div style={rise(0)} className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90">
                <Sparkles size={16} />
                <span>Dates for the next Vanabhojanam will be announced soon</span>
              </div>
            )}

            <h1 aria-label={EVENT.name} className="font-vb-heading font-semibold leading-[0.95]">
              <span style={rise(1)} className="mb-1 block text-2xl font-medium italic uppercase tracking-[0.28em] text-vb-brass-300 md:mb-2 md:text-4xl">
                Kartika
              </span>
              <span
                style={{
                  ...rise(2),
                  backgroundImage: "linear-gradient(100deg, #ffffff 0%, #ffffff 42%, #f1d58a 50%, #ffffff 58%, #ffffff 100%)",
                  backgroundSize: "250% 100%",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  animation: `vb-rise 0.9s cubic-bezier(0.22,1,0.36,1) 0.3s both, heroSheen 3.2s ease-out 1.1s 1 both`,
                }}
                className="-mb-[0.25em] block pb-[0.25em] pr-[0.05em] text-[1.9rem] tracking-[0.06em] sm:text-5xl md:text-7xl lg:text-8xl"
              >
                VANABHOJANAM
              </span>
            </h1>

            <p style={rise(3)} className="font-vb-heading text-lg italic text-white/80 md:text-xl">
              {EVENT.tagline}
            </p>
            <div style={rise(3)} aria-hidden="true" className="h-px w-[72px] bg-vb-brass-400" />
            <p style={rise(4)} className="max-w-xl text-base text-white/80 md:text-lg">
              A day away from screens: spiritual talks, games, ecstatic kirtan and a shared prasadam feast.
            </p>

            {event && (
              <div style={rise(5)}>
                <Countdown dateISO={event.dateISO} />
              </div>
            )}

            <div style={rise(6)} className="flex flex-wrap justify-center gap-3">
              <VbButton variant="brass" size="lg" rightIcon={<ArrowDown size={18} />} onClick={onRegister}>
                {closed ? "Registration closed" : "Register Now"}
              </VbButton>
            </div>

            {event && (
              <p style={rise(7)} className="font-semibold text-vb-brass-200">
                {event.sameFee
                  ? `${formatINR(event.fees.College.amount)} registration${event.audienceNote ? ` · ${event.audienceNote}` : ""}`
                  : `${formatINR(event.fees.College.amount)} students · ${formatINR(event.fees.Working.amount)} working`}
              </p>
            )}

            <div style={rise(8)} className={cn("flex flex-col items-center gap-2 pt-1 text-center md:flex-row md:gap-3")}>
              <Image src={IMAGES.logo} alt="" width={34} height={34} className="h-[34px] w-[34px] rounded-full" unoptimized />
              <p className="text-sm text-white/70">
                Organised by
                <span className="block font-semibold text-white md:ml-1 md:inline">{EVENT.organiser}</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

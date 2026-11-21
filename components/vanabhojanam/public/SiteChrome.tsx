"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { CalendarDays, Mail, MapPin, Phone } from "lucide-react";
import { EVENT, IMAGES, MAHAMANTRA } from "@/lib/vanabhojanam/config";
import { TEMPLE } from "@/lib/templeInfo";
import { cn } from "@/lib/utils";
import { VbButton, vbButtonClass } from "../ui/Button";
import Reveal from "../ui/Reveal";
import { useCurrentEvent } from "../context/CurrentEventContext";

const LINKS = [
  { id: "highlights", label: "Highlights" },
  { id: "about", label: "About" },
  { id: "how", label: "How it works" },
  { id: "faq", label: "FAQ" },
];

const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

/** Fixed top bar: transparent over the hero, frosted glass once the page scrolls. */
export function SiteHeader({ onRegister }: { onRegister: () => void }) {
  const { event } = useCurrentEvent();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const registerLabel = event && !event.registrationOpen ? "Closed" : "Register";

  return (
    <header
      className={cn("fixed inset-x-0 top-0 z-40 transition-all duration-300", scrolled ? "bg-[rgba(10,21,17,0.92)] backdrop-blur-[10px]" : "bg-transparent")}
      // Fine brass diagonal hatching: texture without noise.
      style={scrolled ? { backgroundImage: "repeating-linear-gradient(135deg, rgba(201,162,74,0.07) 0 1px, transparent 1px 9px)" } : undefined}
    >
      <div
        aria-hidden="true"
        className={cn("absolute inset-x-0 bottom-0 h-px transition-opacity duration-300", scrolled ? "opacity-100" : "opacity-0")}
        style={{ backgroundImage: "linear-gradient(to right, transparent, rgba(201,162,74,0.75) 20%, rgba(201,162,74,0.75) 80%, transparent)" }}
      />
      <div className="mx-auto flex h-[60px] w-full max-w-6xl items-center justify-between gap-4 px-4 md:h-[68px] md:px-6">
        <a href="/vanabhojanam" aria-label="Kartika Vanabhojanam home" className="flex items-center gap-3">
          <Image src={IMAGES.logo} alt="" width={42} height={42} className="h-9 w-9 rounded-full md:h-[42px] md:w-[42px]" unoptimized />
          <span className="font-vb-heading text-lg font-bold leading-[1.05] text-white md:text-2xl">Kartika Vanabhojanam</span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-1 lg:flex">
          {LINKS.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => scrollTo(l.id)}
              className="rounded-lg px-3 py-2 text-sm font-semibold text-white/80 transition-colors hover:bg-white/20 hover:text-white"
            >
              {l.label}
            </button>
          ))}
        </nav>

        <VbButton size="sm" variant="brass" className="px-5" onClick={onRegister}>
          {registerLabel}
        </VbButton>
      </div>
    </header>
  );
}

function FooterLink({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: string }) {
  return (
    <button type="button" className={cn("text-left text-sm text-white/80 transition-colors hover:text-vb-brass-200", className)} {...props}>
      {children}
    </button>
  );
}

const heading = "text-xs font-extrabold uppercase tracking-[0.2em] text-vb-brass-200";

export function SiteFooter() {
  const { event } = useCurrentEvent();
  return (
    <footer className="relative mt-20 overflow-hidden bg-vb-brand-800 pb-8 pt-14 text-white md:mt-28 md:pt-20">
      <div className="relative mx-auto w-full max-w-6xl px-4 md:px-6">
        <Reveal className="mx-auto max-w-3xl text-center">
          <p className="font-vb-deva text-lg leading-[1.9] text-vb-brass-200 md:text-2xl">{MAHAMANTRA.devanagari}</p>
          <p className="mt-2 font-vb-heading text-base italic opacity-90 md:text-lg">{MAHAMANTRA.roman}</p>
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-10 border-t border-white/20 pt-10 md:mt-16 md:grid-cols-3 md:gap-12 md:pt-12">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Image src={IMAGES.logo} alt="" width={46} height={46} className="h-[46px] w-[46px] rounded-full" unoptimized />
              <p className="font-vb-heading text-xl font-semibold">Kartika Vanabhojanam</p>
            </div>
            <p className="max-w-xs text-sm text-white/80">
              {EVENT.tagline}. Organised by {EVENT.organiser} ({EVENT.organiserFull}).
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <p className={heading}>Explore</p>
            <FooterLink onClick={() => scrollTo("highlights")}>Highlights</FooterLink>
            <FooterLink onClick={() => scrollTo("how")}>How it works</FooterLink>
            <FooterLink onClick={() => scrollTo("faq")}>FAQ</FooterLink>
            <a href="/vanabhojanam/attendance" className="text-sm text-white/80 transition-colors hover:text-vb-brass-200">
              View my QR code
            </a>
          </div>

          <div className="flex flex-col gap-3">
            <p className={heading}>Visit &amp; contact</p>
            {event && (
              <>
                <p className="flex items-start gap-2 text-sm text-white/90">
                  <CalendarDays size={16} className="mt-[3px] shrink-0" />
                  {event.dateLabel}
                </p>
                {(event.venue.name || event.venue.address) && (
                  <p className="flex items-start gap-2 text-sm text-white/90">
                    <MapPin size={16} className="mt-[3px] shrink-0" />
                    {[event.venue.name, event.venue.address].filter(Boolean).join(", ")}
                  </p>
                )}
                <a
                  href={event.venue.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={vbButtonClass("outline", "sm", "w-fit border-white/40 bg-transparent text-white hover:bg-white/20")}
                >
                  Open in Maps
                </a>
              </>
            )}
            <p className="flex items-start gap-2 text-sm text-white/80">
              <MapPin size={16} className="mt-[3px] shrink-0" />
              <span>{TEMPLE.addressOneLine}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Mail size={16} />
              <a href={`mailto:${EVENT.contact.email}`} className="text-white/80 transition-colors hover:text-vb-brass-200">
                {EVENT.contact.email}
              </a>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Phone size={16} />
              <a href={`tel:${EVENT.contact.phone}`} className="text-white/80 transition-colors hover:text-vb-brass-200">
                {EVENT.contact.phoneLabel}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-12 flex flex-col justify-between gap-2 border-t border-white/20 pt-6 text-center text-xs text-white/70 sm:flex-row">
          <p>
            © {new Date().getFullYear()} {EVENT.organiser}
          </p>
          <p>Hare Krishna 🙏</p>
        </div>
      </div>
    </footer>
  );
}

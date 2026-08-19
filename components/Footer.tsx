"use client";

import { Facebook, Instagram, Youtube, Phone, Mail, Heart, ArrowUp, ExternalLink, Clock, Navigation } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Founder", href: "/founder" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Blogs", href: "/blogs" },
];

const sevaLinks = [
  { label: "Volunteer", href: "/volunteer" },
  { label: "Subhojanam", href: "/subhojanam" },
  { label: "Anna-Daan Seva", href: "/anna-daan-seva" },
  { label: "Daily Schedule", href: "/daily-schedule" },
  { label: "Donate", href: "/donate" },
  { label: "Contact Us", href: "/contact" },
];

const scheduleItems = [
  "Mangala Aarti - 4:30 AM",
  "Shringar Aarti - 7:30 AM",
  "Bhagavatam Class - 8:15 AM",
  "Rajbhog Aarti - 12:00 PM",
  "Dhoop Aarti - 4:30 PM",
  "Sandhya Aarti - 7:00 PM",
  "Shayan Aarti - 8:15 PM",
];

// Srila Prabhupada's ISKCON Visakhapatnam — Google Maps embed (no API key
// needed via the classic output=embed URL) and a directions link (the short
// link resolves to the same listing), so visitors can navigate straight there.
const MAPS_EMBED_URL =
  "https://maps.google.com/maps?q=ISKCON+Kakinada&z=15&output=embed";

const MAPS_DIRECTIONS_URL =
  "";

const Footer = () => {
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <footer className="relative">
      <div className="bg-gradient-navy py-8">
        <div className="container mx-auto flex flex-col items-center justify-between gap-6 px-4 md:flex-row">
          <div>
            <h3 className="text-2xl font-bold text-white md:text-3xl">
              Support the Temple Mission
            </h3>
            <p className="mt-1 max-w-lg text-white/80">
              Your generous contribution helps us serve prasadam, conduct festivals, and spread devotion.
            </p>
          </div>
          <Button size="lg" variant="secondary" className="shrink-0 rounded-full px-8 text-base font-semibold" asChild>
            <Link href="/donate">
              Donate Now <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-[hsl(220,60%,10%)] pb-6 pt-10">
        <div className="container mx-auto px-4">
          <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-[auto_1fr] lg:gap-10">
            <div>
              <div className="mb-4">
                <span className="block text-xl font-bold leading-tight text-[hsl(210,30%,97%)]">Hare Krishna Movement</span>
                <span className="text-xs uppercase tracking-widest text-[hsl(210,30%,97%)]/60">Kakinada</span>
              </div>
              {/* Map beside the address — keeps the card compact instead of
                  stacking everything vertically and stretching the footer */}
              <div className="mb-4 flex items-start gap-3">
                <div className="relative h-48 w-48 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-lg">
                  <iframe
                    src={MAPS_EMBED_URL}
                    title="Hare Krishna Vaikuntham Temple location on Google Maps"
                    className="absolute inset-0 h-full w-full border-0"
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
                <div className="flex min-w-0 flex-col gap-3">
                  <address className="max-w-[220px] text-sm leading-relaxed text-[hsl(210,30%,97%)]/60 not-italic">
                    Chaitanya Bhavan,
                    <br />
                    Hare Krishna Vaikuntham Cultural Centre,
                    <br />
                    IIM Rd, opp. Akshaya Patra Foundation, Gambhiram,
                    <br />
                    Kakinada,
                    <br />
                    Andhra Pradesh 531163
                  </address>
                  <a
                    href={MAPS_DIRECTIONS_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-fit items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
                  >
                    <Navigation className="h-4 w-4" />
                    Get Directions
                  </a>
                </div>
              </div>
              <div className="mb-4 flex gap-3">
                {[
                  { icon: Youtube, href: "https://www.youtube.com/user/harekrishnavizag", label: "YouTube" },
                  { icon: Instagram, href: "https://www.instagram.com/harekrishnavizag/", label: "Instagram" },
                  { icon: Facebook, href: "https://www.facebook.com/hkm.vizag/", label: "Facebook" },
                ].map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[hsl(210,30%,97%)]/60 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
                  >
                    <social.icon className="h-4 w-4" />
                  </a>
                ))}
                <a
                  key="whatsapp"
                  href="https://whatsapp.com/channel/0029VaZDEG67T8bWHjibTy2u"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Join Channel on WhatsApp"
                  className="flex h-10 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[hsl(210,30%,97%)]/60 transition-all duration-300 hover:bg-[#25D366] hover:text-white"
                >
                  <WhatsAppIcon className="h-4 w-4 fill-current" />
                  <span className="text-xs font-semibold">Join Channel</span>
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-3">
              <div>
                <h4 className="relative mb-4 text-lg font-semibold text-[hsl(210,30%,97%)]">
                  Daily Schedule
                <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-primary" />
              </h4>
              <div className="mt-3 space-y-1.5">
                {scheduleItems.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-[hsl(210,30%,97%)]/50">
                    <Clock className="h-3 w-3 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="relative mb-4 text-lg font-semibold text-[hsl(210,30%,97%)]">
                Quick Links
                <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-primary" />
              </h4>
              <div className="mt-3 space-y-2">
                {quickLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-[hsl(210,30%,97%)]/50 transition-all duration-200 hover:translate-x-1 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="relative mb-4 text-lg font-semibold text-[hsl(210,30%,97%)]">
                Get in Touch
                <span className="absolute -bottom-2 left-0 h-0.5 w-8 rounded-full bg-primary" />
              </h4>
              <div className="mt-3 space-y-2.5">
                {sevaLinks.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="block text-sm text-[hsl(210,30%,97%)]/50 transition-all duration-200 hover:translate-x-1 hover:text-primary"
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="tel:+918977761187"
                  className="group mt-4 flex items-start gap-3 text-sm text-[hsl(210,30%,97%)]/50 transition-colors hover:text-primary"
                >
                  <Phone className="mt-0.5 h-4 w-4 shrink-0 group-hover:text-primary" />
                  <span>+91 89777 61187</span>
                </a>
                <a
                  href="mailto:"
                  className="group flex items-start gap-3 text-sm text-[hsl(210,30%,97%)]/50 transition-colors hover:text-primary"
                >
                  <Mail className="mt-0.5 h-4 w-4 shrink-0 group-hover:text-primary" />
                  <span>Contact us</span>
                </a>
              </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-5 md:flex-row">
            <p className="flex items-center gap-1 text-sm text-[hsl(210,30%,97%)]/40">
              Copyright {new Date().getFullYear()} Hare Krishna Movement India, Kakinada. Made with
              <Heart className="h-3.5 w-3.5 fill-primary text-primary" /> for devotion.
            </p>
            <div className="flex items-center gap-4 text-xs text-[hsl(210,30%,97%)]/40">
              <Link href="/privacy-policy" className="transition-colors hover:text-primary">Privacy Policy</Link>
              <span className="text-[hsl(210,30%,97%)]/20">·</span>
              <Link href="/terms-and-conditions" className="transition-colors hover:text-primary">Terms</Link>
              <span className="text-[hsl(210,30%,97%)]/20">·</span>
              <Link href="/refund-policy" className="transition-colors hover:text-primary">Refunds</Link>
            </div>
            <button
              onClick={scrollToTop}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[hsl(210,30%,97%)]/60 transition-all duration-300 hover:bg-primary hover:text-primary-foreground"
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

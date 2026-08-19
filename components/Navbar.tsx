"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, Sun, Moon, Clock, Heart, ChevronDown, Home, User, Utensils, Info } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import ISKLogo from "@/assets/ISKCONGambheeramLogo.jpeg";
import HKVTLogo from "@/assets/HKVTLogo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { navEntries, isGroupActive } from "@/lib/navConfig";
import { NavListItem } from "@/components/NavListItem";

// ── Mobile: exact original flat link list (matches production site) ─
const mobileNavItems = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  { label: "Founder", href: "/founder" },
  { label: "Volunteer", href: "/volunteer" },
  { label: "Gallery", href: "/gallery" },
  { label: "Events", href: "/events" },
  { label: "Blog", href: "/blogs" },
  { label: "Schedule", href: "/daily-schedule" },
  { label: "Subhojanam", href: "/subhojanam" },
  { label: "Anna-Daan", href: "/anna-daan-seva" },
  { label: "Contact", href: "/contact" },
];

// ── Mobile bottom bar (matches production site) ────────────────────
const bottomNavItems = [
  { label: "Home", href: "/", icon: Home },
  { label: "Founder", href: "/founder", icon: User },
  { label: "Subhojanam", href: "/subhojanam", icon: Utensils },
  { label: "About Us", href: "/about", icon: Info },
];

// ── Real temple darshan windows ──────────────────────────────────────
const DARSHAN_WINDOWS = [
  { startMin: 4 * 60 + 30, endMin: 5 * 60, label: "Darshan Open · 4:30 AM – 5:00 AM" },
  { startMin: 7 * 60 + 15, endMin: 12 * 60 + 20, label: "Darshan Open · 7:15 AM – 12:20 PM" },
  { startMin: 16 * 60 + 15, endMin: 20 * 60 + 15, label: "Darshan Open · 4:15 PM – 8:15 PM" },
];

const getDarshanStatus = () => {
  const istNow = new Date(
    new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );
  const minutesNow = istNow.getHours() * 60 + istNow.getMinutes();

  const activeWindow = DARSHAN_WINDOWS.find(
    (w) => minutesNow >= w.startMin && minutesNow < w.endMin
  );
  if (activeWindow) return { isOpen: true, label: activeWindow.label };

  const nextWindow = DARSHAN_WINDOWS.find((w) => minutesNow < w.startMin);
  const reopenLabel = nextWindow
    ? `Reopens ${nextWindow.label.split("· ")[1].split(" – ")[0]}`
    : "Reopens 4:30 AM";
  return { isOpen: false, label: `Darshan Closed · ${reopenLabel}` };
};

// ── Helper: returns true if the href matches the current pathname ────
const isActive = (href: string, pathname: string) =>
  href === pathname || (href !== "/" && pathname.startsWith(href));

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darshanStatus, setDarshanStatus] = useState(getDarshanStatus);
  const [menuCanScroll, setMenuCanScroll] = useState(false);
  const menuScrollRef = useRef<HTMLDivElement>(null);

  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";
  const pathname = usePathname();

  // ── Darshan interval ──────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setDarshanStatus(getDarshanStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Scroll detection ──────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── Close mobile menu on navigation ───────────────────────────────
  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // ── Detect mobile menu overflow for scroll hint ───────────────────
  useEffect(() => {
    if (!mobileOpen) return;
    const el = menuScrollRef.current;
    if (!el) return;
    const update = () =>
      setMenuCanScroll(
        el.scrollHeight > el.clientHeight + 1 &&
          el.scrollTop + el.clientHeight < el.scrollHeight - 8
      );
    const timer = setTimeout(update, 320);
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [mobileOpen]);

  // ── Toggle mobile menu ────────────────────────────────────────────
  const toggleMobile = () => setMobileOpen((v) => !v);

  const toggleTheme = () => setTheme(darkMode ? "light" : "dark");

  // ── Render ────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Top info bar (phone, email, darshan status) ─────────── */}
      <AnimatePresence>
        {!scrolled && (
          <motion.div
            initial={{ y: -40 }}
            animate={{ y: 0 }}
            exit={{ y: -40, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-[60] bg-gradient-navy text-white"
          >
            <div className="container mx-auto flex h-8 items-center justify-between px-3 text-[10px] md:h-10 md:px-4 md:text-xs">
              <div className="flex items-center gap-4">
                <a
                  href="tel:+918977761187"
                  className="flex items-center gap-1.5 hover:text-secondary transition-colors"
                >
                  <Phone className="w-3 h-3" />
                  <span>+91 89777 61187</span>
                </a>
                <a
                  href="mailto:social@hkmvizag.org"
                  className="hidden sm:flex items-center gap-1.5 hover:text-secondary transition-colors"
                >
                  <Mail className="w-3 h-3" />
                  <span>social@hkmvizag.org</span>
                </a>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      darshanStatus.isOpen ? "bg-green-400 animate-pulse" : "bg-white/40"
                    }`}
                  />
                  <Clock className="w-3 h-3" />
                  <span suppressHydrationWarning>{darshanStatus.label}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Mobile menu backdrop ─────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-hidden
          />
        )}
      </AnimatePresence>

      {/* ── Main nav bar ─────────────────────────────────────────── */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "top-2 mx-2 md:mx-8 rounded-2xl bg-white dark:bg-card shadow-elevated border border-border/50"
            : "top-8 md:top-10 bg-white dark:bg-card border-b border-border/40"
        }`}
      >
        <div
          className={`container mx-auto flex items-center justify-between ${
            scrolled ? "px-4 h-12 md:px-5 md:h-14" : "px-3 h-14 md:px-4 md:h-16"
          }`}
        >
          {/* ── Logo ─────────────────────────────────────────────── */}
          <Link href="/" className="flex shrink-0 items-center gap-3">
            <Image
              src={typeof ISKLogo === "string" ? ISKLogo : ISKLogo.src}
              alt="ISKCON Kakinada - Hare Krishna Movement Kakinada"
              width={300}
              height={112}
              priority
              loading="eager"
              className="h-9 w-auto shrink-0 transition-all duration-300 md:h-[52px]"
            />
            <div className="flex shrink-0 items-center gap-2 md:gap-2.5">
              <span className="h-5 w-px shrink-0 bg-border md:h-6" aria-hidden />
              <Image
                src={typeof HKVTLogo === "string" ? HKVTLogo : HKVTLogo.src}
                alt="Hare Krishna Vaikuntam Cultural Complex"
                width={300}
                height={101}
                className="h-6 w-auto shrink-0 transition-all duration-300 md:h-11"
              />
            </div>
          </Link>

          {/* ── Desktop nav with CSS hover dropdowns (hidden below lg) ── */}
          <div className="hidden lg:flex items-center gap-1">
            {navEntries.map((entry) => {
              if (entry.kind === "link") {
                return (
                  <Link
                    key={entry.href}
                    href={entry.href}
                    className={`whitespace-nowrap px-2.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
                      pathname === entry.href
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {entry.label}
                  </Link>
                );
              }

              const group = entry.group;
              const groupActive = isGroupActive(group, pathname);
              const colCount =
                group.items.length > 4 ? "md:w-[500px] md:grid-cols-2" : "md:w-[400px]";

              return (
                <div key={group.label} className="relative group/dropdown">
                  <button
                    className={`flex items-center whitespace-nowrap px-2.5 py-2 text-[13px] font-medium transition-all rounded-lg ${
                      groupActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {group.label}
                    <ChevronDown className="relative top-[1px] ml-1 h-3 w-3 transition duration-200 group-hover/dropdown:rotate-180" />
                  </button>
                  {/* Dropdown — absolutely positioned under this trigger */}
                  <div className="invisible opacity-0 group-hover/dropdown:visible group-hover/dropdown:opacity-100 transition-all duration-200 absolute left-1/2 -translate-x-1/2 top-full pt-2 z-50">
                    <ul className={`grid gap-3 p-4 rounded-xl border bg-popover shadow-lg ${colCount}`}>
                      {group.items.map((item) => (
                        <NavListItem
                          key={item.href}
                          href={item.href}
                          title={item.label}
                          description={item.description}
                          icon={item.icon}
                        />
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── Desktop right actions (theme toggle + Donate) ─────── */}
          <div className="hidden lg:flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-all"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Button
              variant="default"
              className="rounded-full px-4 bg-gradient-ocean text-white border-0 hover:opacity-90"
              asChild
            >
              <Link href="/donate">
                <Heart className="w-4 h-4 mr-1.5 fill-current" />
                Donate Now
              </Link>
            </Button>
          </div>

          {/* ── Mobile: Donate Now button ─────────────────────────── */}
          <div className="lg:hidden flex items-center gap-1.5">
            <Button
              variant="default"
              size="sm"
              className="rounded-full h-[30px] px-3 text-[11px] bg-gradient-ocean text-white border-0 hover:opacity-90"
              asChild
            >
              <Link href="/donate">
                <Heart className="w-3 h-3 mr-1 fill-current" />
                Donate Now
              </Link>
            </Button>
          </div>
        </div>

        {/* ── Mobile overlay menu (flat link list) ────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="relative lg:hidden bg-white dark:bg-card backdrop-blur-md border-t border-border overflow-hidden rounded-b-2xl"
            >
              <div
                ref={menuScrollRef}
                className="container mx-auto px-4 py-3 flex flex-col gap-0.5 max-h-[calc(100dvh-9rem)] overflow-y-auto"
              >
                {mobileNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-left px-4 py-2.5 text-[15px] rounded-lg font-medium transition-colors ${
                      pathname === item.href
                        ? "text-primary bg-primary/10"
                        : "text-foreground hover:text-primary hover:bg-primary/10"
                    }`}
                  >
                    {item.label}
                  </Link>
                ))}
                <button
                  onClick={toggleTheme}
                  className="mt-1.5 flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:text-primary hover:border-primary"
                >
                  {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>
                <Button
                  variant="default"
                  className="mt-1.5 rounded-full bg-gradient-ocean text-white border-0 text-[15px]"
                  asChild
                >
                  <Link href="/donate">
                    <Heart className="w-4 h-4 mr-1.5 fill-current" />
                    Donate Now
                  </Link>
                </Button>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="mt-1.5 flex items-center justify-center gap-2 rounded-full border border-border px-4 py-2.5 text-[15px] font-medium text-foreground transition-colors hover:text-primary hover:border-primary"
                >
                  <X className="w-4 h-4" />
                  Close Menu
                </button>
              </div>
              {menuCanScroll && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-10 flex h-10 items-end justify-center bg-gradient-to-t from-white dark:from-card via-white/80 dark:via-card/80 to-transparent pb-1">
                  <ChevronDown className="h-4 w-4 animate-bounce text-muted-foreground" />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      {/* ── Fixed bottom navigation bar — mobile only ──────────────── */}
      <AnimatePresence>
        {!mobileOpen && (
          <motion.nav
            initial={false}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-card border-t border-border shadow-[0_-2px_12px_rgba(0,0,0,0.08)]"
          >
            <div className="flex items-stretch">
              {bottomNavItems.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                      active ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${active ? "stroke-[2.5px]" : "stroke-[1.75px]"}`} />
                    {item.label}
                    {active && (
                      <motion.span
                        layoutId="bottom-nav-active"
                        className="absolute top-0 h-0.5 w-8 rounded-full bg-primary"
                        transition={{ type: "spring", bounce: 0.25, duration: 0.4 }}
                      />
                    )}
                  </Link>
                );
              })}

              {/* More — opens/closes the hamburger menu */}
              <button
                onClick={toggleMobile}
                className={`flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors ${
                  mobileOpen ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {mobileOpen ? (
                  <X className="w-5 h-5 stroke-[2.5px]" />
                ) : (
                  <Menu className="w-5 h-5 stroke-[1.75px]" />
                )}
                More
              </button>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;

"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Mail, Sun, Moon, Clock, Heart, ChevronDown, Home, User, Utensils, Info, PartyPopper, Megaphone } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import ISKKakinadaLogo from "@/assets/iskcon-kkd-logo.png";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";

import { navEntries, isGroupActive } from "@/lib/navConfig";
import { NavListItem } from "@/components/NavListItem";
import { resolveMajorFestival, type MajorFestival } from "@/lib/majorFestival";
import { resolveCustomNavLink, type CustomNavLink } from "@/lib/customNavLink";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

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

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [darshanStatus, setDarshanStatus] = useState(getDarshanStatus);
  const [menuCanScroll, setMenuCanScroll] = useState(false);
  const menuScrollRef = useRef<HTMLDivElement>(null);
  // Live refs to each collapsible category wrapper so we can scroll an opened
  // one fully into view inside the sheet.
  const groupRefs = useRef<Map<string, HTMLDivElement | null>>(new Map());
  const [festival, setFestival] = useState<MajorFestival | null>(null);
  const [customLink, setCustomLink] = useState<CustomNavLink | null>(null);
  // Which "More" menu category is expanded (single-open accordion — opening
  // one closes any that was open before).
  const [openGroup, setOpenGroup] = useState<string | null>(null);

  const { resolvedTheme, setTheme } = useTheme();
  const darkMode = resolvedTheme === "dark";
  const pathname = usePathname();

  // ── Darshan interval ──────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => setDarshanStatus(getDarshanStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  // ── Major festival + custom link in the navbar ─────────────────────
  // Reads the admin overrides from site-content (public endpoint), then
  // resolves which festival to highlight (`"auto"` keeps the automatic
  // calendar pick; `"none"` hides the item entirely) and whether the
  // separate custom nav link is enabled. Both are independent slots and can
  // show at the same time.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      let festivalOverride: string | null = null;
      let customLinkOverride: { enabled?: boolean; label?: string; href?: string } | null = null;
      try {
        const res = await fetch(`${API_URL}/site-content`, { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          festivalOverride = data?.content?.navbar?.majorFestival ?? "none";
          customLinkOverride = data?.content?.navbar?.customLink ?? null;
        }
      } catch {
        festivalOverride = "none";
      }
      if (!cancelled) {
        setFestival(resolveMajorFestival(festivalOverride));
        setCustomLink(resolveCustomNavLink(customLinkOverride));
      }
    })();
    return () => {
      cancelled = true;
    };
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
    update();
    return () => {
      clearTimeout(timer);
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [mobileOpen, openGroup]);

  // ── Toggle mobile menu ────────────────────────────────────────────
  const toggleMobile = () => setMobileOpen((v) => !v);

  const toggleTheme = () => setTheme(darkMode ? "light" : "dark");

  // ── Toggle a collapsible category in the mobile "More" menu ───────
  // Only one category stays open at a time; tapping the open one closes it.
  // After toggling we wait for the fold/unfold animation, then glide the
  // opened category fully into view (or bring a closed one's header back).
  const toggleGroup = (label: string) => {
    if (openGroup === label) {
      setOpenGroup(null);
      window.setTimeout(() => scrollGroupIntoView(label), 320);
    } else {
      setOpenGroup(label);
      window.setTimeout(() => scrollGroupIntoView(label), 340);
    }
  };

  // Smoothly scroll the mobile sheet so the target category slot is visible.
  const scrollGroupIntoView = (label: string) => {
    const container = menuScrollRef.current;
    const el = groupRefs.current.get(label);
    if (!container || !el) return;
    const cRect = container.getBoundingClientRect();
    const eRect = el.getBoundingClientRect();
    const elTop = eRect.top - cRect.top + container.scrollTop;
    container.scrollTo({
      top: Math.max(0, elTop - 12),
      behavior: "smooth",
    });
  };

  // Link styling shared by the mobile "More" menu rows.
  const mobileLinkCls = (active: boolean) =>
    `flex items-center gap-2 rounded-lg px-4 py-2.5 text-[15px] font-medium transition-colors ${
      active ? "text-primary bg-primary/10" : "text-foreground hover:text-primary hover:bg-primary/10"
    }`;

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
          <Link href="/" className="flex shrink-0 items-center">
            <Image
              src={ISKKakinadaLogo}
              alt="ISKCON Kakinada - Hare Krishna Movement Kakinada"
              priority
              loading="eager"
              className="h-10 w-auto max-w-[220px] shrink-0 object-contain transition-all duration-300 md:h-12"
            />
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

              if (entry.kind === "festival") {
                // Only rendered while a major festival is active — either
                // auto-picked from the calendar or set by an admin. Styled
                // like any other top-level link (no gold pill / badge).
                if (!festival) return null;
                const activeF =
                  pathname === festival.href || pathname.startsWith(festival.href);
                return (
                  <Link
                    key={festival.href}
                    href={festival.href}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${
                      activeF ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {festival.label}
                  </Link>
                );
              }

              if (entry.kind === "customLink") {
                // Only rendered while an admin has enabled this separate
                // custom nav link. Styled like the festival slot.
                if (!customLink) return null;
                const activeC =
                  pathname === customLink.href || pathname.startsWith(customLink.href);
                return (
                  <Link
                    key={customLink.href}
                    href={customLink.href}
                    className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-2 text-[13px] font-medium transition-all ${
                      activeC ? "text-primary" : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {customLink.label}
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

        {/* ── Mobile "More" sheet ─────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-sheet"
              initial={{ opacity: 0, y: -14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -14 }}
              transition={{ duration: 0.22, ease: "easeInOut" }}
              className={`absolute top-full flex max-h-[calc(100dvh-96px)] flex-col overflow-hidden bg-white shadow-elevated dark:bg-card md:max-h-[calc(100dvh-112px)] ${
                scrolled
                  ? "inset-x-2 md:inset-x-8 rounded-b-2xl md:rounded-2xl border border-border/60"
                  : "inset-x-0 rounded-b-3xl border-t border-border"
              }`}
            >
              {/* Scrollable body */}
              <div ref={menuScrollRef} className="flex-1 overflow-y-auto overscroll-contain px-4 py-3">
                {festival && (
                  <Link
                    href={festival.href}
                    className={mobileLinkCls(pathname === festival.href || pathname.startsWith(festival.href))}
                  >
                    <PartyPopper className="h-4 w-4" />
                    {festival.label}
                  </Link>
                )}
                {customLink && (
                  <Link
                    href={customLink.href}
                    className={mobileLinkCls(pathname === customLink.href || pathname.startsWith(customLink.href))}
                  >
                    <Megaphone className="h-4 w-4" />
                    {customLink.label}
                  </Link>
                )}
                <button onClick={toggleTheme} className={`${mobileLinkCls(false)} w-full`}>
                  {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                  {darkMode ? "Light Mode" : "Dark Mode"}
                </button>

                <p className="px-4 pb-1 pt-3 text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
                  Explore by Category
                </p>
                {navEntries
                  .filter(
                    (entry): entry is Extract<typeof entry, { kind: "group" }> => entry.kind === "group"
                  )
                  .map((entry) => {
                    const group = entry.group;
                    const GroupIcon = group.icon;
                    const open = openGroup === group.label;
                    return (
                      <div
                        key={group.label}
                        ref={(el) => {
                          if (el) groupRefs.current.set(group.label, el);
                          else groupRefs.current.delete(group.label);
                        }}
                        className="overflow-hidden rounded-xl"
                      >
                        <button
                          onClick={() => toggleGroup(group.label)}
                          aria-expanded={open}
                          className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-[15px] font-medium transition-all duration-200 ${
                            open
                              ? "bg-primary/[0.06] text-primary ring-1 ring-inset ring-primary/15"
                              : "text-foreground hover:bg-primary/5 hover:text-primary"
                          }`}
                        >
                          <span className="flex items-center gap-2.5">
                            {GroupIcon && (
                              <span
                                className={`flex h-7 w-7 items-center justify-center rounded-lg transition-colors ${
                                  open ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                                }`}
                              >
                                <GroupIcon className="h-4 w-4" />
                              </span>
                            )}
                            <span>{group.label}</span>
                          </span>
                          <span
                            className={`flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300 ${
                              open ? "rotate-180 bg-primary/10 text-primary" : "bg-muted/60 text-muted-foreground"
                            }`}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </span>
                        </button>
                        <motion.div
                          initial={false}
                          animate={
                            open
                              ? { height: "auto", opacity: 1, y: 0 }
                              : { height: 0, opacity: 0, y: -6 }
                          }
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          style={{ overflow: "hidden" }}
                        >
                          <div className="ml-5 mt-1 flex flex-col gap-0.5 border-l border-primary/15 pb-1 pl-4">
                            {group.items.map((item) => (
                                  <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-2 rounded-lg px-3 py-2.5 text-[14px] transition-colors ${
                                      pathname === item.href
                                        ? "text-primary bg-primary/10"
                                        : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                                    }`}
                                  >
                                    {item.label}
                                  </Link>
                                ))}
                              </div>
                            </motion.div>
                      </div>
                    );
                  })}

              {/* Scroll hint — shown only while there is actually more below */}
              {menuCanScroll && (
                <div className="pointer-events-none sticky bottom-0 -mt-10 z-10 flex h-10 items-end justify-center bg-gradient-to-t from-white via-white/80 to-transparent pb-1 dark:from-card dark:via-card/80">
                  <ChevronDown className="h-4 w-4 animate-bounce text-muted-foreground" />
                </div>
              )}
              </div>

              {/* Sticky footer actions — always visible, never buried in the scroll */}
              <div className="border-t border-border/60 bg-muted/25 px-4 py-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-11 flex-1 rounded-full bg-gradient-ocean text-white border-0 text-sm shadow-sm"
                    asChild
                  >
                    <Link href="/donate">
                      <Heart className="w-4 h-4 mr-1.5 fill-current" />
                      Donate Now
                    </Link>
                  </Button>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="inline-flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full border border-border bg-background text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
                  >
                    <X className="w-4 h-4" />
                    Close Menu
                  </button>
                </div>
              </div>
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

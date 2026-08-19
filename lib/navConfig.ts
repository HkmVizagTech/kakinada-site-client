import {
  Home, Info, User, Phone,
  Clock, Image, Calendar, Snowflake,
  Heart, Utensils, Beef, BookOpen, Shirt, Sparkles, Gift,
  CalendarDays, PartyPopper, HandHeart, FileText,
  type LucideIcon,
} from "lucide-react";

export interface NavLink {
  label: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}

export interface NavGroup {
  label: string;
  icon?: LucideIcon;
  items: NavLink[];
}

export type NavEntry =
  | { kind: "link"; label: string; href: string; icon?: LucideIcon }
  | { kind: "group"; group: NavGroup };

export const navEntries: NavEntry[] = [
  { kind: "link", label: "Home", href: "/", icon: Home },
  { kind: "link", label: "Founder", href: "/founder", icon: User },
  { kind: "link", label: "Subhojanam", href: "/subhojanam", icon: Utensils },
  {
    kind: "group",
    group: {
      label: "About",
      icon: Info,
      items: [
        { label: "About Us", href: "/about", description: "Our mission, history & values", icon: Info },
        { label: "Contact Us", href: "/contact", description: "Visit, call, or write to us", icon: Phone },
      ],
    },
  },
  {
    kind: "group",
    group: {
      label: "Temple",
      icon: Clock,
      items: [
        { label: "Daily Schedule", href: "/daily-schedule", description: "Aarti timings & daily programs", icon: Clock },
        { label: "Gallery", href: "/gallery", description: "Photos from the temple", icon: Image },
        { label: "Vaishnav Calendar", href: "/vaishnav-calendar", description: "2026 festivals & Ekadashis", icon: Calendar },
        { label: "Chaturmas", href: "/chaturmas", description: "Sacred four-month observance", icon: Snowflake },
      ],
    },
  },
  {
    kind: "group",
    group: {
      label: "Seva",
      icon: Heart,
      items: [
        { label: "Anna Daan", href: "/anna-daan-seva", description: "Feed the hungry", icon: Utensils },
        { label: "Gau Seva", href: "/gau-seva", description: "Cow care & protection", icon: Beef },
        { label: "Gita Daan", href: "/gita-daan-seva", description: "Distribute Bhagavad Gita", icon: BookOpen },
        { label: "Vastra Seva", href: "/alankara-vastra-seva", description: "Deity garments & ornaments", icon: Shirt },
        { label: "All Sevas", href: "/donate", description: "View every seva opportunity", icon: Gift },
      ],
    },
  },
  {
    kind: "group",
    group: {
      label: "Get Involved",
      icon: HandHeart,
      items: [
        { label: "Blogs", href: "/blogs", description: "Articles & spiritual insights", icon: FileText },
        { label: "Events", href: "/events", description: "Upcoming programs & registrations", icon: CalendarDays },
        { label: "Festivals", href: "/festival", description: "Grand celebrations at the temple", icon: PartyPopper },
        { label: "Volunteer", href: "/volunteer", description: "Serve with us", icon: HandHeart },
      ],
    },
  },
];

// Flat list for "is this path active?" checks
export const allNavHrefs = navEntries.flatMap((e) =>
  e.kind === "link" ? [e.href] : e.group.items.map((i) => i.href)
);

// Bottom bar items for mobile
export const bottomBarItems: {
  label: string;
  href?: string;
  icon: LucideIcon;
  groupLabel?: string;
}[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "Subhojanam", href: "/subhojanam", icon: Utensils },
  { label: "Temple", icon: Clock, groupLabel: "Temple" },
  { label: "Seva", icon: Heart, groupLabel: "Seva" },
  // "More" is handled specially in the component, not in this array
];

// Utility: check if any child in a group matches the current pathname
export function isGroupActive(group: NavGroup, pathname: string): boolean {
  return group.items.some(
    (item) => pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
  );
}

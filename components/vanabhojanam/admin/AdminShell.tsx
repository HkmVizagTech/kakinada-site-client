"use client";

import { useEffect, useState, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Banknote, BarChart3, CalendarCheck, CalendarPlus, GraduationCap, HeartHandshake, LayoutDashboard, ListChecks, LogOut, Menu, QrCode, ScanLine, Users,
} from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { homeForRole, useVbAuth } from "../context/VbAuthContext";
import { AdminEventProvider } from "../context/AdminEventContext";
import { PageSpinner } from "../ui/Feedback";
import { IMAGES } from "@/lib/vanabhojanam/config";

const ADMIN = "/vanabhojanam/admin";

type Role = "admin" | "viewer" | "user";
interface NavLink { to: string; label: string; icon: typeof Users; roles: Role[]; needsCash?: boolean }

/** Admin = temple admin. viewer = devotee (look, never change). user = volunteer. */
export const NAV: { label: string; links: NavLink[] }[] = [
  {
    label: "Overview",
    links: [
      { to: ADMIN, label: "Candidates", icon: LayoutDashboard, roles: ["admin", "viewer"] },
      { to: `${ADMIN}/attendance`, label: "Attendance", icon: CalendarCheck, roles: ["admin", "viewer"] },
      { to: `${ADMIN}/insights`, label: "Insights", icon: BarChart3, roles: ["admin"] },
    ],
  },
  {
    label: "Set up",
    links: [
      { to: `${ADMIN}/events`, label: "Events", icon: CalendarPlus, roles: ["admin"] },
      { to: `${ADMIN}/college`, label: "Colleges", icon: GraduationCap, roles: ["admin", "viewer"] },
      { to: `${ADMIN}/staff`, label: "Staff", icon: Users, roles: ["admin"] },
      { to: `${ADMIN}/devotees`, label: "Devotees", icon: HeartHandshake, roles: ["admin"] },
    ],
  },
  {
    label: "On the day",
    links: [
      { to: `${ADMIN}/cash`, label: "Cash desk", icon: Banknote, roles: ["admin", "user"], needsCash: true },
      { to: `${ADMIN}/adminqrscanner`, label: "QR scanner", icon: ScanLine, roles: ["admin", "user"] },
      { to: `${ADMIN}/qr`, label: "QR lookup", icon: QrCode, roles: ["admin", "user"] },
      { to: `${ADMIN}/AdminAttendanceScannedList`, label: "Scanned list", icon: ListChecks, roles: ["admin", "user"] },
    ],
  },
];

const roleLabel = (role: string | null) => (role === "admin" ? "Admin" : role === "viewer" ? "Devotee (view only)" : "Volunteer");

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const { role, canCollectCash } = useVbAuth();
  const pathname = usePathname() || "";

  const groups = NAV.map((g) => ({
    ...g,
    links: g.links.filter((l) => l.roles.includes(role as Role) && (!l.needsCash || role === "admin" || canCollectCash)),
  })).filter((g) => g.links.length);

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="mb-1.5 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-white/60">{group.label}</p>
          <div className="flex flex-col gap-0.5">
            {group.links.map(({ to, label, icon: Icon }) => {
              const active = pathname.toLowerCase().replace(/\/$/, "") === to.toLowerCase();
              return (
                <Link
                  key={to}
                  href={to}
                  onClick={onNavigate}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    active ? "bg-white/20 font-bold text-white" : "font-medium text-white/80 hover:bg-white/10 hover:text-white"
                  )}
                >
                  {active && <span className="absolute -left-3 bottom-[22%] top-[22%] w-1 rounded-full bg-vb-brass-300" />}
                  <Icon className="h-[18px] w-[18px]" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function UserCard() {
  const auth = useVbAuth();
  const router = useRouter();
  const logoutNow = () => {
    const wasViewer = auth.role === "viewer";
    auth.logout();
    router.replace(wasViewer ? "/vanabhojanam/devotee" : `${ADMIN}/login`);
  };
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-black/30 p-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-vb-brass-400 text-sm font-bold text-vb-brand-900">
        {(auth.name || "U").trim().charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-bold">{auth.name || "Signed in"}</p>
        <span className={cn("mt-0.5 inline-block rounded px-1.5 py-px text-[9px] font-bold uppercase", auth.role === "admin" ? "bg-emerald-200 text-emerald-900" : "bg-sky-200 text-sky-900")}>
          {roleLabel(auth.role)}
        </span>
      </div>
      <button type="button" aria-label="Log out" title="Log out" onClick={logoutNow} className="rounded-lg p-2 text-red-200 transition-colors hover:bg-white/20">
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}

const Brand = () => (
  <div className="mb-5 flex shrink-0 items-center gap-3 px-1">
    <Image src={IMAGES.logo} alt="" width={42} height={42} className="h-[42px] w-[42px] rounded-full" unoptimized />
    <div className="leading-[1.1]">
      <p className="font-vb-heading text-xl font-bold leading-[1.1]">Kartika Vanabhojanam</p>
      <p className="text-xs text-white/70">Admin console · Kakinada</p>
    </div>
  </div>
);

const SIDEBAR_WIDTH = 248;

function Sidebar() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="fixed inset-x-0 top-0 z-[60] flex h-14 items-center gap-2 bg-vb-brand-700 px-3 text-white shadow-md md:hidden">
        <button type="button" aria-label="Open menu" onClick={() => setOpen(true)} className="rounded-lg p-2 hover:bg-white/20">
          <Menu className="h-[22px] w-[22px]" />
        </button>
        <p className="font-vb-heading text-xl font-bold leading-[1.1]">Kartika Vanabhojanam</p>
      </div>

      <nav
        aria-label="Admin"
        className="fixed inset-y-0 left-0 z-50 hidden flex-col overflow-hidden bg-vb-brand-800 px-4 pb-4 pt-5 text-white md:flex"
        style={{ width: SIDEBAR_WIDTH }}
      >
        <Brand />
        {/* Only the menu list scrolls (thin bar), so the user card stays visible at the bottom. */}
        <div className="-mr-2 min-h-0 flex-1 overflow-y-auto pr-2 [scrollbar-color:rgba(255,255,255,0.25)_transparent] [scrollbar-width:thin]">
          <NavItems />
        </div>
        <div className="pt-3">
          <UserCard />
        </div>
      </nav>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="flex w-[300px] flex-col border-0 bg-vb-brand-800 px-4 pb-4 pt-5 text-white [&>button]:text-white">
          <SheetTitle className="sr-only">Menu</SheetTitle>
          <SheetDescription className="sr-only">Admin navigation</SheetDescription>
          <Brand />
          <div className="flex-1 overflow-y-auto">
            <NavItems onNavigate={() => setOpen(false)} />
          </div>
          <UserCard />
        </SheetContent>
      </Sheet>
    </>
  );
}

/** Which roles may open which page (matched case-insensitively on the path under /vanabhojanam/admin). */
const PAGE_ROLES: Record<string, Role[]> = {
  "": ["admin", "viewer"],
  "/attendance": ["admin", "viewer"],
  "/college": ["admin", "viewer"],
  "/insights": ["admin"],
  "/events": ["admin"],
  "/staff": ["admin"],
  "/devotees": ["admin"],
  "/register": ["admin"],
  "/cash": ["admin", "user"],
  "/adminqrscanner": ["admin", "user"],
  "/qr": ["admin", "user"],
  "/adminattendancescannedlist": ["admin", "user"],
};

function Denied({ title, text }: { title: string; text: string }) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-2 text-center">
      <h2 className="font-vb-heading text-3xl font-semibold text-red-500">{title}</h2>
      <p className="text-gray-600">{text}</p>
    </div>
  );
}

/** Persistent shell for every console page. Public auth pages (login) render without it. */
export default function AdminShell({ children }: { children: ReactNode }) {
  const { status, role, canCollectCash, verify } = useVbAuth();
  const pathname = usePathname() || "";
  const router = useRouter();

  const sub = pathname.toLowerCase().replace(/\/$/, "").slice(ADMIN.length);
  const isLogin = sub === "/login";

  useEffect(() => {
    if (!isLogin && status === "unverified") verify();
  }, [isLogin, status, verify]);

  useEffect(() => {
    if (!isLogin && status === "anonymous") router.replace(`${ADMIN}/login`);
  }, [isLogin, status, router]);

  if (isLogin) return <>{children}</>;
  if (status === "unverified" || status === "checking" || status === "anonymous") {
    return <PageSpinner label="Verifying authentication..." />;
  }

  const allowed = PAGE_ROLES[sub];
  let body: ReactNode = children;
  if (!allowed || !allowed.includes(role as Role)) {
    body = <Denied title="Access Denied" text="You don't have permission to access this page." />;
  } else if (sub === "/cash" && role !== "admin" && !canCollectCash) {
    body = <Denied title="No cash desk access" text="Ask an admin to give your account the cash permission." />;
  }

  return (
    <div className="min-h-screen bg-[#f6f5f0]">
      <Sidebar />
      <AdminEventProvider>
        <main className="mt-14 p-3 md:ml-[248px] md:mt-0 md:p-8">{body}</main>
      </AdminEventProvider>
    </div>
  );
}

export { homeForRole };

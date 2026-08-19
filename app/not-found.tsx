import Link from "next/link";
import { Home, Heart, Calendar, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg text-center">
        <div
          className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full text-primary-foreground"
          style={{ background: "var(--gradient-ocean)" }}
        >
          <span className="font-heading text-3xl font-bold">ॐ</span>
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-secondary mb-3">
          404 — Page Not Found
        </p>
        <h1 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
          This path doesn&apos;t lead anywhere
        </h1>
        <p className="text-muted-foreground mb-10">
          The page you&apos;re looking for may have moved or never existed. Let us
          guide you back to the temple.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { href: "/", label: "Home", icon: Home },
            { href: "/events", label: "Events", icon: Calendar },
            { href: "/blogs", label: "Blog", icon: BookOpen },
            { href: "/donate", label: "Donate", icon: Heart },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card p-4 text-sm font-medium text-foreground transition-all hover:-translate-y-0.5 hover:border-secondary hover:text-primary hover:shadow-elevated"
            >
              <Icon className="h-5 w-5 text-secondary" />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

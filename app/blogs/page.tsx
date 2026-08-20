"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import PageLayout from "@/components/PageLayout";
import {
  Calendar,
  Clock,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: { name: string; avatar?: string; slug?: string };
  publishedAt?: string;
  createdAt: string;
  readTime: number;
  views: number;
}

interface Category {
  name: string;
  slug: string;
  count: number;
}

interface LandingData {
  recents: Blog[];
  devotional: Blog[];
  categories: Category[];
  byCategory: (Category & { items: Blog[] })[];
  popular: Blog[];
  recent: Blog[];
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";

// Color tokens used for category tile placeholders when no image is uploaded
const CATEGORY_COLORS: Record<string, string> = {
  "Krishna Katha": "from-blue-700 to-blue-500",
  "Vaishnava Songs and Prayers": "from-amber-700 to-amber-500",
  "Our Acharyas": "from-blue-800 to-indigo-600",
  "Spiritual Knowledge": "from-purple-700 to-violet-500",
  "Sacred Festivals & Occasions": "from-orange-600 to-amber-400",
  "Spiritual News & Events": "from-emerald-700 to-emerald-500",
  "Spiritual Charity": "from-rose-700 to-pink-500",
  "Timeless Wisdom": "from-slate-700 to-slate-500",
  "Divine Poetics": "from-fuchsia-700 to-pink-500",
  "Krishna Consciousness": "from-indigo-700 to-blue-500",
  Recipes: "from-yellow-700 to-orange-400",
  Pilgrimage: "from-teal-700 to-cyan-500",
  Other: "from-gray-700 to-gray-500",
};

// Date formatter — short form
const fmtDate = (s?: string) => {
  if (!s) return "";
  const d = new Date(s);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
};
const fmtDay = (s?: string) => (s ? new Date(s).getDate() : "");
const fmtMonth = (s?: string) =>
  s ? new Date(s).toLocaleDateString("en-IN", { month: "short" }) : "";

// Fallback gradient when blog has no cover image
const blogBg = (b: Blog) =>
  b.coverImage
    ? `url(${b.coverImage})`
    : `linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))`;

export default function BlogsListPage() {
  const [data, setData] = useState<LandingData | null>(null);
  const [tab, setTab] = useState<"recents" | "stories">("recents");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(`${API_URL}/blogs-proxy/landing`, { cache: "no-store" });
        if (res.ok) setData(await res.json());
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <PageLayout>
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground pt-20">
        Loading blogs…
      </div>
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout>
      <div className="min-h-[60vh] flex items-center justify-center text-muted-foreground pt-20">
        Failed to load blogs. Please try again later.
      </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
    <main className="bg-white dark:bg-background pt-20">
      {/* ─── HERO + RECENTS STRIP ─── */}
      <section className="container mx-auto px-4 pt-10 pb-12">
        <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-6 max-w-3xl">
          Nourish Your Soul Daily — with Spiritual Teachings
        </h1>

        <div className="flex gap-6 mb-6 border-b">
          <button
            onClick={() => setTab("recents")}
            className={`pb-3 text-sm font-semibold transition border-b-2 -mb-px ${
              tab === "recents"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Recents
          </button>
          <Link
            href="/web-stories"
            className="pb-3 text-sm font-semibold text-muted-foreground hover:text-foreground transition"
          >
            Web Stories
          </Link>
        </div>

        {/* Horizontal scroll of 5 recent posts */}
        <RecentStrip blogs={data.recents} />
      </section>

      {/* ─── DEVOTIONAL WISDOM ─── */}
      <section className="bg-white dark:bg-background py-12 md:py-16 border-y">
        <div className="container mx-auto px-4">
          <p className="text-sm text-muted-foreground mb-1">
            Discover the Spiritual Essence of Our Vedic Literature
          </p>
          <h2 className="text-3xl md:text-4xl font-bold mb-2">Devotional Wisdom</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl">
            A collection of inspiring reads from the pens of the ISKCON Kakinada Team.
          </p>
          <DevotionalCarousel blogs={data.devotional} />
        </div>
      </section>

      {/* ─── 13 CATEGORY TILES ─── */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-bold mb-8">Get Started Here</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {data.categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/blogs/categories/${cat.slug}`}
              className="group relative aspect-[4/5] rounded-xl overflow-hidden hover:-translate-y-1 transition-all"
            >
              <div
                className={`absolute inset-0 bg-gradient-to-br ${
                  CATEGORY_COLORS[cat.name] || "from-primary to-accent"
                }`}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 p-4 flex flex-col justify-end">
                <span className="inline-block self-start px-2.5 py-0.5 rounded-full bg-white/95 text-foreground text-[10px] font-bold mb-2 uppercase tracking-wide">
                  {cat.count} {cat.count === 1 ? "blog" : "blogs"}
                </span>
                <h3 className="text-white font-bold text-base md:text-lg leading-tight line-clamp-3">
                  {cat.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── PER-CATEGORY SECTIONS (each has 6 posts + View All) ─── */}
      {data.byCategory.map((cat) => (
        <section key={cat.slug} className="container mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl md:text-3xl font-bold">{cat.name}</h2>
            <Link
              href={`/blogs/categories/${cat.slug}`}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:gap-2.5 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {cat.items.slice(0, 6).map((blog) => (
              <BlogCardWithAuthor key={blog._id} blog={blog} />
            ))}
          </div>
        </section>
      ))}

      {/* ─── POPULAR BLOGS — featured large + horizontal list ─── */}
      {data.popular.length > 0 && (
        <section className="container mx-auto px-4 py-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Popular blogs</h2>
          <div className="grid lg:grid-cols-5 gap-6">
            {/* Featured large card on left */}
            <Link
              href={`/blogs/${data.popular[0].slug}`}
              className="lg:col-span-2 group block rounded-2xl overflow-hidden bg-card border hover:shadow-xl transition"
            >
              <div
                className="aspect-[4/3] bg-cover bg-center"
                style={{ backgroundImage: blogBg(data.popular[0]) }}
              />
              <div className="p-6">
                <div className="text-xs text-primary font-bold uppercase tracking-wide mb-2">
                  {data.popular[0].category}
                </div>
                <h3 className="text-xl md:text-2xl font-bold leading-tight group-hover:text-primary transition mb-2">
                  {data.popular[0].title}
                </h3>
                {data.popular[0].excerpt && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {data.popular[0].excerpt}
                  </p>
                )}
              </div>
            </Link>

            {/* Date-strip list on right */}
            <div className="lg:col-span-3 divide-y">
              {data.popular.slice(1, 6).map((b) => (
                <Link
                  key={b._id}
                  href={`/blogs/${b.slug}`}
                  className="flex items-center gap-5 py-4 group"
                >
                  <div className="flex-shrink-0 w-14 text-center">
                    <div className="text-2xl font-bold text-foreground">{fmtDay(b.publishedAt)}</div>
                    <div className="text-xs text-muted-foreground uppercase">{fmtMonth(b.publishedAt)}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-base group-hover:text-primary transition line-clamp-2 mb-1">
                      {b.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">By {b.author?.name || "Admin"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── RECENT BLOGS — detailed cards with image + meta + category footer ─── */}
      <section className="bg-white dark:bg-background py-12 md:py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Recent Blogs</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recent.map((blog) => (
              <Link
                key={blog._id}
                href={`/blogs/${blog.slug}`}
                className="group block bg-card rounded-2xl overflow-hidden hover:shadow-lg transition flex flex-col"
              >
                <div
                  className="aspect-[16/10] bg-cover bg-center"
                  style={{ backgroundImage: blogBg(blog) }}
                />
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold leading-snug group-hover:text-primary transition line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                  <div className="flex items-center gap-2 mb-2 text-xs text-muted-foreground">
                    {blog.author?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={blog.author.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/15 grid place-items-center text-[10px] font-bold text-primary">
                        {(blog.author?.name || "A").charAt(0)}
                      </div>
                    )}
                    <span>By {blog.author?.name || "Admin"}</span>
                  </div>
                  {blog.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1 mb-3">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="text-xs font-bold uppercase tracking-wide text-primary mt-auto">
                    {blog.category}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── NEWSLETTER ─── */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 rounded-3xl p-8 md:p-12 grid md:grid-cols-2 gap-8 items-center border">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-3 leading-tight">
              Join Our Newsletter 🎉
            </h2>
            <p className="text-muted-foreground">
              Read and share new perspectives on just about any topic. Everyone's welcome.
            </p>
          </div>
          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex flex-col sm:flex-row gap-2 sm:gap-0 max-w-md ml-auto w-full"
          >
            <input
              type="email"
              required
              placeholder="you@example.com"
              className="flex-1 px-4 py-3 rounded-full sm:rounded-r-none border bg-background outline-none focus:border-primary text-sm"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-full sm:rounded-l-none bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </main>
    </PageLayout>
  );
}

// ─── RECENT POSTS STRIP — horizontal scrollable cards ──────────────────
function RecentStrip({ blogs }: { blogs: Blog[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: "l" | "r") => {
    if (!ref.current) return;
    const w = ref.current.clientWidth * 0.8;
    ref.current.scrollBy({ left: dir === "l" ? -w : w, behavior: "smooth" });
  };

  if (!blogs.length) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8 border border-dashed rounded-lg">
        No recent posts yet — be the first to publish.
      </p>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => scroll("l")}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border shadow-md items-center justify-center hover:bg-muted transition"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("r")}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border shadow-md items-center justify-center hover:bg-muted transition"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none" } as any}
      >
        {blogs.map((b) => (
          <Link
            key={b._id}
            href={`/blogs/${b.slug}`}
            className="flex-shrink-0 w-[260px] sm:w-[300px] snap-start group block rounded-2xl overflow-hidden bg-card border hover:shadow-md transition"
          >
            <div
              className="aspect-[16/10] bg-cover bg-center"
              style={{ backgroundImage: blogBg(b) }}
            />
            <div className="p-4">
              <div className="text-[10px] font-bold uppercase tracking-wide text-primary mb-1.5">
                {b.category}
              </div>
              <div className="text-[11px] text-muted-foreground mb-1.5">{fmtDate(b.publishedAt)}</div>
              <h3 className="font-semibold text-sm leading-tight group-hover:text-primary transition line-clamp-2">
                {b.title}
              </h3>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ─── DEVOTIONAL WISDOM CAROUSEL ────────────────────────────────────────
function DevotionalCarousel({ blogs }: { blogs: Blog[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  const scroll = (dir: "l" | "r") => {
    if (!ref.current) return;
    const w = ref.current.clientWidth * 0.85;
    ref.current.scrollBy({ left: dir === "l" ? -w : w, behavior: "smooth" });
    setIndex((i) => Math.max(0, Math.min(blogs.length - 1, i + (dir === "l" ? -1 : 1))));
  };

  if (!blogs.length) return null;

  return (
    <div className="relative">
      <button
        onClick={() => scroll("l")}
        className="hidden md:flex absolute -left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border shadow-md items-center justify-center hover:bg-muted transition"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => scroll("r")}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-background border shadow-md items-center justify-center hover:bg-muted transition"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      <div
        ref={ref}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
        style={{ scrollbarWidth: "none" } as any}
      >
        {blogs.map((b) => (
          <Link
            key={b._id}
            href={`/blogs/${b.slug}`}
            className="flex-shrink-0 w-[280px] sm:w-[340px] snap-start group block rounded-2xl overflow-hidden bg-card border hover:shadow-lg transition"
          >
            <div
              className="aspect-[16/10] bg-cover bg-center"
              style={{ backgroundImage: blogBg(b) }}
            />
            <div className="p-5">
              <div className="text-xs font-bold uppercase tracking-wide text-primary mb-2">
                {b.category}
              </div>
              <h3 className="font-bold text-base leading-snug group-hover:text-primary transition line-clamp-2 mb-3">
                {b.title}
              </h3>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {b.author?.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={b.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center text-[10px] font-bold text-primary">
                    {(b.author?.name || "A").charAt(0)}
                  </div>
                )}
                <span>By {b.author?.name || "Admin"}</span>
                <span className="text-muted-foreground/60">·</span>
                <span>{fmtDate(b.publishedAt)}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="text-center text-xs text-muted-foreground mt-3">
        {index + 1} / {blogs.length}
      </div>
    </div>
  );
}

// ─── CARD WITH AUTHOR (used by per-category sections) ──────────────────
function BlogCardWithAuthor({ blog }: { blog: Blog }) {
  return (
    <Link
      href={`/blogs/${blog.slug}`}
      className="group block bg-card rounded-2xl overflow-hidden border hover:shadow-md transition"
    >
      <div
        className="aspect-[16/10] bg-cover bg-center"
        style={{ backgroundImage: blogBg(blog) }}
      />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
          {blog.author?.avatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={blog.author.avatar} alt="" className="w-7 h-7 rounded-full object-cover" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-primary/15 grid place-items-center text-[10px] font-bold text-primary">
              {(blog.author?.name || "A").charAt(0)}
            </div>
          )}
          <span>By {blog.author?.name || "Admin"}</span>
        </div>
        <h3 className="font-bold text-base leading-snug group-hover:text-primary transition line-clamp-2 mb-2">
          {blog.title}
        </h3>
        <p className="text-xs text-muted-foreground">{fmtDate(blog.publishedAt)}</p>
      </div>
    </Link>
  );
}

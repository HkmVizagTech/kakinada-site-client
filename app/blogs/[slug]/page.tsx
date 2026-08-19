import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import PageLayout from "@/components/PageLayout";
import {
  Calendar,
  Clock,
  ArrowLeft,
  ArrowRight,
  Tag,
  ChevronRight,
} from "lucide-react";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  category: string;
  tags: string[];
  author: { name: string; avatar?: string; bio?: string; slug?: string };
  publishedAt?: string;
  createdAt: string;
  readTime: number;
  views: number;
  metaTitle?: string;
  metaDescription?: string;
  updatedAt?: string;
}

interface Category {
  name: string;
  slug: string;
  count: number;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";

async function getBlog(slug: string): Promise<Blog | null> {
  try {
    const res = await fetch(`${API_URL}/blogs-proxy/${slug}`, { cache: "no-store" });
    if (!res.ok) return null;
    const json = await res.json();
    return json.blog as Blog;
  } catch (_) {
    return null;
  }
}
async function getRelated(id: string): Promise<Blog[]> {
  try {
    const res = await fetch(`${API_URL}/blogs-proxy/${id}/related`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).items || [];
  } catch (_) {
    return [];
  }
}
async function getCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${API_URL}/blogs-proxy/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).categories || [];
  } catch (_) {
    return [];
  }
}

// Slugify mirror for category links
const catSlug = (name: string) =>
  name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

const fmtDate = (s?: string) => {
  if (!s) return "";
  return new Date(s).toLocaleDateString("en-IN", { month: "long", day: "numeric", year: "numeric" });
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const blog = await getBlog(slug);
  if (!blog) return { title: "Blog · ISKCON Gambheeram Visakhapatnam" };
  return {
    title: blog.metaTitle || `${blog.title} · ISKCON Gambheeram Visakhapatnam Blog`,
    description: blog.metaDescription || blog.excerpt,
    alternates: { canonical: `/blogs/${blog.slug}` },
    openGraph: {
      title: blog.title,
      description: blog.excerpt,
      images: blog.coverImage ? [blog.coverImage] : [],
      type: "article",
      publishedTime: blog.publishedAt,
      authors: [blog.author?.name || "Admin"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [blog, categories] = await Promise.all([getBlog(slug), getCategories()]);
  if (!blog) notFound();

  const related = await getRelated(blog._id);
  const populatedCats = categories.filter((c) => c.count > 0).slice(0, 6);

  // Build share URLs
  const fullUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/blogs/${blog.slug}`;
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
    `Click here & start reading now! ${fullUrl}`
  )}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(fullUrl)}&text=${encodeURIComponent(
    "Click here & start reading now!"
  )}`;

  const blogPostingJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.excerpt,
    image: blog.coverImage ? [blog.coverImage] : undefined,
    datePublished: blog.publishedAt,
    dateModified: blog.updatedAt || blog.publishedAt,
    author: {
      "@type": "Person",
      name: blog.author?.name || "Admin",
    },
    publisher: {
      "@type": "Organization",
      name: "ISKCON Gambheeram Visakhapatnam",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://harekrishnavizag.org"}/blogs/${blog.slug}`,
    },
  };

  return (
    <PageLayout>
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
    />
    <main className="bg-white dark:bg-background pt-20">
      <article className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs md:text-sm text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blogs" className="hover:text-foreground transition">Blogs</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground/90 truncate">{blog.title}</span>
        </nav>

        <div className="grid lg:grid-cols-[1fr_300px] gap-10">
          {/* ─── MAIN CONTENT ─── */}
          <div className="min-w-0">
            {/* Category pill */}
            <Link
              href={`/blogs/categories/${catSlug(blog.category)}`}
              className="inline-block text-primary font-semibold text-sm hover:underline mb-3"
            >
              {blog.category}
            </Link>

            <h1 className="text-3xl md:text-5xl font-bold leading-tight tracking-tight mb-4">
              {blog.title}
            </h1>

            {blog.excerpt && (
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-3xl">
                {blog.excerpt}
              </p>
            )}

            {/* Hero image */}
            {blog.coverImage && (
              <div className="rounded-2xl overflow-hidden mb-6 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-auto object-cover"
                />
              </div>
            )}

            {/* Meta strip — read time + updated */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8 pb-6 border-b">
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-primary" />
                {blog.readTime} min read
              </span>
              <span>•</span>
              <span>Updated {fmtDate(blog.updatedAt || blog.publishedAt || blog.createdAt)}</span>
            </div>

            {/* HTML content from CKEditor */}
            <div
              className="blog-content prose prose-neutral max-w-none"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />

            {/* Author block */}
            <div className="flex items-center gap-4 mt-12 pt-8 border-t">
              {blog.author?.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={blog.author.avatar}
                  alt={blog.author.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-primary/20"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-primary/15 grid place-items-center text-xl font-bold text-primary">
                  {(blog.author?.name || "A").charAt(0)}
                </div>
              )}
              <div>
                <div className="font-bold text-lg leading-tight">
                  {blog.author?.name || "Admin"}
                </div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  {fmtDate(blog.publishedAt || blog.createdAt)} · {blog.readTime} min read
                </div>
                {blog.author?.bio && (
                  <p className="text-sm text-muted-foreground mt-2 max-w-md">{blog.author.bio}</p>
                )}
              </div>
            </div>

            {/* Share */}
            <div className="mt-8">
              <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
                Share:
              </h4>
              <div className="flex flex-wrap gap-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#25D366] text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1877F2] text-white text-sm font-semibold hover:opacity-90 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  Facebook
                </a>
                <a
                  href={twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-foreground text-background text-sm font-semibold hover:opacity-90 transition"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                  Twitter
                </a>
              </div>
            </div>

            {/* Popular Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mt-8">
                <h4 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-3">
                  Popular Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Link
                    href={`/blogs/categories/${catSlug(blog.category)}`}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/15 transition"
                  >
                    {blog.category}
                  </Link>
                  {blog.tags.map((t) => (
                    <Link
                      key={t}
                      href={`/blogs?tag=${encodeURIComponent(t)}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-medium hover:bg-muted/70 transition"
                    >
                      <Tag className="w-3 h-3" /> {t}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ─── SIDEBAR ─── */}
          <aside className="space-y-8 lg:sticky lg:top-24 lg:self-start">
            {/* Explore Categories */}
            <div>
              <h4 className="text-base font-bold mb-4">Explore</h4>
              <div className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                Categories
              </div>
              <div className="space-y-2">
                {populatedCats.map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/blogs/categories/${cat.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition group"
                  >
                    <span className="text-sm font-medium group-hover:text-primary transition">
                      {cat.name}
                    </span>
                    <span className="text-xs text-muted-foreground">{cat.count}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Seva promotions — real pages on this site, with each seva's actual image */}
            <div>
              <h4 className="text-base font-bold mb-4">Support Our Sevas</h4>
              <div className="space-y-3">
                {[
                  {
                    href: `/anna-daan-seva?utm_source=blog&utm_medium=sidebar&utm_campaign=${blog.slug}`,
                    title: "Anna Daan Seva",
                    sub: "Feed thousands of devotees",
                    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677363792-1783677363601-462395264797134589073566144398536696847591n.jpg",
                  },
                  {
                    href: `/gau-seva?utm_source=blog&utm_medium=sidebar&utm_campaign=${blog.slug}`,
                    title: "Gau Seva",
                    sub: "Protect indigenous cows",
                    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783676646237-1783676645536-ChatGPTImageJul102026031357PM.png",
                  },
                  {
                    href: `/alankara-vastra-seva?utm_source=blog&utm_medium=sidebar&utm_campaign=${blog.slug}`,
                    title: "Vastra & Alankara Seva",
                    sub: "Offer garments to the Deities",
                    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783677419371-1783677418690-DietyPhotos.jpeg",
                  },
                  {
                    href: `/gita-daan-seva?utm_source=blog&utm_medium=sidebar&utm_campaign=${blog.slug}`,
                    title: "Gita Daan Seva",
                    sub: "Spread the wisdom of Krishna",
                    image: "https://pub-32ade8e1209149f980ffe2aa4ddc6c99.r2.dev/media-library/1783672760162-1783672758959-ChatGPTImageJul92026043444PM.png",
                  },
                ].map((ad) => (
                  <Link
                    key={ad.href}
                    href={ad.href}
                    className="block group relative overflow-hidden rounded-xl border hover:shadow-lg transition"
                  >
                    <div className="relative aspect-[16/9]">
                      <Image
                        src={ad.image}
                        alt={ad.title}
                        fill
                        sizes="300px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                      <div className="absolute inset-x-0 bottom-0 p-4">
                        <div className="text-white font-bold text-base leading-tight">
                          {ad.title}
                        </div>
                        <div className="text-white/90 text-xs mt-1">{ad.sub}</div>
                      </div>
                      <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/20 backdrop-blur flex items-center justify-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition">
                        →
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </article>

      {/* ─── RELATED ─── */}
      {related.length > 0 && (
        <section className="bg-white dark:bg-background py-12 md:py-16 border-t mt-12">
          <div className="container mx-auto px-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-1">
              Related
            </h2>
            <h3 className="text-2xl md:text-3xl font-bold mb-8">Blogs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {related.slice(0, 5).map((r) => (
                <Link
                  key={r._id}
                  href={`/blogs/${r.slug}`}
                  className="group block bg-card rounded-2xl overflow-hidden border hover:shadow-md transition"
                >
                  <div
                    className="aspect-[16/10] bg-cover bg-center"
                    style={{
                      backgroundImage: r.coverImage
                        ? `url(${r.coverImage})`
                        : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                    }}
                  />
                  <div className="p-4">
                    <h4 className="font-bold text-sm leading-snug group-hover:text-primary transition line-clamp-2 mb-2">
                      {r.title}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      {r.author?.avatar ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={r.author.avatar}
                          alt=""
                          className="w-5 h-5 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-5 h-5 rounded-full bg-primary/15 grid place-items-center text-[8px] font-bold text-primary">
                          {(r.author?.name || "A").charAt(0)}
                        </div>
                      )}
                      <span className="truncate">{r.author?.name || "Admin"}</span>
                      <span>·</span>
                      <span className="whitespace-nowrap">{fmtDate(r.publishedAt)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CKEditor content styles */}
      <style>{`
        .blog-content { color: hsl(var(--foreground)); line-height: 1.85; font-size: 17px; }
        .blog-content h1 { font-size: 2.25rem; font-weight: 700; margin: 2rem 0 1rem; line-height: 1.2; }
        .blog-content h2 { font-size: 1.75rem; font-weight: 700; margin: 2rem 0 0.85rem; line-height: 1.25; }
        .blog-content h3 { font-size: 1.35rem; font-weight: 600; margin: 1.5rem 0 0.65rem; line-height: 1.3; }
        .blog-content p { margin: 0.85rem 0; }
        .blog-content ul, .blog-content ol { padding-left: 1.5rem; margin: 0.85rem 0; }
        .blog-content ul li { list-style: disc; margin: 0.35rem 0; }
        .blog-content ol li { list-style: decimal; margin: 0.35rem 0; }
        .blog-content a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
        .blog-content a:hover { opacity: 0.8; }
        .blog-content strong { font-weight: 700; color: hsl(var(--foreground)); }
        .blog-content img {
          max-width: 100%; height: auto;
          border-radius: 12px;
          margin: 1.5rem auto;
          display: block;
          box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        .blog-content figure { margin: 1.5rem 0; }
        .blog-content figure figcaption {
          text-align: center; color: hsl(var(--muted-foreground));
          font-size: 0.85rem; margin-top: 0.5rem; font-style: italic;
        }
        .blog-content blockquote {
          border-left: 4px solid hsl(var(--primary));
          padding: 0.75rem 0 0.75rem 1.5rem;
          margin: 1.5rem 0;
          color: hsl(var(--muted-foreground));
          font-style: italic;
          background: hsl(var(--muted) / 0.4);
          border-radius: 0 8px 8px 0;
        }
        .blog-content table { border-collapse: collapse; width: 100%; margin: 1.5rem 0; }
        .blog-content table td, .blog-content table th {
          border: 1px solid hsl(var(--border));
          padding: 0.7rem 0.85rem;
          text-align: left;
        }
        .blog-content table th { background: hsl(var(--muted)); font-weight: 600; }
        .blog-content code {
          background: hsl(var(--muted));
          padding: 0.15rem 0.4rem;
          border-radius: 4px;
          font-size: 0.9em;
          font-family: ui-monospace, SFMono-Regular, monospace;
        }
        .scrollbar-hide::-webkit-scrollbar { display: none; }
      `}</style>
    </main>
    </PageLayout>
  );
}

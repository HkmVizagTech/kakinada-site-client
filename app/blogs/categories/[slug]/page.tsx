import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import PageLayout from "@/components/PageLayout";

interface Blog {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage?: string;
  category: string;
  author: { name: string; avatar?: string };
  publishedAt?: string;
  createdAt: string;
  readTime: number;
}

interface CategoryEntry {
  name: string;
  slug: string;
  count: number;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";

async function getCategories(): Promise<CategoryEntry[]> {
  try {
    const res = await fetch(`${API_URL}/blogs-proxy/categories`, { cache: "no-store" });
    if (!res.ok) return [];
    return (await res.json()).categories || [];
  } catch (_) {
    return [];
  }
}
async function getBlogsForCategory(name: string): Promise<Blog[]> {
  try {
    const res = await fetch(
      `${API_URL}/blogs-proxy?category=${encodeURIComponent(name)}&limit=50`,
      { cache: "no-store" }
    );
    if (!res.ok) return [];
    return (await res.json()).blogs || [];
  } catch (_) {
    return [];
  }
}

const fmtDate = (s?: string) =>
  s
    ? new Date(s).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  return {
    title: cat ? `${cat.name} · Blogs · Hare Krishna Vaikuntham` : "Category · Blogs",
    description: cat ? `Read all blog posts in the ${cat.name} category.` : undefined,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const categories = await getCategories();
  const cat = categories.find((c) => c.slug === slug);
  if (!cat) notFound();

  const blogs = await getBlogsForCategory(cat.name);
  const otherCats = categories.filter((c) => c.slug !== slug && c.count > 0).slice(0, 8);

  return (
    <PageLayout>
    <main className="bg-white dark:bg-background pt-20">
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="text-xs md:text-sm text-muted-foreground mb-6 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-foreground transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href="/blogs" className="hover:text-foreground transition">Blogs</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-foreground/90">{cat.name}</span>
        </nav>

        <header className="mb-10 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">
            Category
          </p>
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-3">
            {cat.name}
          </h1>
          <p className="text-muted-foreground">
            {cat.count} {cat.count === 1 ? "post" : "posts"} in this category
          </p>
        </header>

        {blogs.length === 0 ? (
          <div className="text-center py-16 bg-muted/30 rounded-2xl">
            <p className="text-muted-foreground">No posts in this category yet.</p>
            <Link
              href="/blogs"
              className="inline-block mt-4 text-primary font-semibold hover:underline"
            >
              ← Back to all blogs
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {blogs.map((b) => (
              <Link
                key={b._id}
                href={`/blogs/${b.slug}`}
                className="group block bg-card rounded-2xl overflow-hidden border hover:shadow-md transition"
              >
                <div
                  className="aspect-[16/10] bg-cover bg-center"
                  style={{
                    backgroundImage: b.coverImage
                      ? `url(${b.coverImage})`
                      : "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent)))",
                  }}
                />
                <div className="p-5">
                  <h3 className="font-bold text-base leading-snug group-hover:text-primary transition line-clamp-2 mb-2">
                    {b.title}
                  </h3>
                  {b.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {b.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {b.author?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={b.author.avatar}
                        alt=""
                        className="w-6 h-6 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-primary/15 grid place-items-center text-[10px] font-bold text-primary">
                        {(b.author?.name || "A").charAt(0)}
                      </div>
                    )}
                    <span>By {b.author?.name || "Admin"}</span>
                    <span>·</span>
                    <span>{fmtDate(b.publishedAt || b.createdAt)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Other categories — small nav */}
        {otherCats.length > 0 && (
          <section className="border-t pt-12">
            <h2 className="text-lg font-bold mb-4">Other Categories</h2>
            <div className="flex flex-wrap gap-2">
              {otherCats.map((c) => (
                <Link
                  key={c.slug}
                  href={`/blogs/categories/${c.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted hover:bg-primary/10 hover:text-primary transition text-sm font-medium"
                >
                  {c.name}
                  <span className="text-xs text-muted-foreground">({c.count})</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
    </PageLayout>
  );
}

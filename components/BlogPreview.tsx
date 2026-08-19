"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import Ornament from "@/components/Ornament";
import { ArrowRight, Clock, Calendar } from "lucide-react";

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

const BlogPreview = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);

  useEffect(() => {
    async function fetchBlogs() {
      try {
        const res = await fetch(
          `${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080"}/blogs-proxy?limit=3`
        );
        if (!res.ok) return;
        const data = await res.json();
        if (Array.isArray(data.blogs)) setBlogs(data.blogs.slice(0, 3));
      } catch {}
    }
    fetchBlogs();
  }, []);

  // Hide the whole section gracefully if there are no published posts yet
  if (blogs.length === 0) return null;

  const fmtDate = (s?: string) =>
    s
      ? new Date(s).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "";

  return (
    <section className="py-12 md:py-16 bg-white dark:bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10"
        >
          <p className="text-gold text-sm tracking-[0.2em] uppercase mb-4 font-medium">
            Blog
          </p>
          <Ornament className="mb-5" />
          <h2 className="font-heading text-3xl md:text-5xl font-bold text-foreground mb-6">
            Spiritual Wisdom &amp; Stories
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Timeless teachings, festival guides, and inspiration from the Hare
            Krishna Movement, Visakhapatnam.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {blogs.map((blog, index) => (
            <motion.article
              key={blog._id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.15 }}
            >
              <Link
                href={`/blogs/${blog.slug}`}
                className="group block h-full bg-card rounded-2xl overflow-hidden border border-border/60 shadow-sm hover:shadow-elevated hover:-translate-y-1 transition-all duration-300"
              >
                <div
                  className="aspect-[16/10] bg-cover bg-center"
                  style={{
                    backgroundImage: blog.coverImage
                      ? `url(${blog.coverImage})`
                      : "var(--gradient-ocean)",
                  }}
                />
                <div className="p-5">
                  <div className="text-xs font-semibold uppercase tracking-wide text-secondary mb-2">
                    {blog.category}
                  </div>
                  <h3 className="font-semibold text-lg leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2 mb-2">
                    {blog.title}
                  </h3>
                  {blog.excerpt && (
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                      {blog.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {fmtDate(blog.publishedAt || blog.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {blog.readTime} min read
                    </span>
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center mt-12"
        >
          <Link
            href="/blogs"
            className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all"
          >
            View All Articles <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default BlogPreview;

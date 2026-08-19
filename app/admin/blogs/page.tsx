"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";
import { useAuth } from "@/contexts/AuthContext";

import { useState, useEffect, useRef } from "react";
import nextDynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Plus, Pencil, Trash2, X, Eye, Search, Calendar, Clock,
  FileText, Upload, Star, User, Loader2,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useAdminLoader } from "@/contexts/AdminLoaderContext";

const RichTextEditor = nextDynamic(() => import("@/components/ui/rich-text-editor"), {
  ssr: false,
  loading: () => (
    <div className="text-sm text-muted-foreground px-3 py-12 border rounded-md bg-muted/30 text-center">
      Loading editor…
    </div>
  ),
});

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
  status: "draft" | "published";
  publishedAt?: string;
  readTime: number;
  views: number;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  metaTitle?: string;
  metaDescription?: string;
  deletionRequested?: boolean;
  deletionRequestedAt?: string;
}

// GVD-style 13 categories
const CATEGORIES = [
  "Krishna Katha",
  "Vaishnava Songs and Prayers",
  "Our Acharyas",
  "Spiritual Knowledge",
  "Sacred Festivals & Occasions",
  "Spiritual News & Events",
  "Spiritual Charity",
  "Timeless Wisdom",
  "Divine Poetics",
  "Krishna Consciousness",
  "Recipes",
  "Pilgrimage",
  "Other",
];

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";

export default function AdminBlogs() {
  const { user } = useAuth();
  const isBlogsAdmin = user?.role === "blogs_admin";
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Blog | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState({ status: "all", category: "", q: "" });
  const { show, hide } = useAdminLoader();

  const emptyForm = {
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    category: "Spiritual Knowledge",
    tags: "" as string,
    authorName: "Admin",
    authorAvatar: "",
    authorBio: "",
    authorSlug: "",
    status: "draft" as "draft" | "published",
    featured: false,
    metaTitle: "",
    metaDescription: "",
  };
  const [form, setForm] = useState(emptyForm);
  const coverFileRef = useRef<File | null>(null);
  const authorAvatarFileRef = useRef<File | null>(null);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("status", filter.status);
      if (filter.category) params.set("category", filter.category);
      if (filter.q) params.set("q", filter.q);
      params.set("limit", "50");
      const res = await authFetch(`${API_URL}/blogs?${params.toString()}`, {
        credentials: "include",
      });
      const json = await res.json();
      if (res.ok) setBlogs(json.blogs || []);
      else toast({ title: "Failed to load blogs", description: json.message, variant: "destructive" });
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter.status, filter.category]);

  const openCreate = () => {
    setForm(emptyForm);
    coverFileRef.current = null;
    authorAvatarFileRef.current = null;
    setEditing(null);
    setShowForm(true);
  };

  const [loadingEditId, setLoadingEditId] = useState<string | null>(null);

  const openEdit = async (blog: Blog) => {
    // The list endpoint (GET /blogs) deliberately strips `content` for
    // payload size — that's why Edit was showing an empty editor. Fetch
    // the single post (which DOES include content) before opening the
    // form, so the editor always loads with the real, current content.
    setLoadingEditId(blog._id);
    let full: Blog = blog;
    try {
      const res = await authFetch(`${API_URL}/blogs/${blog._id}?preview=1`, { credentials: "include" });
      const json = await res.json();
      if (res.ok && json.blog) full = json.blog;
      else toast({ title: "Couldn't refresh full content", description: "Showing cached data — please verify before publishing.", variant: "destructive" });
    } catch {
      toast({ title: "Network error loading post", description: "Showing cached data — please verify before publishing.", variant: "destructive" });
    } finally {
      setLoadingEditId(null);
    }

    setForm({
      title: full.title,
      slug: full.slug,
      excerpt: full.excerpt || "",
      content: full.content || "",
      coverImage: full.coverImage || "",
      category: full.category || "Spiritual Knowledge",
      tags: (full.tags || []).join(", "),
      authorName: full.author?.name || "Admin",
      authorAvatar: full.author?.avatar || "",
      authorBio: full.author?.bio || "",
      authorSlug: full.author?.slug || "",
      status: full.status,
      featured: full.featured || false,
      metaTitle: full.metaTitle || "",
      metaDescription: full.metaDescription || "",
    });
    coverFileRef.current = null;
    authorAvatarFileRef.current = null;
    setEditing(full);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditing(null);
    coverFileRef.current = null;
    authorAvatarFileRef.current = null;
  };

  const handleSubmit = async (e: React.FormEvent, asStatus?: "draft" | "published") => {
    e.preventDefault();
    if (!form.title.trim()) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    if (!form.content || form.content.replace(/<[^>]*>/g, "").trim().length < 30) {
      toast({
        title: "Content too short",
        description: "Add at least 30 characters of body text.",
        variant: "destructive",
      });
      return;
    }

    const finalStatus = asStatus || form.status;
    setSubmitting(true);
    show && show(editing ? "Updating blog…" : "Creating blog…");
    try {
      const fd = new FormData();
      fd.append("title", form.title);
      if (form.slug) fd.append("slug", form.slug);
      fd.append("excerpt", form.excerpt);
      fd.append("content", form.content);
      fd.append("category", form.category);
      fd.append("tags", form.tags);
      fd.append("status", finalStatus);
      fd.append("featured", String(form.featured));
      fd.append("metaTitle", form.metaTitle);
      fd.append("metaDescription", form.metaDescription);

      // Author block — flat fields the backend will assemble
      fd.append("authorName", form.authorName || "Admin");
      fd.append("authorBio", form.authorBio || "");
      fd.append("authorSlug", form.authorSlug || "");
      if (form.authorAvatar && !authorAvatarFileRef.current) {
        fd.append("authorAvatar", form.authorAvatar);
      }
      if (authorAvatarFileRef.current) {
        fd.append("authorAvatar", authorAvatarFileRef.current);
      }

      // Cover image - URL or file
      if (form.coverImage && !coverFileRef.current) {
        fd.append("coverImage", form.coverImage);
      }
      if (coverFileRef.current) {
        fd.append("coverImage", coverFileRef.current);
      }

      const url = editing ? `${API_URL}/blogs/${editing._id}` : `${API_URL}/blogs`;
      const method = editing ? "PUT" : "POST";
      const res = await authFetch(url, { method, body: fd, credentials: "include" });
      const json = await res.json();

      if (res.ok) {
        toast({
          title: editing ? "Blog updated" : "Blog created",
          description: finalStatus === "published" ? "Now live on the website." : "Saved as draft.",
        });
        closeForm();
        fetchBlogs();
      } else {
        const msg = json.errors?.[0]?.msg || json.message || "Save failed";
        toast({ title: "Failed to save", description: msg, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setSubmitting(false);
      hide && hide();
    }
  };

  const handleDelete = async (blog: Blog) => {
    const confirmMsg = isBlogsAdmin
      ? `Request deletion of "${blog.title}"? An admin will need to approve this before it's removed.`
      : `Delete "${blog.title}"? This cannot be undone.`;
    if (!confirm(confirmMsg)) return;
    show && show(isBlogsAdmin ? "Requesting…" : "Deleting…");
    try {
      const res = await authFetch(`${API_URL}/blogs/${blog._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json().catch(() => ({}));
      if (res.ok) {
        toast({ title: isBlogsAdmin ? "Deletion requested" : "Deleted", description: isBlogsAdmin ? json.message : undefined });
        fetchBlogs();
      } else {
        toast({ title: "Delete failed", variant: "destructive" });
      }
    } finally {
      hide && hide();
    }
  };

  const visible = blogs.filter((b) =>
    filter.q ? b.title.toLowerCase().includes(filter.q.toLowerCase()) : true
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Blogs
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Write and publish blog articles. Uses a rich-text editor with image upload.
          </p>
        </div>
        <Button onClick={openCreate} className="rounded-md">
          <Plus className="w-4 h-4 mr-2" /> New Post
        </Button>
      </div>

      <Card className="mb-5">
        <CardContent className="p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by title…"
              value={filter.q}
              onChange={(e) => setFilter((f) => ({ ...f, q: e.target.value }))}
              className="pl-9"
            />
          </div>
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
          >
            <option value="all">All status</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
          <select
            value={filter.category}
            onChange={(e) => setFilter((f) => ({ ...f, category: e.target.value }))}
            className="h-9 px-3 rounded-md border border-input bg-background text-sm max-w-[240px]"
          >
            <option value="">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center text-muted-foreground py-16">Loading…</div>
      ) : visible.length === 0 ? (
        <Card>
          <CardContent className="text-center py-16">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No blogs yet. Click "New Post" to start.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((blog) => (
            <Card key={blog._id} className="overflow-hidden hover:shadow-md transition">
              {blog.coverImage ? (
                <div
                  className="aspect-[16/9] bg-cover bg-center"
                  style={{ backgroundImage: `url(${blog.coverImage})` }}
                />
              ) : (
                <div className="aspect-[16/9] bg-muted flex items-center justify-center text-muted-foreground">
                  <FileText className="w-8 h-8 opacity-30" />
                </div>
              )}
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant={blog.status === "published" ? "default" : "secondary"}>
                    {blog.status}
                  </Badge>
                  <Badge variant="outline" className="truncate max-w-[140px]">
                    {blog.category}
                  </Badge>
                  {blog.featured && (
                    <Badge className="bg-yellow-500 hover:bg-yellow-500/90 text-white">
                      <Star className="w-3 h-3 mr-1" /> Featured
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-base line-clamp-2 mb-1">{blog.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-3 min-h-[2.4em]">
                  {blog.excerpt || "—"}
                </p>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-3 flex-wrap">
                  {blog.author?.avatar ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={blog.author.avatar}
                      alt=""
                      className="w-5 h-5 rounded-full object-cover"
                    />
                  ) : (
                    <User className="w-3.5 h-3.5" />
                  )}
                  <span>{blog.author?.name || "Admin"}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {blog.publishedAt
                      ? new Date(blog.publishedAt).toLocaleDateString()
                      : new Date(blog.createdAt).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {blog.readTime} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> {blog.views}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 flex-1"
                    disabled={loadingEditId === blog._id}
                    onClick={() => openEdit(blog)}
                  >
                    {loadingEditId === blog._id ? (
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    ) : (
                      <Pencil className="w-3.5 h-3.5 mr-1.5" />
                    )}
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(blog)}
                    disabled={!!blog.deletionRequested}
                    title={
                      blog.deletionRequested
                        ? "Deletion already requested — waiting on admin approval"
                        : isBlogsAdmin
                        ? "Request deletion (needs admin approval)"
                        : "Delete"
                    }
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
                {blog.deletionRequested && (
                  <Badge variant="outline" className="mt-2 w-full justify-center border-amber-300 bg-amber-50 text-amber-700">
                    Deletion pending approval
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center overflow-y-auto p-4"
            onClick={(e) => e.target === e.currentTarget && closeForm()}
          >
            <motion.div
              initial={{ scale: 0.96, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0, y: 10 }}
              className="bg-background w-full max-w-4xl rounded-xl shadow-2xl my-8"
            >
              <div className="flex items-center justify-between p-5 border-b">
                <h2 className="text-lg font-semibold">
                  {editing ? "Edit Blog Post" : "New Blog Post"}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form className="p-5 space-y-4" onSubmit={(e) => handleSubmit(e)}>
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Catchy blog post title…"
                    className="mt-1.5 text-lg font-semibold"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Slug (URL)
                    </label>
                    <Input
                      value={form.slug}
                      onChange={(e) => setForm({ ...form, slug: e.target.value })}
                      placeholder="auto-from-title"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Category
                    </label>
                    <select
                      value={form.category}
                      onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="mt-1.5 h-10 w-full px-3 rounded-md border border-input bg-background text-sm"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Excerpt (used in cards &amp; SEO)
                  </label>
                  <Textarea
                    value={form.excerpt}
                    onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
                    placeholder="A short 1-2 sentence summary…"
                    rows={2}
                    className="mt-1.5 resize-none"
                    maxLength={500}
                  />
                </div>

                {/* Cover image */}
                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Cover Image
                  </label>
                  <div className="mt-1.5 flex items-center gap-3">
                    {form.coverImage && (
                      <div
                        className="w-24 h-16 rounded-md bg-cover bg-center border"
                        style={{ backgroundImage: `url(${form.coverImage})` }}
                      />
                    )}
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer hover:bg-muted/50 transition">
                      <Upload className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {coverFileRef.current
                          ? coverFileRef.current.name
                          : form.coverImage
                          ? "Replace cover image"
                          : "Click to upload cover image"}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) {
                            coverFileRef.current = f;
                            const url = URL.createObjectURL(f);
                            setForm((cur) => ({ ...cur, coverImage: url }));
                          }
                        }}
                      />
                    </label>
                  </div>
                </div>

                {/* Author block */}
                <fieldset className="border rounded-md p-4">
                  <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-2">
                    Author
                  </legend>
                  <div className="grid grid-cols-1 md:grid-cols-[80px_1fr] gap-4 items-start">
                    {/* Avatar upload */}
                    <div>
                      <label className="block cursor-pointer">
                        <div
                          className="w-20 h-20 rounded-full bg-cover bg-center border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex items-center justify-center text-muted-foreground transition"
                          style={form.authorAvatar ? { backgroundImage: `url(${form.authorAvatar})`, borderStyle: "solid" } : undefined}
                        >
                          {!form.authorAvatar && <User className="w-7 h-7 opacity-40" />}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              authorAvatarFileRef.current = f;
                              const url = URL.createObjectURL(f);
                              setForm((cur) => ({ ...cur, authorAvatar: url }));
                            }
                          }}
                        />
                      </label>
                      <p className="text-[10px] text-muted-foreground text-center mt-1">Avatar</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Name</label>
                        <Input
                          value={form.authorName}
                          onChange={(e) => setForm({ ...form, authorName: e.target.value })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-muted-foreground">Author Slug</label>
                        <Input
                          value={form.authorSlug}
                          onChange={(e) => setForm({ ...form, authorSlug: e.target.value })}
                          placeholder="auto-from-name"
                          className="mt-1"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-semibold text-muted-foreground">Bio</label>
                        <Textarea
                          value={form.authorBio}
                          onChange={(e) => setForm({ ...form, authorBio: e.target.value })}
                          placeholder="Short author bio (optional)"
                          rows={2}
                          className="mt-1 resize-none"
                        />
                      </div>
                    </div>
                  </div>
                </fieldset>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Tags (comma-separated)
                    </label>
                    <Input
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                      placeholder="krishna, ekadashi, festival"
                      className="mt-1.5"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Featured
                    </label>
                    <label className="mt-1.5 h-10 px-3 rounded-md border border-input bg-background text-sm flex items-center gap-2 cursor-pointer hover:bg-muted/30 transition">
                      <input
                        type="checkbox"
                        checked={form.featured}
                        onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                        className="rounded"
                      />
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span>Show in "Popular blogs" section</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Content <span className="text-red-500">*</span>
                  </label>
                  <div className="mt-1.5">
                    <RichTextEditor
                      value={form.content}
                      onChange={(html) => setForm((cur) => ({ ...cur, content: html }))}
                    />
                  </div>
                </div>

                <details className="border rounded-md">
                  <summary className="px-4 py-2.5 text-sm font-medium cursor-pointer select-none hover:bg-muted/50">
                    SEO Settings (optional)
                  </summary>
                  <div className="p-4 pt-2 space-y-3 border-t">
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Meta Title
                      </label>
                      <Input
                        value={form.metaTitle}
                        onChange={(e) => setForm({ ...form, metaTitle: e.target.value })}
                        placeholder="Defaults to post title"
                        className="mt-1.5"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Meta Description
                      </label>
                      <Textarea
                        value={form.metaDescription}
                        onChange={(e) => setForm({ ...form, metaDescription: e.target.value })}
                        placeholder="Defaults to excerpt"
                        rows={2}
                        className="mt-1.5 resize-none"
                      />
                    </div>
                  </div>
                </details>

                <div className="flex items-center justify-end gap-2 pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeForm}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, "draft")}
                  >
                    Save Draft
                  </Button>
                  <Button
                    type="button"
                    disabled={submitting}
                    onClick={(e) => handleSubmit(e, "published")}
                  >
                    {submitting
                      ? "Saving…"
                      : editing && editing.status === "published"
                      ? "Update"
                      : "Publish"}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, X, Download, Copy } from "lucide-react";
import ImageUpload from "@/components/ui/image-upload";
import { useRouter } from "next/navigation";

export default function AdminFestivals() {
  const [festivals, setFestivals] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<any>({ title: "", description: "", image: "", slug: "" });
  const fileRef = useRef<File | null>(null);
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [modalCopied, setModalCopied] = useState(false);
  const [lastCreated, setLastCreated] = useState<any | null>(null);

  useEffect(() => { fetchFestivals(); }, []);

  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003";
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.length > 0)
    ? process.env.NEXT_PUBLIC_SITE_URL
    : (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000');

  async function fetchFestivals() {
    setLoading(true);
    try {
      const res = await authFetch(`${apiUrl}/festival-donations`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setFestivals(Array.isArray(data) ? data : []);
    } catch (err) {}
    setLoading(false);
  }

  function slugify(s: string) {
    return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  function getFestivalUrl(slug: string) {
    return `${siteUrl.replace(/\/$/, '')}/festival/${encodeURIComponent(slug)}`;
  }

  async function copyToClipboard(text: string, id?: string) {
    try {
      await navigator.clipboard.writeText(text);
      if (id) {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      } else {
        setModalCopied(true);
        setTimeout(() => setModalCopied(false), 2000);
      }
    } catch (e) {
    }
  }

  const openCreate = () => {
    setEditing(null);
  setForm({ title: "", description: "", image: "", slug: "" });
    fileRef.current = null;
    setShowModal(true);
  };

  const openEdit = (f: any) => {
    setEditing(f);
  setForm({ title: f.title, description: f.description || "", image: f.images?.[0] || "", slug: f.slug || "" });
    fileRef.current = null;
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await authFetch(`${apiUrl}/festival-donations/${id}`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) fetchFestivals();
    } catch (err) {}
  };

  const exportCSV = (f: any) => {
  const cols = ['title','slug','description','active'];
  const rows = [cols.map(c => JSON.stringify(f[c] ?? '')).join(',')];
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `festival-${f._id || f.id}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  const submit = async () => {
  setSubmitting(true);
    try {
      const payload: any = {
        title: form.title,
        slug: form.slug || slugify(form.title || ''),
        description: form.description,
        images: form.image ? [form.image] : [],
        donationOptions: []
      };
      let res;
      if (editing) {
        res = await authFetch(`${apiUrl}/festival-donations/${editing._id || editing.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
      } else {
        res = await authFetch(`${apiUrl}/festival-donations`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
      }
      if (res.ok) {
        try {
          const created = await res.json();
          setLastCreated(created);
        } catch (e) {
        }
        fetchFestivals();
        setShowModal(false);
      }
    } catch (err) {}
  setSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {
}
      {lastCreated && (
        <div className="bg-card border rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-sm">Festival created. Share this link:</div>
            <a href={getFestivalUrl(lastCreated.slug)} target="_blank" rel="noreferrer" className="font-medium underline break-all">{getFestivalUrl(lastCreated.slug)}</a>
            <Button variant="ghost" size="sm" onClick={() => copyToClipboard(getFestivalUrl(lastCreated.slug))}><Copy className="w-4 h-4"/></Button>
          </div>
          <div>
            <Button variant="ghost" size="sm" onClick={() => setLastCreated(null)}>Dismiss</Button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Festivals</h1>
          <p className="text-muted-foreground">Create dynamic festival donation pages (title, image, description, amount)</p>
        </div>
        <Button onClick={openCreate}><Plus className="w-4 h-4 mr-2"/> Add Festival</Button>
      </div>

      <section className="py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {!festivals.length && !loading && <div className="text-center text-muted-foreground col-span-full py-10">No festivals found.</div>}
          {festivals.map((f) => (
            <div key={f._id || f.id} className="bg-card rounded-2xl overflow-hidden flex flex-col shadow transition transform hover:-translate-y-1 hover:shadow-lg hover:ring-1 hover:ring-[#062460]/20 hover:bg-[#062460]/10">
              {
}
              <div className="relative w-full h-44 bg-muted-foreground/5 group">
                {f.images?.[0] ? (
                  <img
                    src={typeof f.images[0] === 'string' ? f.images[0] : (f.images[0]?.url || '')}
                    alt={f.title}
                    className="w-full h-full object-cover"
                  />
                  ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground group-hover:text-[#062460] transition-colors">No image</div>
                )}
                
              </div>

              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-lg leading-tight mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-4 mb-3 flex-1">{f.description}</p>
                {
}
                {f.slug && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                    <a href={getFestivalUrl(f.slug)} target="_blank" rel="noreferrer" className="underline break-all">{getFestivalUrl(f.slug)}</a>
                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(getFestivalUrl(f.slug), f._id || f.id)} className="ml-2">
                      <Copy className="w-4 h-4" />
                    </Button>
                    {copiedId === (f._id || f.id) && <span className="text-success text-xs ml-1">Copied</span>}
                  </div>
                )}
                <div className="mt-2 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(f)}
                      className="text-primary hover:bg-[#062460]/10 hover:text-[#062460] transition-colors"
                    >
                      <Pencil className="w-4 h-4"/>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/admin/festivals/${f._id || f.id}/donations`)}
                      className="border-primary text-primary hover:bg-[#062460]/10 hover:text-[#062460] hover:border-[#062460]/30 transition-colors"
                    >
                      Donations
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportCSV(f)}
                      className="text-primary hover:bg-[#062460]/10 hover:text-[#062460] transition-colors"
                    >
                      <Download className="w-4 h-4"/>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(f._id || f.id)}
                      className="text-destructive ml-auto hover:bg-[#062460]/10 hover:text-[#062460] transition-colors"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {
}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-2xl shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">{editing ? 'Edit Festival' : 'Create Festival'}</h2>
              <button onClick={() => setShowModal(false)}><X className="w-5 h-5"/></button>
            </div>
            <div className="space-y-4">
              <ImageUpload value={form.image} onChange={(url, f) => { setForm({ ...form, image: url }); if (f) fileRef.current = f; }} />
              <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              <Input placeholder="Slug (optional)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              {
}
              <div className="text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="break-all">{getFestivalUrl(form.slug || slugify(form.title || ''))}</span>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(getFestivalUrl(form.slug || slugify(form.title || '')))}>
                    <Copy className="w-4 h-4" />
                  </Button>
                  {modalCopied && <span className="text-success text-sm">Copied</span>}
                </div>
              </div>
              <Textarea placeholder="Description" rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={submit} disabled={submitting}>{submitting ? (editing ? 'Updating...' : 'Creating...') : (editing ? 'Update' : 'Create')}</Button>
                <Button variant="outline" onClick={() => setShowModal(false)} disabled={submitting}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

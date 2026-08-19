"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Image as ImageIcon, Upload, Search, Copy, Check, Trash2, Loader2, Pencil, X,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  publicId: string;
  format?: string;
  width?: number;
  height?: number;
  bytes?: number;
  tags?: string;
  createdAt: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

const formatBytes = (b?: number) => {
  if (!b) return "";
  if (b < 1024 * 1024) return `${Math.round(b / 1024)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [q, setQ] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editing, setEditing] = useState<MediaItem | null>(null);
  const [editForm, setEditForm] = useState({ name: "", tags: "" });
  const fileInput = useRef<HTMLInputElement>(null);

  const fetchMedia = async (query = q) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: "60" });
      if (query.trim()) params.set("q", query.trim());
      const res = await authFetch(`${API_URL}/media?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (res.ok) setItems(json.items || []);
      else toast({ title: "Failed to load media", description: json.message, variant: "destructive" });
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      Array.from(files).forEach((f) => fd.append("files", f));
      const res = await authFetch(`${API_URL}/media`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Upload failed");
      setItems((prev) => [...(json.items || []), ...prev]);
      toast({ title: `Uploaded ${json.items?.length || 0} file(s)` });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInput.current) fileInput.current.value = "";
    }
  };

  const copyUrl = (item: MediaItem) => {
    navigator.clipboard.writeText(item.url).then(() => {
      setCopiedId(item._id);
      setTimeout(() => setCopiedId(null), 2000);
      toast({ title: "Link copied", description: item.name });
    });
  };

  const saveEdit = async () => {
    if (!editing) return;
    try {
      const res = await authFetch(`${API_URL}/media/${editing._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(editForm),
      });

      let json: any = {};
      try {
        json = await res.json();
      } catch {
        throw new Error(`Server returned status ${res.status} (not valid JSON) — check server logs`);
      }

      if (!res.ok) throw new Error(json.message || `Update failed (status ${res.status})`);

      setItems((list) => list.map((x) => (x._id === editing._id ? { ...x, ...editForm } : x)));
      setEditing(null);
      toast({ title: "Saved" });
    } catch (e: any) {
      console.error("media saveEdit error:", e);
      toast({ title: "Failed to save", description: e.message, variant: "destructive" });
    }
  };

  const deleteItem = async (item: MediaItem) => {
    if (!window.confirm(`Delete "${item.name}"? Pages already using this link will lose the image.`)) return;
    try {
      const res = await authFetch(`${API_URL}/media/${item._id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Delete failed");
      setItems((list) => list.filter((x) => x._id !== item._id));
      toast({ title: "Deleted", description: item.name });
    } catch (e: any) {
      toast({ title: "Failed to delete", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold">
            <ImageIcon className="h-6 w-6 text-amber-500" /> Media Library
          </h1>
          <p className="text-sm text-muted-foreground">
            Upload images once, copy the link, use it anywhere on the website.
          </p>
        </div>
        <div className="flex gap-2">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search name or tags…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && fetchMedia()}
              className="pl-9"
            />
          </div>
          <Button onClick={() => fileInput.current?.click()} disabled={uploading}>
            {uploading ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Upload className="mr-1.5 h-4 w-4" />}
            Upload
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            multiple
            hidden
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>
      </div>

      {loading ? (
        <p className="py-10 text-center text-sm text-muted-foreground">Loading media…</p>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <ImageIcon className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">
              No media yet. Upload images here and copy their links to use anywhere on the site.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {items.map((item) => (
            <Card key={item._id} className="overflow-hidden">
              <div className="relative aspect-square bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.url}
                  alt={item.name}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="space-y-2 p-3">
                {editing?._id === item._id ? (
                  <div className="space-y-2">
                    <Input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      placeholder="Name"
                      className="h-8 text-xs"
                    />
                    <Input
                      value={editForm.tags}
                      onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })}
                      placeholder="Tags (e.g. sqft hero)"
                      className="h-8 text-xs"
                    />
                    <div className="flex gap-1.5">
                      <Button type="button" size="sm" className="h-7 flex-1 text-xs" onClick={saveEdit}>
                        <Check className="mr-1 h-3 w-3" /> Save
                      </Button>
                      <Button type="button" size="sm" variant="outline" className="h-7 text-xs" onClick={() => setEditing(null)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="truncate text-xs font-semibold" title={item.name}>{item.name}</p>
                    <p className="truncate text-[10px] text-muted-foreground">
                      {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                      {formatBytes(item.bytes)}
                      {item.tags ? ` · ${item.tags}` : ""}
                    </p>
                    <div className="flex gap-1.5">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 flex-1 text-xs"
                        onClick={() => copyUrl(item)}
                      >
                        {copiedId === item._id ? (
                          <Check className="mr-1 h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="mr-1 h-3 w-3" />
                        )}
                        Copy link
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2"
                        onClick={() => {
                          setEditing(item);
                          setEditForm({ name: item.name, tags: item.tags || "" });
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 px-2 text-red-600 hover:bg-red-50"
                        onClick={() => deleteItem(item)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

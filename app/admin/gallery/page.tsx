
"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";


import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, X, Upload, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";

import { getGalleryImages, createGalleryImage, deleteGalleryImage, GALLERY_CATEGORIES, TEMPLE_GALLERY_CATEGORIES } from "@/lib/galleryApi";
import { getToken } from "@/lib/authClient";

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080").replace(/\/+$/, "");
import { useAdminLoader } from "@/contexts/AdminLoaderContext";

const categories = ["All", ...GALLERY_CATEGORIES];

type GalleryGroup = {
  _id?: string;
  title?: string;
  date?: string;
  category?: string;
  type?: string;
  images?: string[];
};

type GroupModalState = { group: GalleryGroup } | null;
type LightboxState = { images: string[]; index: number; group?: GalleryGroup } | null;

export default function AdminGallery() {
  const [images, setImages] = useState<any[]>([]);
  const [filter, setFilter] = useState("All");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadForm, setUploadForm] = useState({
    title: "",
    category: "Daily Darshan",
    displayIn: "darshan",
    date: "",
    files: [] as File[],
    previews: [] as string[],
  });
  const [loading, setLoading] = useState(true);
  const { show, hide } = useAdminLoader();
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});


  useEffect(() => {
    getGalleryImages().then((items) => {
      setImages(items);
      setLoading(false);
    });
  }, []);

  function groupImages(images: GalleryGroup[]) {
    const map = new Map<string, GalleryGroup & { images: string[] }>();
    for (const img of images || []) {
      const key = `${img.title || ''}|${img.date || ''}|${img.category || ''}`;
      if (!map.has(key)) {
        map.set(key, {
          ...img,
          images: Array.isArray(img.images) ? [...img.images] : [],
        });
      } else {
        if (Array.isArray(img.images)) {
          const existing = map.get(key);
          if (existing) existing.images.push(...img.images);
        }
      }
    }
    return Array.from(map.values());
  }

  const filteredByCategory = filter === "All" ? images : images.filter((img) => img.category === filter);
  const filtered = filteredByCategory.filter((img) =>
    sectionFilter === "all" ? true : sectionFilter === "darshan" ? img.type === "darshan" : img.type !== "darshan"
  );
  const grouped = groupImages(filtered);

  const flatImages = [];
  grouped.forEach((group) => {
    if (Array.isArray(group.images)) {
      group.images.forEach((src: string) => {
        flatImages.push({
          src,
          title: group.title,
          date: group.date,
          category: group.category,
          groupId: group._id,
        });
      });
    }
  });

  const [groupModal, setGroupModal] = useState<GroupModalState>(null); // { group, startIndex }
  const [lightbox, setLightbox] = useState<LightboxState>(null); // { images, index }

  const handleDelete = async (id: string) => {
  if (!id) return;
  await deleteGalleryImage(id, getToken() || undefined);
  setImages((prev) => prev.filter((img) => img._id !== id));
  };

  const handleUpload = async () => {
    setFormErrors({});
    if (!uploadForm.title.trim()) {
      setFormErrors({ title: "Please enter a title for the gallery images." });
      return;
    }
    if (!uploadForm.files.length) {
      setFormErrors({ files: "Please select at least one image to upload." });
      return;
    }

    try {
      show("Uploading...");
      const urls: string[] = [];
      const token = getToken();

      for (const file of uploadForm.files) {
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${apiBase()}/gallery/upload-image`, {
          method: "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
        const body = await res.json();
        if (!res.ok || !body.secure_url) {
          throw new Error(body.message || "Image upload to R2 failed");
        }
        urls.push(body.secure_url);
      }
      const newItem = await createGalleryImage({
        title: uploadForm.title,
        images: urls,
        date: uploadForm.date || new Date().toISOString().split("T")[0],
        category: uploadForm.category,
        type: uploadForm.displayIn === "temple" ? "festival" : "darshan",
      }, getToken() || undefined);
      setImages((prev) => [...prev, newItem]);
      setShowUpload(false);
      setUploadForm({ title: "", category: "Daily Darshan", displayIn: "darshan", date: "", files: [], previews: [] });
    } catch (err) {
      console.error("Gallery upload error", err);
      setFormErrors({ general: err instanceof Error ? err.message : "Gallery upload failed. See console for details." });
    } finally {
      hide && hide();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Gallery</h1>
          <p className="text-muted-foreground">Manage temple photos and images</p>
        </div>
        <Button onClick={() => setShowUpload(true)}><Plus className="w-4 h-4 mr-2" /> Upload Images</Button>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            className={filter === cat ? "" : "bg-transparent border border-border text-foreground hover:bg-muted"}
            onClick={() => setFilter(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="flex gap-2 flex-wrap">
        <span className="inline-flex items-center text-sm text-muted-foreground">Show in:</span>
        {(["all", "darshan", "temple"] as const).map((s) => (
          <Button
            key={s}
            size="sm"
            className={sectionFilter === s ? "" : "bg-transparent border border-border text-foreground hover:bg-muted"}
            onClick={() => setSectionFilter(s)}
          >
            {s === "all" ? "All sections" : s === "darshan" ? "Today's Darshan" : "Temple Gallery"}
          </Button>
        ))}
      </div>

      <AnimatePresence>
        {showUpload && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4"
            onClick={() => setShowUpload(false)}
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-background rounded-2xl p-6 w-full max-w-md shadow-elevated"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading text-xl font-bold">Upload Image</h2>
                <button onClick={() => setShowUpload(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="space-y-4">
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    const files = Array.from(e.target.files || []);
                    const previews = files.map((f) => URL.createObjectURL(f));
                    setUploadForm((prev) => ({ ...prev, files, previews }));
                  }}
                />
                {uploadForm.previews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-2">
                    {uploadForm.previews.map((src, idx) => (
                      <div key={src} className="relative w-20 h-20">
                        <Image src={src} alt="preview" fill sizes="200px" className="object-cover rounded-lg" />
                        <button
                          type="button"
                          className="absolute -top-2 -right-2 bg-background rounded-full p-1 shadow"
                          onClick={() => {
                            setUploadForm(f => {
                              const newFiles = f.files.filter((_, i) => i !== idx);
                              const newPreviews = f.previews.filter((_, i) => i !== idx);
                              return { ...f, files: newFiles, previews: newPreviews };
                            });
                          }}
                        >
                          <X className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Input placeholder="Image Title" value={uploadForm.title} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadForm({ ...uploadForm, title: e.target.value })} />
                {formErrors.title && (
                  <p className="text-destructive text-sm mt-1">{formErrors.title}</p>
                )}
                <div>
                  <label className="block text-sm font-medium mb-1">Show in section</label>
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={uploadForm.displayIn}
                    onChange={(e) => {
                      const displayIn = e.target.value;
                      setUploadForm((f) => ({
                        ...f,
                        displayIn,
                        category:
                          displayIn === "temple"
                            ? TEMPLE_GALLERY_CATEGORIES[0]
                            : "Daily Darshan",
                      }));
                    }}
                  >
                    <option value="darshan">Today&apos;s Darshan (homepage, below hero)</option>
                    <option value="temple">Temple Gallery (homepage gallery strip)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  {uploadForm.displayIn === "temple" ? (
                    <select
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      value={uploadForm.category}
                      onChange={(e) => setUploadForm({ ...uploadForm, category: e.target.value })}
                    >
                      {TEMPLE_GALLERY_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  ) : (
                    <Input value="Daily Darshan" disabled />
                  )}
                </div>
                <Input type="date" value={uploadForm.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUploadForm({ ...uploadForm, date: e.target.value })} />
                {formErrors.general && (
                  <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm mb-2">{formErrors.general}</div>
                )}
                <Button className="w-full" onClick={handleUpload}>Upload Image</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-foreground/80 flex items-center justify-center p-4"
            onClick={() => setPreview(null)}
          >
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="relative max-w-4xl w-full">
              <Image src={preview} alt="Preview" width={1200} height={800} className="rounded-2xl w-full h-auto" />
              <button onClick={() => setPreview(null)} className="absolute top-4 right-4 bg-background/80 rounded-full p-2">
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
        {grouped.map((group, i) => (
          <Card key={group._id ?? `${group.title || ''}-${group.date || ''}-${group.category || ''}-${i}`} className="overflow-hidden group">
            <div className="relative aspect-square cursor-pointer" onClick={() => setGroupModal({ group })}>
              <Image
                src={(group.images && group.images[0]) ? group.images[0] : "/assets/gallery-aarti.jpg"}
                alt={group.title || ''}
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button className="p-2 bg-background rounded-full" onClick={e => { e.stopPropagation(); if (group._id) handleDelete(group._id); }}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
              {group.images && group.images.length > 1 && (
                <span className="absolute bottom-3 right-3 bg-background/80 text-xs px-2 py-0.5 rounded-full font-semibold">+{group.images.length}</span>
              )}
            </div>
            <CardContent className="p-3">
              <p className="font-medium text-sm truncate">{group.title}</p>
              <div className="flex items-center justify-between mt-1">
                <div className="flex flex-wrap items-center gap-1">
                  <Badge className="text-xs px-2 py-0.5">{group.category}</Badge>
                  <Badge variant="outline" className="text-xs px-2 py-0.5">
                    {group.type === "darshan" ? "Today's Darshan" : "Temple Gallery"}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground">{(group.date || '').slice(0,10)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <AnimatePresence>
        {groupModal && groupModal.group && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4"
            onClick={() => setGroupModal(null)}
          >
            <button
              className="absolute top-6 right-6 text-background/80 hover:text-background"
              onClick={() => setGroupModal(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.98, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              className="bg-background rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <h2 className="font-heading text-xl font-bold mb-4 text-center">{groupModal.group.title}</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {groupModal.group.images && groupModal.group.images.map((src, idx) => (
                  <div key={src} className="relative aspect-square cursor-pointer group" onClick={() => setLightbox({ images: groupModal.group.images ?? [], index: idx, group: groupModal.group })}>
                    <Image src={src as string} alt={groupModal.group.title || ''} fill className="object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Eye className="w-6 h-6 text-background" />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {
}
      <AnimatePresence>
        {lightbox && lightbox.images && typeof lightbox.index === 'number' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-foreground/95 flex items-center justify-center p-4"
            onClick={() => setLightbox(null)}
          >
            <button
              className="absolute top-6 right-6 text-background/80 hover:text-background"
              onClick={() => setLightbox(null)}
            >
              <X className="w-8 h-8" />
            </button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-full max-h-[85vh] w-[90vw] h-[80vh] flex items-center justify-center"
              onClick={e => e.stopPropagation()}
            >
              <GallerySingleImage
                images={lightbox.images}
                startIndex={lightbox.index}
              />
            </motion.div>
            <div className="absolute bottom-8 text-center">
              <p className="text-background font-heading text-lg font-semibold">
                {lightbox.group ? lightbox.group.title : ''}
              </p>
              <p className="text-background/60 text-sm mt-1">
                {lightbox.group ? lightbox.group.date : ''}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



function GallerySingleImage({ images, startIndex = 0 }: { images: string[]; startIndex?: number }) {
  const [index, setIndex] = useState<number>(startIndex);
  if (!images || !Array.isArray(images) || images.length === 0) return null;
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <button
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/60 rounded-full p-2 z-10"
        onClick={e => { e.stopPropagation(); setIndex(i => (i - 1 + images.length) % images.length); }}
        disabled={images.length <= 1}
      >
        <span className="text-2xl">&#8592;</span>
      </button>
      <div className="relative w-full h-full flex items-center justify-center">
        <Image
          src={images[index]}
          alt={"Gallery Image"}
          fill
          className="object-contain rounded-2xl"
        />
      </div>
      <button
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/60 rounded-full p-2 z-10"
        onClick={e => { e.stopPropagation(); setIndex(i => (i + 1) % images.length); }}
        disabled={images.length <= 1}
      >
        <span className="text-2xl">&#8594;</span>
      </button>
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((img, i) => (
          <span
            key={img + i}
            className={`inline-block w-2 h-2 rounded-full ${i === index ? "bg-primary" : "bg-muted-foreground"}`}
            onClick={e => { e.stopPropagation(); setIndex(i); }}
          />
        ))}
      </div>
    </div>
  );
}

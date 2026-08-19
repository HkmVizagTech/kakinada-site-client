import axios from "axios";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:5000/api";

// Category options shown on the /gallery page filters.
export const GALLERY_CATEGORIES = ["Daily Darshan", "Temple", "Deities", "Festivals", "Janmashtami", "Seva", "Events", "Community"];

// Categories that make sense for the homepage Temple Gallery section
// (daily darshan uploads live in Today's Darshan instead).
export const TEMPLE_GALLERY_CATEGORIES = ["Temple", "Deities", "Festivals", "Janmashtami", "Seva", "Events", "Community"];

export const getGalleryImages = async (params?: { type?: string; status?: string; category?: string; date?: string }) => {
  const search = params
    ? "?" + Object.entries(params).filter(([, v]) => v).map(([k, v]) => `${k}=${encodeURIComponent(v as string)}`).join("&")
    : "";
  const url = `${API_BASE}/gallery${search}`;
  try {
    const res = await axios.get(url);
    return res?.data?.items ?? [];
  } catch {
   
    try {
      await new Promise((r) => setTimeout(r, 300));
      const res = await axios.get(url);
      return res?.data?.items ?? [];
    } catch (err2: unknown) {
      const msg = err2 && typeof err2 === 'object' && 'message' in err2 ? String((err2 as any).message) : String(err2);
      console.warn('getGalleryImages: failed to fetch gallery images', msg);
      return [];
    }
  }
};

export const createGalleryImage = async (
  data: { title: string; description?: string; images: string[]; date: string; category?: string; type?: string; status?: string },
  token?: string
) => {
  const res = await axios.post(`${API_BASE}/gallery`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    withCredentials: true,
  });
  return res.data.item;
};

export const updateGalleryImage = async (
  id: string,
  data: { title?: string; description?: string; images?: string[]; date?: string; category?: string; type?: string; status?: string },
  token?: string
) => {
  const res = await axios.put(`${API_BASE}/gallery/${id}`, data, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    withCredentials: true,
  });
  return res.data.item;
};

export const deleteGalleryImage = async (id: string, token?: string) => {
  await axios.delete(`${API_BASE}/gallery/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    withCredentials: true,
  });
};

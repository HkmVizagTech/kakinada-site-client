"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { authFetch } from "@/lib/authClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ExternalLink, ImagePlus, Loader2, Plus, Save, Trash2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardTab from "./DashboardTab";
import TransactionsTab from "./TransactionsTab";
import UtmStatsTab from "./UtmStatsTab";
import UtmBuilderTab from "./UtmBuilderTab";

type DonationOption = {
  id: number;
  category: "ANNADAAN" | "GO SEVA";
  title: string;
  amount: number | null;
};

type DonationPageSettings = {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  bannerImage: string;
  bannerMobileImage: string;
  trusteeBannerImage: string;
  annadaanImage: string;
  goSevaImage: string;
  annadaanTitle: string;
  annadaanDescription: string;
  goSevaTitle: string;
  goSevaDescription: string;
  donationOptions: DonationOption[];
  galleryImages: string[];
  impactItems: Array<{ title: string; text: string }>;
  bankDetails: {
    beneficiaryName: string;
    bankName: string;
    accountNumber: string;
    ifsc: string;
  };
  contact: {
    phone: string;
    email: string;
    note: string;
  };
};

const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

const defaultDonationOptions: DonationOption[] = [
  { id: 11, category: "ANNADAAN", title: "Feed 50 people", amount: 1501 },
  { id: 1, category: "ANNADAAN", title: "Feed 100 people", amount: 3001 },
  { id: 2, category: "ANNADAAN", title: "Feed 200 people", amount: 6001 },
  { id: 3, category: "ANNADAAN", title: "Feed 300 people", amount: 9001 },
  { id: 4, category: "ANNADAAN", title: "Feed 500 people", amount: 15001 },
  { id: 5, category: "ANNADAAN", title: "Feed 1000 people", amount: 30001 },
  { id: 6, category: "ANNADAAN", title: "Feed 2000 people", amount: 60001 },
  { id: 7, category: "ANNADAAN", title: "Feed 3000 people", amount: 90001 },
  { id: 8, category: "ANNADAAN", title: "Feed 5000 people", amount: 150000 },
  { id: 9, category: "ANNADAAN", title: "Feed 10,000 people", amount: 300000 },
  { id: 10, category: "ANNADAAN", title: "Donate any other Amount", amount: null },
  { id: 21, category: "GO SEVA", title: "Feed 10 Cows For A Day", amount: 1500 },
  { id: 12, category: "GO SEVA", title: "Medicines For Cow", amount: 2500 },
  { id: 13, category: "GO SEVA", title: "Feed A Cow For A Month", amount: 3500 },
  { id: 14, category: "GO SEVA", title: "Feed 5 Cows For A Week", amount: 5000 },
  { id: 15, category: "GO SEVA", title: "Green Grass For All Cows For A Day", amount: 9000 },
  { id: 16, category: "GO SEVA", title: "Fodder For All Cows For A Day", amount: 15000 },
  { id: 17, category: "GO SEVA", title: "Adopt A Cow For An Year", amount: 40000 },
  { id: 18, category: "GO SEVA", title: "Adopt 3 Cows For An Year", amount: 120000 },
  { id: 19, category: "GO SEVA", title: "Adopt 5 Cows For An Year", amount: 200000 },
  { id: 20, category: "GO SEVA", title: "Donate any other Amount", amount: null },
];

const defaultSettings: DonationPageSettings = {
  heroEyebrow: "Hare Krishna Movement Vizag",
  heroTitle: "Donate Annadaan and Gau Seva Online",
  heroSubtitle: "Support Narasimha Jayanthi meals for hungry and needy people.",
  bannerImage: "/assets/donations-nsj-annadan-web.jpeg",
  bannerMobileImage: "/assets/donations-nsj-annadan-mobile.jpeg",
  trusteeBannerImage: "/assets/donations-trustee-banner.png",
  annadaanImage: "/assets/donations-annadana-real.jpg",
  goSevaImage: "/assets/donations-gau-seva-real.jpeg",
  annadaanTitle: "Annadaan Seva",
  annadaanDescription: "Choose the number of people you would like to feed. Each offering supports prasadam distribution and community service.",
  goSevaTitle: "Gau Seva",
  goSevaDescription: "Support daily care for cows through food, medicines, green grass and yearly adoption sevas.",
  donationOptions: defaultDonationOptions,
  galleryImages: [
    "/assets/donations-service-activity-1.png",
    "/assets/donations-service-activity-2.png",
    "/assets/donations-service-activity-3.png",
    "/assets/donations-service-activity-4.png",
  ],
  impactItems: [
    { title: "Daily prasadam", text: "Offer food with dignity, devotion and care." },
    { title: "Protected cow care", text: "Support fodder, grass and medical needs." },
    { title: "Secure checkout", text: "Razorpay payment with receipt-ready donor details." },
  ],
  bankDetails: {
    beneficiaryName: "HARE KRISHNA MOVEMENT INDIA",
    bankName: "IDFC FIRST BANK LTD",
    accountNumber: "10091415313",
    ifsc: "IDFB0080412",
  },
  contact: {
    phone: "89777 61187",
    email: "mukunda@hkmvizag.org",
    note: "Gentle Request! While doing Paytm/UPI App Payments or Bank (NEFT/RTGS), please send us a screenshot along with complete address and PAN details.",
  },
};

export default function DonationsAdminPage() {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<DonationPageSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    fetch(`${apiUrl()}/donation-page`, { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.page) return;
        setForm({
          ...defaultSettings,
          ...data.page,
          bankDetails: { ...defaultSettings.bankDetails, ...(data.page.bankDetails || {}) },
          contact: { ...defaultSettings.contact, ...(data.page.contact || {}) },
          impactItems: Array.isArray(data.page.impactItems) && data.page.impactItems.length ? data.page.impactItems : defaultSettings.impactItems,
          donationOptions: Array.isArray(data.page.donationOptions) && data.page.donationOptions.length ? data.page.donationOptions : defaultDonationOptions,
          galleryImages: Array.isArray(data.page.galleryImages) && data.page.galleryImages.length ? data.page.galleryImages : defaultSettings.galleryImages,
        });
      })
      .catch(() => setMessage({ type: "error", text: "Could not load donation page settings." }))
      .finally(() => setLoading(false));
  }, []);

  const update = (patch: Partial<DonationPageSettings>) => setForm((current) => ({ ...current, ...patch }));

  const updateImpact = (index: number, patch: Partial<{ title: string; text: string }>) => {
    const impactItems = form.impactItems.map((item, i) => (i === index ? { ...item, ...patch } : item));
    update({ impactItems });
  };

  const updateDonationOption = (index: number, patch: Partial<DonationOption>) => {
    const donationOptions = form.donationOptions.map((item, i) => (i === index ? { ...item, ...patch } : item));
    update({ donationOptions });
  };

  const addDonationOption = (category: "ANNADAAN" | "GO SEVA") => {
    update({
      donationOptions: [
        ...form.donationOptions,
        { id: Date.now(), category, title: category === "ANNADAAN" ? "New Annadaan Seva" : "New Go Seva", amount: 1000 },
      ],
    });
  };

  const removeDonationOption = (index: number) => {
    update({ donationOptions: form.donationOptions.filter((_, i) => i !== index) });
  };

  type ImageField = "bannerImage" | "bannerMobileImage" | "trusteeBannerImage" | "annadaanImage" | "goSevaImage";

  // Generic upload core: any single-image slot (a named field, or one of the
  // gallery slots) can reuse this — `key` is just used to track which
  // upload is in-flight for the spinner, `onDone` applies the resulting URL.
  const uploadToSlot = async (key: string, file: File, onDone: (url: string) => void) => {
    setUploading(key);
    setMessage(null);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await authFetch(`${apiUrl()}/donations-admin/upload-image`, {
        method: "POST",
        body: data,
      });
      const body = await res.json();
      if (!res.ok || !body.secure_url) throw new Error(body.message || "Image upload failed.");
      onDone(body.secure_url);
      setMessage({ type: "success", text: "Image uploaded. Save changes to publish it." });
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Image upload failed." });
    } finally {
      setUploading(null);
    }
  };

  const uploadImage = async (field: ImageField, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadToSlot(field, file, (url) => update({ [field]: url } as Partial<DonationPageSettings>));
    event.target.value = "";
  };

  const uploadGalleryImage = async (index: number, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadToSlot(`gallery-${index}`, file, (url) => updateGalleryImage(index, url));
    event.target.value = "";
  };

  const save = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`${apiUrl()}/donation-page`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Unable to save donation page.");
      setMessage({ type: "success", text: "Donation page updated successfully." });
      setTimeout(() => router.refresh(), 500);
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Unable to save donation page." });
    } finally {
      setSaving(false);
    }
  };

  const updateGalleryImage = (index: number, value: string) => {
    const galleryImages = [...form.galleryImages];
    galleryImages[index] = value;
    update({ galleryImages });
  };

  const imageField = (label: string, field: ImageField) => (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <label className="text-sm font-bold text-foreground">{label}</label>
        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
          {uploading === field ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
          Upload
          <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadImage(field, event)} />
        </label>
      </div>
      {form[field] && <img src={form[field]} alt={label} className="mb-3 h-40 w-full rounded-lg object-cover" />}
      <Input value={form[field]} onChange={(event) => update({ [field]: event.target.value } as Partial<DonationPageSettings>)} placeholder="Paste image URL" />
    </div>
  );

  const hasAccess = isAuthenticated && (user?.role === "admin" || user?.role === "donations_admin");

  if (!hasAccess) {
    return (
      <main className="min-h-screen bg-muted px-4 py-16">
        <div className="mx-auto max-w-lg rounded-lg border border-border bg-background p-8 text-center shadow-elevated">
          <h1 className="text-2xl font-bold">Donations Page Admin</h1>
          <p className="mt-3 text-sm text-muted-foreground">Please sign in with an admin account to edit this separate donations landing page.</p>
          <Button asChild className="mt-6">
            <Link href="/admin/login">Go to Admin Login</Link>
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted px-4 py-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link href="/donations" className="inline-flex items-center text-sm font-semibold text-muted-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to donations page
            </Link>
            <h1 className="mt-3 text-3xl font-bold text-foreground">Donations Page Admin</h1>
            <p className="mt-1 text-muted-foreground">Dashboard, transactions, campaign attribution, and page content for /donations.</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/donations" target="_blank">
              Preview <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="transactions">Transactions</TabsTrigger>
            <TabsTrigger value="utm">UTM Campaigns</TabsTrigger>
            <TabsTrigger value="utm-builder">UTM Builder</TabsTrigger>
            <TabsTrigger value="content">Page Content</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            <DashboardTab />
          </TabsContent>

          <TabsContent value="transactions" className="mt-6">
            <TransactionsTab />
          </TabsContent>

          <TabsContent value="utm" className="mt-6">
            <UtmStatsTab />
          </TabsContent>

          <TabsContent value="utm-builder" className="mt-6">
            <UtmBuilderTab />
          </TabsContent>

          <TabsContent value="content" className="mt-6 space-y-6">
            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Save
              </Button>
            </div>

            {message && (
              <div className={`rounded-lg px-4 py-3 text-sm font-semibold ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}>
                {message.text}
              </div>
            )}

        {loading ? (
          <div className="rounded-lg bg-background p-10 text-center text-muted-foreground">Loading settings...</div>
        ) : (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
            <section className="space-y-6">
              <div className="rounded-lg border border-border bg-background p-5">
                <h2 className="text-xl font-bold">Hero Content</h2>
                <div className="mt-5 space-y-4">
                  <Input value={form.heroEyebrow} onChange={(event) => update({ heroEyebrow: event.target.value })} placeholder="Hero eyebrow" />
                  <Input value={form.heroTitle} onChange={(event) => update({ heroTitle: event.target.value })} placeholder="Hero title" />
                  <Textarea value={form.heroSubtitle} onChange={(event) => update({ heroSubtitle: event.target.value })} placeholder="Hero subtitle" rows={3} />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-5">
                <h2 className="text-xl font-bold">Section Content</h2>
                <div className="mt-5 grid gap-4">
                  <Input value={form.annadaanTitle} onChange={(event) => update({ annadaanTitle: event.target.value })} placeholder="Annadaan title" />
                  <Textarea value={form.annadaanDescription} onChange={(event) => update({ annadaanDescription: event.target.value })} placeholder="Annadaan description" rows={3} />
                  <Input value={form.goSevaTitle} onChange={(event) => update({ goSevaTitle: event.target.value })} placeholder="Go Seva title" />
                  <Textarea value={form.goSevaDescription} onChange={(event) => update({ goSevaDescription: event.target.value })} placeholder="Go Seva description" rows={3} />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-5">
                <h2 className="text-xl font-bold">Impact Cards</h2>
                <div className="mt-5 grid gap-4">
                  {form.impactItems.slice(0, 3).map((item, index) => (
                    <div key={index} className="grid gap-3 rounded-lg border border-border p-4 md:grid-cols-2">
                      <Input value={item.title} onChange={(event) => updateImpact(index, { title: event.target.value })} placeholder={`Card ${index + 1} title`} />
                      <Input value={item.text} onChange={(event) => updateImpact(index, { text: event.target.value })} placeholder={`Card ${index + 1} text`} />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-xl font-bold">Donation Cards</h2>
                    <p className="mt-1 text-sm text-muted-foreground">Use empty amount for custom amount cards.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => addDonationOption("ANNADAAN")}>
                      <Plus className="mr-2 h-4 w-4" /> Annadaan
                    </Button>
                    <Button type="button" variant="outline" onClick={() => addDonationOption("GO SEVA")}>
                      <Plus className="mr-2 h-4 w-4" /> Go Seva
                    </Button>
                  </div>
                </div>
                <div className="mt-5 space-y-3">
                  {form.donationOptions.map((item, index) => (
                    <div key={`${item.id}-${index}`} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[130px_1fr_150px_auto]">
                      <select
                        value={item.category}
                        onChange={(event) => updateDonationOption(index, { category: event.target.value as "ANNADAAN" | "GO SEVA" })}
                        className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="ANNADAAN">ANNADAAN</option>
                        <option value="GO SEVA">GO SEVA</option>
                      </select>
                      <Input value={item.title} onChange={(event) => updateDonationOption(index, { title: event.target.value })} placeholder="Seva title" />
                      <Input
                        type="number"
                        value={item.amount ?? ""}
                        onChange={(event) => updateDonationOption(index, { amount: event.target.value ? Number(event.target.value) : null })}
                        placeholder="Custom"
                      />
                      <Button type="button" variant="ghost" onClick={() => removeDonationOption(index)} className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section className="space-y-6">
              {imageField("Banner Image", "bannerImage")}
              {imageField("Mobile Banner Image", "bannerMobileImage")}
              {imageField("Trustee Banner Image", "trusteeBannerImage")}
              {imageField("Annadaan Image", "annadaanImage")}
              {imageField("Go Seva Image", "goSevaImage")}

              <div className="rounded-lg border border-border bg-background p-5">
                <h2 className="text-xl font-bold">Gallery Images</h2>
                <div className="mt-5 grid gap-4">
                  {form.galleryImages.slice(0, 4).map((src, index) => (
                    <div key={index} className="rounded-lg border border-border p-4">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <label className="text-sm font-bold text-foreground">Gallery Image {index + 1}</label>
                        <label className="inline-flex cursor-pointer items-center rounded-lg border border-border px-3 py-2 text-xs font-semibold hover:bg-muted">
                          {uploading === `gallery-${index}` ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
                          Upload
                          <input type="file" accept="image/*" className="hidden" onChange={(event) => uploadGalleryImage(index, event)} />
                        </label>
                      </div>
                      {src && <img src={src} alt={`Gallery image ${index + 1}`} className="mb-3 h-36 w-full rounded-lg object-cover" />}
                      <Input value={src} onChange={(event) => updateGalleryImage(index, event.target.value)} placeholder="Paste image URL" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-5">
                <h2 className="text-xl font-bold">Bank Details</h2>
                <div className="mt-5 grid gap-4">
                  <Input value={form.bankDetails.beneficiaryName} onChange={(event) => update({ bankDetails: { ...form.bankDetails, beneficiaryName: event.target.value } })} placeholder="Beneficiary name" />
                  <Input value={form.bankDetails.bankName} onChange={(event) => update({ bankDetails: { ...form.bankDetails, bankName: event.target.value } })} placeholder="Bank name" />
                  <Input value={form.bankDetails.accountNumber} onChange={(event) => update({ bankDetails: { ...form.bankDetails, accountNumber: event.target.value } })} placeholder="Account number" />
                  <Input value={form.bankDetails.ifsc} onChange={(event) => update({ bankDetails: { ...form.bankDetails, ifsc: event.target.value } })} placeholder="IFSC" />
                </div>
              </div>

              <div className="rounded-lg border border-border bg-background p-5">
                <h2 className="text-xl font-bold">Contact Note</h2>
                <div className="mt-5 grid gap-4">
                  <Input value={form.contact.phone} onChange={(event) => update({ contact: { ...form.contact, phone: event.target.value } })} placeholder="Phone" />
                  <Input value={form.contact.email} onChange={(event) => update({ contact: { ...form.contact, email: event.target.value } })} placeholder="Email" />
                  <Textarea value={form.contact.note} onChange={(event) => update({ contact: { ...form.contact, note: event.target.value } })} placeholder="Contact note" rows={4} />
                </div>
              </div>
            </section>
          </div>
        )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

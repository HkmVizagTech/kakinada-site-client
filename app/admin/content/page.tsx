"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pencil, Save, X, FileText, Globe, Phone, Mail, MapPin, Clock, Loader2, PartyPopper, Megaphone } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { MAJOR_FESTIVALS } from "@/lib/majorFestival";
import { TEMPLE } from "@/lib/templeInfo";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface SiteContent {
  hero: { title: string; subtitle: string; tagline: string };
  about: { heading: string; body: string };
  contact: { phone: string; email: string; address: string; morningHours: string; eveningHours: string };
  navbar: { majorFestival: string; customLink: { enabled: boolean; label: string; href: string } };
}

const defaultContent: SiteContent = {
  hero: { title: "Hare Krishna Movement", subtitle: "Kakinada", tagline: "Spreading the timeless message of Lord Krishna through devotion, service, and community" },
  about: { heading: "A Legacy of Devotion & Service", body: "" },
  contact: { phone: "", email: "", address: TEMPLE.addressOneLine, morningHours: "4:30 AM - 1:00 PM", eveningHours: "4:00 PM - 8:30 PM" },
  navbar: { majorFestival: "none", customLink: { enabled: false, label: "", href: "" } },
};

const FESTIVAL_OPTIONS: { value: string; label: string }[] = [
  { value: "none", label: "None — hide the highlight (default)" },
  { value: "auto", label: "Auto — pick the current festival from the calendar" },
  ...MAJOR_FESTIVALS.map((f) => ({ value: f.key, label: f.label })),
];

export default function AdminContent() {
  const [content, setContent] = useState<SiteContent>(defaultContent);
  const [editingSection, setEditingSection] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/site-content`);
        if (res.ok) {
          const data = await res.json();
          setContent({
            ...defaultContent,
            ...data.content,
            navbar: {
              ...defaultContent.navbar,
              ...data.content?.navbar,
              customLink: { ...defaultContent.navbar.customLink, ...data.content?.navbar?.customLink },
            },
          });
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleSave = async (section: "hero" | "about" | "contact" | "navbar") => {
    setSaving(true);
    try {
      const res = await authFetch(`${API_URL}/site-content`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ [section]: content[section] }),
      });
      if (res.ok) {
        toast({ title: "Saved", description: "This is now live on the public website." });
        setEditingSection(null);
      } else {
        const json = await res.json().catch(() => ({}));
        toast({ title: "Failed to save", description: json.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-muted-foreground">Loading content…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Content Management</h1>
        <p className="text-muted-foreground">
          Edit site copy. Changes save to the database and take effect immediately on the public site.
        </p>
      </div>

      <Tabs defaultValue="hero" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="hero">Hero</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="navigation">Navigation</TabsTrigger>
        </TabsList>

        {/* HERO */}
        <TabsContent value="hero">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5" /> Hero Section</CardTitle>
              {editingSection === "hero" ? (
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("hero")} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                  </Button>
                  <Button className="bg-transparent text-foreground hover:bg-muted" onClick={() => setEditingSection(null)}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <Button className="bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => setEditingSection("hero")}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input value={content.hero.title} disabled={editingSection !== "hero"} onChange={(e) => setContent({ ...content, hero: { ...content.hero, title: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Subtitle</label>
                <Input value={content.hero.subtitle} disabled={editingSection !== "hero"} onChange={(e) => setContent({ ...content, hero: { ...content.hero, subtitle: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Tagline</label>
                <Textarea value={content.hero.tagline} disabled={editingSection !== "hero"} onChange={(e) => setContent({ ...content, hero: { ...content.hero, tagline: e.target.value } })} rows={2} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ABOUT */}
        <TabsContent value="about">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><FileText className="w-5 h-5" /> About Section</CardTitle>
              {editingSection === "about" ? (
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("about")} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                  </Button>
                  <Button className="bg-transparent text-foreground hover:bg-muted" onClick={() => setEditingSection(null)}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <Button className="bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => setEditingSection("about")}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Heading</label>
                <Input value={content.about.heading} disabled={editingSection !== "about"} onChange={(e) => setContent({ ...content, about: { ...content.about, heading: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Body</label>
                <Textarea value={content.about.body} disabled={editingSection !== "about"} onChange={(e) => setContent({ ...content, about: { ...content.about, body: e.target.value } })} rows={5} placeholder="Optional — leave blank to use the default About page copy" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTACT */}
        <TabsContent value="contact">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><Phone className="w-5 h-5" /> Contact Information</CardTitle>
              {editingSection === "contact" ? (
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("contact")} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                  </Button>
                  <Button className="bg-transparent text-foreground hover:bg-muted" onClick={() => setEditingSection(null)}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <Button className="bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => setEditingSection("contact")}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> Phone</label>
                <Input value={content.contact.phone} disabled={editingSection !== "contact"} onChange={(e) => setContent({ ...content, contact: { ...content.contact, phone: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> Email</label>
                <Input value={content.contact.email} disabled={editingSection !== "contact"} onChange={(e) => setContent({ ...content, contact: { ...content.contact, email: e.target.value } })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Address</label>
                <Textarea value={content.contact.address} disabled={editingSection !== "contact"} onChange={(e) => setContent({ ...content, contact: { ...content.contact, address: e.target.value } })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Morning Hours</label>
                  <Input value={content.contact.morningHours} disabled={editingSection !== "contact"} onChange={(e) => setContent({ ...content, contact: { ...content.contact, morningHours: e.target.value } })} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Evening Hours</label>
                  <Input value={content.contact.eveningHours} disabled={editingSection !== "contact"} onChange={(e) => setContent({ ...content, contact: { ...content.contact, eveningHours: e.target.value } })} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* NAVBAR */}
        <TabsContent value="navigation">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2"><PartyPopper className="w-5 h-5" /> Navbar — Major Festival Highlight</CardTitle>
              {editingSection === "navbar" ? (
                <div className="flex gap-2">
                  <Button onClick={() => handleSave("navbar")} disabled={saving}>
                    {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />} Save
                  </Button>
                  <Button className="bg-transparent text-foreground hover:bg-muted" onClick={() => setEditingSection(null)}><X className="w-4 h-4" /></Button>
                </div>
              ) : (
                <Button className="bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => setEditingSection("navbar")}><Pencil className="w-4 h-4 mr-1" /> Edit</Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Highlighted festival</label>
                <select
                  value={content.navbar.majorFestival}
                  disabled={editingSection !== "navbar"}
                  onChange={(e) => setContent({ ...content, navbar: { ...content.navbar, majorFestival: e.target.value } })}
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus:border-gold disabled:opacity-60"
                >
                  {FESTIVAL_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground">
                The navbar can highlight one major festival at a time. By default the highlight is hidden;
                choose &ldquo;Auto&rdquo; to pick the current festival from the Vaishnava calendar automatically,
                or pick a specific festival to pin it. Only festivals that have a page on the site are available
                here.
              </p>

              <div className="border-t border-border pt-4">
                <label className="mb-2 flex items-center gap-2 text-sm font-medium">
                  <Megaphone className="h-4 w-4" /> Custom nav link
                </label>
                <div className="flex items-center gap-2 mb-3">
                  <input
                    id="customLinkEnabled"
                    type="checkbox"
                    checked={content.navbar.customLink.enabled}
                    disabled={editingSection !== "navbar"}
                    onChange={(e) =>
                      setContent({
                        ...content,
                        navbar: { ...content.navbar, customLink: { ...content.navbar.customLink, enabled: e.target.checked } },
                      })
                    }
                    className="h-4 w-4 rounded border-input disabled:opacity-60"
                  />
                  <label htmlFor="customLinkEnabled" className="text-sm">
                    Show this custom link in the navbar
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Link name</label>
                    <Input
                      value={content.navbar.customLink.label}
                      disabled={editingSection !== "navbar"}
                      placeholder="e.g. Special Event"
                      onChange={(e) =>
                        setContent({
                          ...content,
                          navbar: { ...content.navbar, customLink: { ...content.navbar.customLink, label: e.target.value } },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Redirects to</label>
                    <Input
                      value={content.navbar.customLink.href}
                      disabled={editingSection !== "navbar"}
                      placeholder="/some-page or https://..."
                      onChange={(e) =>
                        setContent({
                          ...content,
                          navbar: { ...content.navbar, customLink: { ...content.navbar.customLink, href: e.target.value } },
                        })
                      }
                    />
                  </div>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  A separate, independent slot from the festival highlight above — both can be shown in the
                  navbar at the same time. It appears in the desktop nav and in the mobile &ldquo;More&rdquo;
                  menu exactly the way the festival highlight does. Leave the name or URL blank (or the
                  checkbox off) to hide it.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

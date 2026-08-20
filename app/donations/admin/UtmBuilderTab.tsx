"use client";

// UTM Builder — generates trackable donation links. Pick a known donation
// page (or enter a custom URL), fill in campaign params, and get a ready-to-
// share link whose UTM values flow straight into the donation record via the
// shared useAttribution hook. The values here match exactly what lib/tracking.ts
// reads on landing (utm_source / utm_medium / utm_campaign / utm_content / utm_term).

import { useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Link2, RotateCcw } from "lucide-react";
import { sevas, getSevaHref } from "@/lib/sevaConfig";

const SITE = (process.env.NEXT_PUBLIC_SITE_URL || "https://harekrishnavizag.org").replace(/\/+$/, "");

// Known donation entry points across the whole site. Value is the path.
const KNOWN_PAGES: { label: string; path: string }[] = [
  { label: "Donations page", path: "/donations" },
  { label: "Subhojanam (Annadana)", path: "/subhojanam" },
  { label: "Special Occasion", path: "/special-occasion" },
  { label: "Janmashtami", path: "/janmashtami" },
  { label: "Shayani Ekadashi", path: "/shayani-ekadashi" },
  { label: "Vastra & Alankara Seva", path: "/alankara-vastra-seva" },
  // Per-seva donate pages, pulled live from sevaConfig
  ...sevas.map((s) => ({ label: `Donate — ${s.title}`, path: getSevaHref(s) })),
];

// Common presets to keep source/medium consistent across the team.
const SOURCE_PRESETS = ["facebook", "instagram", "whatsapp", "google", "youtube", "email", "sms", "telegram"];
const MEDIUM_PRESETS = ["social", "cpc", "organic", "broadcast", "banner", "bio", "referral"];

export default function UtmBuilderTab() {
  const [useCustom, setUseCustom] = useState(false);
  const [pagePath, setPagePath] = useState(KNOWN_PAGES[0].path);
  const [customUrl, setCustomUrl] = useState("");
  const [source, setSource] = useState("");
  const [medium, setMedium] = useState("");
  const [campaign, setCampaign] = useState("");
  const [content, setContent] = useState("");
  const [term, setTerm] = useState("");
  const [copied, setCopied] = useState(false);

  const baseUrl = useMemo(() => {
    if (useCustom) return customUrl.trim();
    return `${SITE}${pagePath}`;
  }, [useCustom, customUrl, pagePath]);

  const generatedUrl = useMemo(() => {
    if (!baseUrl) return "";
    let root = baseUrl;
    let existingQuery = "";
    try {
      // Preserve any existing query on a custom URL
      const u = new URL(baseUrl.includes("://") ? baseUrl : `https://${baseUrl}`);
      root = `${u.origin}${u.pathname}`;
      existingQuery = u.search.replace(/^\?/, "");
    } catch {
      // Not a full URL yet; use as-is
    }

    const params = new URLSearchParams(existingQuery);
    if (source.trim()) params.set("utm_source", source.trim());
    if (medium.trim()) params.set("utm_medium", medium.trim());
    if (campaign.trim()) params.set("utm_campaign", campaign.trim());
    if (content.trim()) params.set("utm_content", content.trim());
    if (term.trim()) params.set("utm_term", term.trim());

    const qs = params.toString();
    return qs ? `${root}?${qs}` : root;
  }, [baseUrl, source, medium, campaign, content, term]);

  const canGenerate = baseUrl && source.trim() && campaign.trim();

  const copy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const reset = () => {
    setSource(""); setMedium(""); setCampaign(""); setContent(""); setTerm("");
    setCopied(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Link2 className="w-5 h-5" /> UTM Link Builder
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Build trackable links for ads, WhatsApp broadcasts, and posts. Every donation from this link
          is tagged with its campaign, source, and origin page automatically.
        </p>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          {/* Destination */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Destination page</label>
            <div className="flex gap-2 mb-2">
              <Button
                type="button"
                onClick={() => setUseCustom(false)}
                className={!useCustom ? "" : "bg-transparent border border-border text-foreground hover:bg-muted"}
              >
                Known page
              </Button>
              <Button
                type="button"
                onClick={() => setUseCustom(true)}
                className={useCustom ? "" : "bg-transparent border border-border text-foreground hover:bg-muted"}
              >
                Custom URL
              </Button>
            </div>

            {!useCustom ? (
              <select
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={pagePath}
                onChange={(e) => setPagePath(e.target.value)}
              >
                {KNOWN_PAGES.map((p) => (
                  <option key={p.path} value={p.path}>{p.label} — {p.path}</option>
                ))}
              </select>
            ) : (
              <Input
                placeholder="https://your-domain.org/your-page"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
              />
            )}
          </div>

          {/* UTM fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Source <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground font-normal"> — where the link lives</span>
              </label>
              <Input list="src-presets" placeholder="facebook" value={source} onChange={(e) => setSource(e.target.value)} />
              <datalist id="src-presets">{SOURCE_PRESETS.map((s) => <option key={s} value={s} />)}</datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Medium
                <span className="text-xs text-muted-foreground font-normal"> — type of traffic</span>
              </label>
              <Input list="med-presets" placeholder="social" value={medium} onChange={(e) => setMedium(e.target.value)} />
              <datalist id="med-presets">{MEDIUM_PRESETS.map((m) => <option key={m} value={m} />)}</datalist>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Campaign <span className="text-red-500">*</span>
                <span className="text-xs text-muted-foreground font-normal"> — the specific push</span>
              </label>
              <Input placeholder="nirjala_ekadashi_2026" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">
                Content
                <span className="text-xs text-muted-foreground font-normal"> — which creative / A-B</span>
              </label>
              <Input placeholder="reel_v2" value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-medium">
                Term
                <span className="text-xs text-muted-foreground font-normal"> — keyword (for paid search)</span>
              </label>
              <Input placeholder="donate for annadana" value={term} onChange={(e) => setTerm(e.target.value)} />
            </div>
          </div>

          {/* Output */}
          <div className="space-y-2 border-t pt-4">
            <label className="text-sm font-medium">Generated link</label>
            <div className="rounded-lg bg-muted p-3 text-sm font-mono break-all min-h-[3rem] flex items-center">
              {generatedUrl || <span className="text-muted-foreground font-sans">Fill in Source and Campaign to generate a link…</span>}
            </div>
            <div className="flex gap-2">
              <Button onClick={copy} disabled={!canGenerate} className="gap-2">
                {copied ? <><Check className="w-4 h-4" /> Copied</> : <><Copy className="w-4 h-4" /> Copy link</>}
              </Button>
              <Button onClick={reset} className="gap-2 bg-transparent border border-border text-foreground hover:bg-muted">
                <RotateCcw className="w-4 h-4" /> Clear fields
              </Button>
            </div>
            {!canGenerate && (baseUrl) && (
              <p className="text-xs text-amber-600">Source and Campaign are required for a meaningful trackable link.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Naming tips for clean reports</p>
          <p>Keep values lowercase with underscores (e.g. <code className="text-foreground">nirjala_ekadashi_2026</code>), not spaces. Reuse the same <b>campaign</b> name across every link for one push so the UTM Campaigns report groups them together. Once a donor lands, the values are stored for their whole session — even if they navigate to another page before donating.</p>
        </CardContent>
      </Card>
    </div>
  );
}

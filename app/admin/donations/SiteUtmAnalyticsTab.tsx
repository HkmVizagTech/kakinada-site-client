"use client";

// Sitewide UTM/attribution analytics for the MAIN admin donations panel
// (/admin/donations). Covers all 9 donation flows (seva pages, festivals,
// campaigns, Subhojanam, etc) — excludes the standalone /donations page,
// which has its own dedicated analytics at /donations/admin.

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/authClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, Megaphone, FileText, CalendarRange } from "lucide-react";

const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface UtmRow {
  _id: { campaign: string; source: string; medium: string };
  totalAmount: number;
  count: number;
}

interface SourcePageRow {
  sourcePage: string;
  totalAmount: number;
  count: number;
}

interface UtmTransaction {
  donorName?: string;
  donorEmail?: string;
  amount: number;
  status: string;
  createdAt: string;
  sourcePage?: string;
  sevaName?: string;
  type?: string;
  receiptNumber?: string;
}

export default function SiteUtmAnalyticsTab() {
  const [stats, setStats] = useState<UtmRow[]>([]);
  const [bySourcePage, setBySourcePage] = useState<SourcePageRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalRow, setModalRow] = useState<{ kind: "campaign"; row: UtmRow } | { kind: "page"; row: SourcePageRow } | null>(null);
  const [modalTxns, setModalTxns] = useState<UtmTransaction[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchStats = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    authFetch(`${apiUrl()}/donations/utm-stats?${params.toString()}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats || []);
          setBySourcePage(data.bySourcePage || []);
        }
      })
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openCampaign = async (row: UtmRow) => {
    setModalRow({ kind: "campaign", row });
    setModalTxns([]);
    setModalLoading(true);
    try {
      const params = new URLSearchParams();
      if (row._id.campaign) params.set("campaign", row._id.campaign);
      if (row._id.source) params.set("source", row._id.source);
      if (row._id.medium) params.set("medium", row._id.medium);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await authFetch(`${apiUrl()}/donations/utm-transactions?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setModalTxns(data.transactions);
    } finally {
      setModalLoading(false);
    }
  };

  const openSourcePage = async (row: SourcePageRow) => {
    setModalRow({ kind: "page", row });
    setModalTxns([]);
    setModalLoading(true);
    try {
      const params = new URLSearchParams({ sourcePage: row.sourcePage });
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await authFetch(`${apiUrl()}/donations/utm-transactions?${params.toString()}`, { credentials: "include" });
      const data = await res.json();
      if (data.success) setModalTxns(data.transactions);
    } finally {
      setModalLoading(false);
    }
  };

  const totalAmount = stats.reduce((sum, r) => sum + r.totalAmount, 0);
  const totalCount = stats.reduce((sum, r) => sum + r.count, 0);

  const applyPreset = (days: number) => {
    const today = new Date();
    const toStr = today.toISOString().slice(0, 10);
    let fromStr = toStr;
    if (days === -1) {
      fromStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
    } else if (days > 0) {
      const d = new Date(today);
      d.setDate(d.getDate() - days);
      fromStr = d.toISOString().slice(0, 10);
    }
    setDateFrom(fromStr);
    setDateTo(toStr);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold">Sitewide UTM Analytics</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Completed donations across every seva page, festival, and campaign — grouped by campaign
          and by origin page. Excludes the standalone /donations page (see its own dashboard for that).
        </p>
      </div>

      {/* Date range filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" /> From
          </label>
          <Input type="date" value={dateFrom} max={dateTo || undefined} onChange={(e) => setDateFrom(e.target.value)} className="w-auto" />
          <label className="text-sm text-muted-foreground">To</label>
          <Input type="date" value={dateTo} min={dateFrom || undefined} onChange={(e) => setDateTo(e.target.value)} className="w-auto" />
          {(dateFrom || dateTo) && (
            <Button size="sm" variant="outline" onClick={() => { setDateFrom(""); setDateTo(""); }}>Clear</Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[{ label: "Today", days: 0 }, { label: "Last 7 days", days: 7 }, { label: "Last 30 days", days: 30 }, { label: "This month", days: -1 }].map((p) => (
            <Button key={p.label} size="sm" variant="outline" onClick={() => applyPreset(p.days)}>{p.label}</Button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading sitewide campaign stats...
        </div>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground">Total raised{dateFrom || dateTo ? " (selected range)" : " (all campaigns)"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-xs text-muted-foreground">Total completed donations</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{stats.length}</p>
          <p className="text-xs text-muted-foreground">Distinct campaign/source combos</p>
        </CardContent></Card>
      </div>

      {/* By campaign */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5"><Megaphone className="h-4 w-4" /> By Campaign</h3>
        {stats.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No UTM-tagged donations {dateFrom || dateTo ? "in this range." : "yet."}</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {stats.map((row, i) => (
              <Card key={i}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{row._id.campaign}</span>
                    <Badge variant="outline">{row._id.source}</Badge>
                    <Badge variant="outline">{row._id.medium}</Badge>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">₹{row.totalAmount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">{row.count} donation{row.count === 1 ? "" : "s"}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openCampaign(row)}>
                      <Eye className="mr-1.5 h-4 w-4" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* By source page */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold flex items-center gap-1.5"><FileText className="h-4 w-4" /> By Origin Page</h3>
        {bySourcePage.length === 0 ? (
          <Card><CardContent className="py-8 text-center text-muted-foreground">No data {dateFrom || dateTo ? "in this range." : "yet."}</CardContent></Card>
        ) : (
          <div className="space-y-2">
            {bySourcePage.map((row, i) => (
              <Card key={i}>
                <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <span className="font-mono text-sm">{row.sourcePage}</span>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="font-bold text-primary">₹{row.totalAmount.toLocaleString("en-IN")}</p>
                      <p className="text-xs text-muted-foreground">{row.count} donation{row.count === 1 ? "" : "s"}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => openSourcePage(row)}>
                      <Eye className="mr-1.5 h-4 w-4" /> View
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      </>
      )}

      <Dialog open={!!modalRow} onOpenChange={(open) => !open && setModalRow(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalRow?.kind === "campaign"
                ? `${modalRow.row._id.campaign} · ${modalRow.row._id.source} / ${modalRow.row._id.medium}`
                : modalRow?.kind === "page"
                  ? modalRow.row.sourcePage
                  : ""}
            </DialogTitle>
          </DialogHeader>
          {modalLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transactions...
            </div>
          ) : modalTxns.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No transactions found.</p>
          ) : (
            <div className="space-y-2">
              {modalTxns.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div>
                    <p className="font-semibold">{t.donorName || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.donorEmail} · {t.sevaName || t.type || "-"} · {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <p className="font-bold text-primary">₹{t.amount.toLocaleString("en-IN")}</p>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

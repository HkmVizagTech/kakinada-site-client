"use client";

import { useCallback, useEffect, useState } from "react";
import { authFetch } from "@/lib/authClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, Eye, Megaphone, CalendarRange } from "lucide-react";

const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface UtmRow {
  _id: { campaign: string; source: string; medium: string };
  totalAmount: number;
  count: number;
}

interface UtmTransaction {
  donorName?: string;
  donorEmail?: string;
  amount: number;
  status: string;
  createdAt: string;
  receiptNumber?: string;
}

export default function UtmStatsTab() {
  const [stats, setStats] = useState<UtmRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalRow, setModalRow] = useState<UtmRow | null>(null);
  const [modalTxns, setModalTxns] = useState<UtmTransaction[]>([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchStats = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    authFetch(`${apiUrl()}/donations-admin/utm-stats?${params.toString()}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setStats(data.stats); })
      .finally(() => setLoading(false));
  }, [startDate, endDate]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const openCampaign = async (row: UtmRow) => {
    setModalRow(row);
    setModalTxns([]);
    setModalLoading(true);
    try {
      const params = new URLSearchParams();
      if (row._id.campaign) params.set("campaign", row._id.campaign);
      if (row._id.source) params.set("source", row._id.source);
      if (row._id.medium) params.set("medium", row._id.medium);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      const res = await authFetch(`${apiUrl()}/donations-admin/utm-transactions?${params.toString()}`, { credentials: "include" });
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
    setStartDate(fromStr);
    setEndDate(toStr);
  };

  return (
    <div className="space-y-4">
      {/* Date range filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" /> From
          </label>
          <Input type="date" value={startDate} max={endDate || undefined} onChange={(e) => setStartDate(e.target.value)} className="w-auto" />
          <label className="text-sm text-muted-foreground">To</label>
          <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className="w-auto" />
          {(startDate || endDate) && (
            <Button size="sm" variant="outline" onClick={() => { setStartDate(""); setEndDate(""); }}>Clear</Button>
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
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading campaign stats...
        </div>
      ) : (
      <>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">₹{totalAmount.toLocaleString("en-IN")}</p>
          <p className="text-xs text-muted-foreground">Total raised{startDate || endDate ? " (selected range)" : " (all campaigns)"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{totalCount}</p>
          <p className="text-xs text-muted-foreground">Total donations</p>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <p className="text-2xl font-bold">{stats.length}</p>
          <p className="text-xs text-muted-foreground">Distinct campaign/source combos</p>
        </CardContent></Card>
      </div>

      {stats.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No donation data {startDate || endDate ? "in this range." : "yet."}</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {stats.map((row, i) => (
            <Card key={i}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Megaphone className="h-4 w-4 text-amber-500" />
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
      </>
      )}

      <Dialog open={!!modalRow} onOpenChange={(open) => !open && setModalRow(null)}>
        <DialogContent className="max-h-[80vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalRow?._id.campaign} · {modalRow?._id.source} / {modalRow?._id.medium}
            </DialogTitle>
          </DialogHeader>
          {modalLoading ? (
            <div className="flex items-center justify-center py-10 text-muted-foreground">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transactions...
            </div>
          ) : modalTxns.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No transactions found for this campaign.</p>
          ) : (
            <div className="space-y-2">
              {modalTxns.map((t, i) => (
                <div key={i} className="flex items-center justify-between rounded-lg border border-border p-3 text-sm">
                  <div>
                    <p className="font-semibold">{t.donorName || "Anonymous"}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.donorEmail} · {new Date(t.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
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

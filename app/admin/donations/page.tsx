"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  IndianRupee, Search, Download, Eye, TrendingUp, Users, Calendar, CreditCard, Smartphone, Banknote, X, Loader2, AlertTriangle, CalendarRange,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import UtmBuilderTab from "@/app/donations/admin/UtmBuilderTab";
import SiteUtmAnalyticsTab from "./SiteUtmAnalyticsTab";
import ManualEntryTab from "./ManualEntryTab";

const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003";

const COLORS = ["hsl(30,85%,50%)", "hsl(350,45%,35%)", "hsl(42,90%,55%)", "hsl(200,70%,50%)", "hsl(150,60%,40%)", "hsl(280,50%,50%)", "hsl(10,70%,45%)", "hsl(170,55%,40%)"];

const methodIcons: Record<string, typeof CreditCard> = {
  UPI: Smartphone,
  Card: CreditCard,
  "Net Banking": Banknote,
  Cash: IndianRupee,
};

interface Stats {
  totalCollected: number;
  totalCompletedCount: number;
  totalTransactions: number;
  totalDonors: number;
  needsAttentionCount: number;
  thisMonth: { value: number; changePct: number | null; label: string };
  monthly: { month: string; amount: number; count: number }[];
  sevaWise: { name: string; value: number; count: number }[];
}

export default function AdminDonations() {
  const [search, setSearch] = useState("");
  const [sevaFilter, setSevaFilter] = useState("all");
  const [donations, setDonations] = useState<any[]>([]);
  const [selectedDonation, setSelectedDonation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [rangeTotalAmount, setRangeTotalAmount] = useState(0);

  // Fetch real aggregated stats from the server
  useEffect(() => {
    setStatsLoading(true);
    authFetch(`${apiUrl}/donations/stats`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => { if (data.success) setStats(data.stats); })
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchDonations = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set("q", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (sevaFilter !== "all") params.set("type", sevaFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const res = await authFetch(`${apiUrl}/donations?${params.toString()}`, { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      setDonations(data.donations || []);
      setTotal(data.total || 0);
      setRangeTotalAmount(data.totalAmount || 0);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }, [page, limit, search, statusFilter, sevaFilter, dateFrom, dateTo]);

  useEffect(() => {
    const t = setTimeout(fetchDonations, 300);
    return () => clearTimeout(t);
  }, [fetchDonations]);

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (statusFilter !== "all") params.set("status", statusFilter);
    if (sevaFilter !== "all") params.set("type", sevaFilter);
    if (search) params.set("q", search);
    if (dateFrom) params.set("from", dateFrom);
    if (dateTo) params.set("to", dateTo);
    authFetch(`${apiUrl}/donations?${params.toString()}&limit=10000`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const rows = (data.donations || []).map((d: any) => [
          d.razorpayPaymentId || d.razorpayOrderId || d._id,
          d.donorName || "",
          d.donorEmail || "",
          d.donorMobile || "",
          d.amount,
          d.status,
          d.sevaName || d.type || "",
          d.receiptNumber || "",
          d.date ? new Date(d.date).toLocaleDateString("en-IN") : "",
        ]);
        const headers = ["TXN ID", "Donor", "Email", "Mobile", "Amount", "Status", "Seva", "Receipt", "Date"];
        const csv = [headers.join(","), ...rows.map((r: string[]) => r.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `donations-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  const sevaOptions = stats?.sevaWise?.map((s) => s.name) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Donations & Payments</h1>
          <p className="text-muted-foreground">Track all seva donations and payment details</p>
        </div>
        <Button className="gap-2 bg-transparent border border-border text-foreground hover:bg-muted" onClick={exportCsv}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="manual-entry">Manual Entry</TabsTrigger>
          <TabsTrigger value="utm-analytics">UTM Analytics</TabsTrigger>
          <TabsTrigger value="utm-builder">UTM Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-6">

      {/* Stats Cards — real data from /donations/stats */}
      {statsLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading analytics...
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { label: "Total Collected", value: `₹${stats.totalCollected.toLocaleString("en-IN")}`, icon: IndianRupee, sub: `${stats.totalCompletedCount} completed`, color: "text-green-600" },
              { label: "This Month", value: `₹${stats.thisMonth.value.toLocaleString("en-IN")}`, icon: TrendingUp, sub: stats.thisMonth.changePct !== null ? `${stats.thisMonth.changePct >= 0 ? "+" : ""}${stats.thisMonth.changePct}% vs last month` : stats.thisMonth.label, color: "text-primary" },
              { label: "Total Donors", value: stats.totalDonors.toLocaleString("en-IN"), icon: Users, sub: "Unique donors", color: "text-blue-500" },
              { label: "Transactions", value: stats.totalTransactions.toLocaleString("en-IN"), icon: Calendar, sub: "All records", color: "text-purple-500" },
              { label: "Needs Attention", value: String(stats.needsAttentionCount || 0), icon: AlertTriangle, sub: "Receipt / WhatsApp issues", color: stats.needsAttentionCount > 0 ? "text-red-500" : "text-green-600", onClick: stats.needsAttentionCount > 0 ? () => { setStatusFilter("needs_attention"); setPage(1); } : undefined },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className={stat.onClick ? "cursor-pointer hover:ring-2 hover:ring-primary/30 transition-shadow" : ""} onClick={stat.onClick}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        <span className="text-xs text-muted-foreground">{stat.sub}</span>
                      </div>
                      <div className={`p-2.5 rounded-xl bg-muted ${stat.color}`}>
                        <stat.icon className="w-5 h-5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Charts — real data */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-lg">Monthly Donations</CardTitle></CardHeader>
              <CardContent>
                {stats.monthly.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={stats.monthly}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, "Amount"]} />
                      <Bar dataKey="amount" fill="hsl(30,85%,50%)" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No monthly data yet</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-lg">Seva-wise Split</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                {stats.sevaWise.length > 0 ? (
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={stats.sevaWise} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                        {stats.sevaWise.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-muted-foreground py-8">No seva data yet</p>
                )}
              </CardContent>
              <div className="px-6 pb-4 flex flex-wrap gap-3">
                {stats.sevaWise.map((item, i) => (
                  <div key={item.name} className="flex items-center gap-1.5 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                    <span className="text-muted-foreground">{item.name} (₹{item.value.toLocaleString("en-IN")})</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </>
      ) : (
        <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">Failed to load analytics</div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email or TXN ID" value={search} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setSearch(e.target.value); setPage(1); }} className="pl-10" />
        </div>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={sevaFilter}
          onChange={(e) => { setSevaFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Sevas</option>
          {sevaOptions.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <select
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="needs_attention">Needs Attention</option>
        </select>
      </div>

      {/* Date range filter */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" /> From
          </label>
          <Input
            type="date"
            value={dateFrom}
            max={dateTo || undefined}
            onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
            className="w-auto"
          />
          <label className="text-sm text-muted-foreground">To</label>
          <Input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
            className="w-auto"
          />
          {(dateFrom || dateTo) && (
            <Button
              className="h-9 px-2 text-xs bg-transparent border border-border text-foreground hover:bg-muted"
              onClick={() => { setDateFrom(""); setDateTo(""); setPage(1); }}
            >
              Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {[
            { label: "Today", days: 0 },
            { label: "Last 7 days", days: 7 },
            { label: "Last 30 days", days: 30 },
            { label: "This month", days: -1 },
          ].map((preset) => (
            <Button
              key={preset.label}
              className="h-8 px-3 text-xs bg-transparent border border-border text-foreground hover:bg-muted"
              onClick={() => {
                const today = new Date();
                const toStr = today.toISOString().slice(0, 10);
                let fromStr = toStr;
                if (preset.days === -1) {
                  fromStr = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().slice(0, 10);
                } else if (preset.days > 0) {
                  const d = new Date(today);
                  d.setDate(d.getDate() - preset.days);
                  fromStr = d.toISOString().slice(0, 10);
                }
                setDateFrom(fromStr);
                setDateTo(toStr);
                setPage(1);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      {(dateFrom || dateTo) && !loading && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> record{total === 1 ? "" : "s"} · {" "}
          <span className="font-semibold text-foreground">₹{rangeTotalAmount.toLocaleString("en-IN")}</span> total
          {statusFilter === "all" ? " across all statuses (includes pending/failed)" : ` (${statusFilter})`}
          {dateFrom && dateTo ? ` between ${dateFrom} and ${dateTo}` : dateFrom ? ` from ${dateFrom} onward` : ` up to ${dateTo}`}
        </p>
      )}

      {/* Transactions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">S.No</th>
                  <th className="px-4 py-3 text-left font-medium">TXN / Order</th>
                  <th className="px-4 py-3 text-left font-medium">Donor</th>
                  <th className="px-4 py-3 text-left font-medium">Phone</th>
                  <th className="px-4 py-3 text-left font-medium">Seva</th>
                  <th className="px-4 py-3 text-left font-medium">Amount</th>
                  <th className="px-4 py-3 text-left font-medium">Method</th>
                  <th className="px-4 py-3 text-left font-medium">Status</th>
                  <th className="px-4 py-3 text-left font-medium">Date &amp; Time</th>
                  <th className="px-4 py-3 text-left font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={10} className="text-center py-8 text-muted-foreground"><Loader2 className="inline mr-2 h-4 w-4 animate-spin" />Loading...</td></tr>
                ) : donations.length === 0 ? (
                  <tr><td colSpan={10} className="text-center py-6 text-muted-foreground">No donations found.</td></tr>
                ) : donations.map((d, i) => {
                  const MethodIcon = methodIcons[d.method] || IndianRupee;
                  const rowKey = d._id || d.id || d.transactionId || d.razorpayOrderId || `don-${i}`;
                  return (
                    <tr key={rowKey} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3 text-muted-foreground">{total - ((page - 1) * limit + i)}</td>
                      <td className="px-4 py-3 font-mono text-xs">{d.razorpayPaymentId || d.razorpayOrderId || d._id}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{d.donorName || "Anonymous"}</div>
                        <div className="text-xs text-muted-foreground">{d.donorEmail || "-"}</div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{d.donorMobile || "-"}</td>
                      <td className="px-4 py-3">{d.sevaName || d.type || "-"}</td>
                      <td className="px-4 py-3 font-semibold">₹{(d.amount || 0).toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <MethodIcon className="w-4 h-4 text-muted-foreground" />
                          <span>{d.method || (d.razorpayPaymentId ? "Card/UPI" : "N/A")}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={(d.status === "paid" || d.status === "completed") ? "bg-green-100 text-green-700" : d.status === "pending" ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"}>
                          {d.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs">
                        {new Date(d.createdAt || d.date).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                        <br />
                        <span className="text-muted-foreground">
                          {new Date(d.createdAt || d.date).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </td>
                      <td className="px-4 py-3 flex gap-2">
                        <Button className="p-2 h-auto bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => setSelectedDonation(d)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button className="p-2 h-auto bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => navigator.clipboard.writeText(d.razorpayOrderId || d.transactionId || "")}>Copy</Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {total > 0 ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}` : "No results"}
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Previous</Button>
          <span className="text-sm px-2">Page {page}</span>
          <select value={String(limit)} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }} className="rounded-md border border-input bg-background px-2 py-1 text-sm">
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
          <Button disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      </div>

        </TabsContent>

        <TabsContent value="manual-entry" className="mt-6">
          <ManualEntryTab />
        </TabsContent>

        <TabsContent value="utm-analytics" className="mt-6">
          <SiteUtmAnalyticsTab />
        </TabsContent>

        <TabsContent value="utm-builder" className="mt-6">
          <UtmBuilderTab />
        </TabsContent>
      </Tabs>

      {/* Donation Detail Modal */}
      {selectedDonation && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setSelectedDonation(null)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-md shadow-elevated max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold">Donation Details</h2>
              <button onClick={() => setSelectedDonation(null)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">TXN ID</span><span className="font-mono">{selectedDonation.transactionId || selectedDonation.razorpayPaymentId || selectedDonation._id || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Donor</span><span>{selectedDonation.donorName || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedDonation.donorEmail || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Seva</span><span>{selectedDonation.sevaName || selectedDonation.type || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{selectedDonation.donorMobile || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span className="font-semibold">₹{(selectedDonation.amount || 0).toLocaleString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Donated On</span><span>{selectedDonation.createdAt || selectedDonation.date ? new Date(selectedDonation.createdAt || selectedDonation.date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Source Page</span><span className="text-right max-w-[60%] break-words">{selectedDonation.sourcePage || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">UTM Source</span><span>{selectedDonation.utm?.source || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">UTM Medium</span><span>{selectedDonation.utm?.medium || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">UTM Campaign</span><span>{selectedDonation.utm?.campaign || "-"}</span></div>
              {selectedDonation.utm?.content && (
                <div className="flex justify-between"><span className="text-muted-foreground">UTM Content</span><span>{selectedDonation.utm.content}</span></div>
              )}
              {selectedDonation.utm?.term && (
                <div className="flex justify-between"><span className="text-muted-foreground">UTM Term</span><span>{selectedDonation.utm.term}</span></div>
              )}
              <div className="flex justify-between"><span className="text-muted-foreground">Order ID</span><span className="font-mono text-xs break-all">{selectedDonation.razorpayOrderId || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Payment ID</span><span className="font-mono text-xs break-all">{selectedDonation.razorpayPaymentId || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Receipt</span><span>{selectedDonation.receiptNumber || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">DCC Sync</span><span>{selectedDonation.dccSyncStatus || "-"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">WhatsApp Receipt</span><span>{selectedDonation.whatsappReceiptSentAt ? `Sent ${new Date(selectedDonation.whatsappReceiptSentAt).toLocaleString("en-IN")}` : (selectedDonation.whatsappReceiptError ? "Failed" : "Not sent")}</span></div>
              {selectedDonation.wantPrasadam && selectedDonation.prasadamAddress && (
                <div className="border-t pt-3">
                  <div className="text-sm text-muted-foreground mb-2">Maha Prasadam Delivery</div>
                  <div className="text-xs">{selectedDonation.prasadamAddress.doorNo}, {selectedDonation.prasadamAddress.house}</div>
                  <div className="text-xs">{selectedDonation.prasadamAddress.street}, {selectedDonation.prasadamAddress.area}</div>
                  <div className="text-xs">{selectedDonation.prasadamAddress.city} - {selectedDonation.prasadamAddress.pincode}, {selectedDonation.prasadamAddress.state}</div>
                </div>
              )}
              <div className="pt-3 flex flex-wrap gap-2">
                <Button onClick={async () => {
                  try {
                    const r = await authFetch(`${apiUrl}/donations/${selectedDonation._id}/resend-receipt`, { method: "POST", credentials: "include" });
                    const j = await r.json().catch(() => ({}));
                    if (r.ok) {
                      alert(j.message || "Receipt resync triggered");
                    } else {
                      // Show the actual DCC error so admin knows why it failed
                      const detail = j.error ? `\n\nDCC said: "${j.error}"` : "";
                      alert(`${j.message || "Failed to resend receipt"}${detail}`);
                    }
                  } catch (err) { console.error(err); alert("Failed"); }
                }}>Resend Receipt</Button>
                <Button variant="outline" onClick={async () => {
                  try {
                    const r = await authFetch(`${apiUrl}/donations/${selectedDonation._id}/resend-whatsapp`, { method: "POST", credentials: "include" });
                    const j = await r.json().catch(() => ({}));
                    alert(j.message || (r.ok ? "WhatsApp receipt sent" : "Failed to send WhatsApp receipt"));
                  } catch (err) { console.error(err); alert("Failed"); }
                }}>Resend WhatsApp</Button>
                <Button variant="outline" onClick={() => { navigator.clipboard.writeText(JSON.stringify(selectedDonation, null, 2)); alert("Copied"); }}>Copy JSON</Button>
              </div>
              {(selectedDonation.dccSyncStatus === "failed" || (!selectedDonation.receiptNumber && selectedDonation.status === "completed")) && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <p className="mb-2 text-xs font-medium text-amber-800">
                    If DCC already has this transaction, find the receipt number in DCC and enter it here:
                  </p>
                  <div className="flex gap-2">
                    <input
                      id="manual-receipt-input"
                      type="text"
                      placeholder="e.g. HKMI|2026|D/VSP|5413"
                      className="flex-1 rounded-md border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                    />
                    <Button size="sm" onClick={async () => {
                      const input = document.getElementById("manual-receipt-input") as HTMLInputElement;
                      const val = input?.value?.trim();
                      if (!val) { alert("Please enter the receipt number first."); return; }
                      try {
                        const r = await authFetch(`${apiUrl}/donations/${selectedDonation._id}/receipt-number`, {
                          method: "PUT", headers: { "Content-Type": "application/json" }, credentials: "include",
                          body: JSON.stringify({ receiptNumber: val }),
                        });
                        const j = await r.json().catch(() => ({}));
                        alert(j.message || (r.ok ? "Receipt number saved" : "Failed to save"));
                        if (r.ok) setSelectedDonation({ ...selectedDonation, receiptNumber: val, dccSyncStatus: "synced" });
                      } catch (err) { console.error(err); alert("Failed"); }
                    }}>Save</Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

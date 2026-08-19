"use client";

import { useEffect, useState, useCallback } from "react";
import { authFetch } from "@/lib/authClient";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, Loader2, ChevronLeft, ChevronRight, Tag, Download, CalendarRange } from "lucide-react";

const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface Transaction {
  _id: string;
  id: string;
  donorName?: string;
  donorEmail?: string;
  donorMobile?: string;
  amount: number;
  date: string;
  status: string;
  sevaName?: string;
  message?: string;
  panNumber?: string;
  certificate?: boolean;
  wantPrasadam?: boolean;
  prasadamAddress?: {
    doorNo?: string; house?: string; street?: string; area?: string;
    city?: string; state?: string; pincode?: string; country?: string;
  };
  receiptNumber?: string;
  dccSyncStatus?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  utm?: { source?: string; medium?: string; campaign?: string; content?: string; term?: string };
  whatsappReceiptSentAt?: string;
  whatsappReceiptError?: string;
}

const statusColor: Record<string, string> = {
  completed: "bg-green-100 text-green-800",
  pending: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-800",
};

export default function TransactionsTab() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [selected, setSelected] = useState<Transaction | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);
    if (status !== "all") params.set("status", status);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    authFetch(`${apiUrl()}/donations-admin/transactions?${params.toString()}`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setTransactions(data.transactions);
          setTotalPages(data.pagination.totalPages);
          setTotalCount(data.pagination.totalTransactions || 0);
          setTotalAmount(data.pagination.totalAmount);
        }
      })
      .finally(() => setLoading(false));
  }, [page, search, status, startDate, endDate]);

  useEffect(() => {
    const t = setTimeout(fetchTransactions, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchTransactions]);

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (status !== "all") params.set("status", status);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    // authFetch attaches the Bearer token; window.open wouldn't include it,
    // so fetch the CSV as a blob and trigger the download manually.
    authFetch(`${apiUrl()}/donations-admin/export?${params.toString()}`, { credentials: "include" })
      .then((res) => res.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `donations-transactions-${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search name, email, mobile, payment ID..."
            value={search}
            onChange={(e) => { setPage(1); setSearch(e.target.value); }}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Select value={status} onValueChange={(v) => { setPage(1); setStatus(v); }}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="needs_attention">Needs Attention</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-1.5 h-4 w-4" /> Export CSV
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <CalendarRange className="h-4 w-4" /> From
          </label>
          <Input type="date" value={startDate} max={endDate || undefined} onChange={(e) => { setPage(1); setStartDate(e.target.value); }} className="w-auto" />
          <label className="text-sm text-muted-foreground">To</label>
          <Input type="date" value={endDate} min={startDate || undefined} onChange={(e) => { setPage(1); setEndDate(e.target.value); }} className="w-auto" />
          {(startDate || endDate) && (
            <Button variant="outline" size="sm" onClick={() => { setPage(1); setStartDate(""); setEndDate(""); }}>Clear</Button>
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
              variant="outline"
              size="sm"
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
                setPage(1);
                setStartDate(fromStr);
                setEndDate(toStr);
              }}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">₹{totalAmount.toLocaleString("en-IN")}</span>{" "}
        {status === "completed"
          ? "confirmed (completed transactions)"
          : status === "all"
            ? "across all statuses — includes pending/failed, not confirmed revenue"
            : `across matching "${status}" transactions — not confirmed revenue`}
        {(startDate || endDate) && (
          <> · {startDate && endDate ? `${startDate} to ${endDate}` : startDate ? `from ${startDate}` : `up to ${endDate}`}</>
        )}
      </p>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading transactions...
        </div>
      ) : transactions.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No transactions match these filters.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((txn, i) => (
            <Card key={txn._id} className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => setSelected(txn)}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {totalCount - (page - 1) * 20 - i}
                  </span>
                  <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-foreground">{txn.donorName || "Anonymous"}</p>
                    <Badge className={statusColor[txn.status] || ""}>{txn.status}</Badge>
                    {txn.utm?.campaign && txn.utm.campaign !== "" && (
                      <Badge variant="outline" className="gap-1">
                        <Tag className="h-3 w-3" /> {txn.utm.campaign}
                      </Badge>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {txn.sevaName && <span className="font-medium text-foreground/80">{txn.sevaName}</span>}
                    {txn.sevaName && " · "}
                    {txn.donorEmail} · {txn.donorMobile} · {new Date(txn.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                  </div>
                </div>
                <p className="shrink-0 text-lg font-bold text-primary">₹{txn.amount.toLocaleString("en-IN")}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>Transaction Details</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Row label="Donor" value={selected.donorName || "Anonymous"} />
              <Row label="Email" value={selected.donorEmail} />
              <Row label="Mobile" value={selected.donorMobile} />
              <Row label="Seva" value={selected.sevaName} />
              <Row label="Amount" value={`₹${selected.amount.toLocaleString("en-IN")}`} />
              <Row label="Status" value={selected.status} />
              <Row label="Date" value={new Date(selected.date).toLocaleString("en-IN")} />
              {selected.message && <Row label="Occasion / Note" value={selected.message} />}
              <Row label="Razorpay Payment ID" value={selected.razorpayPaymentId} />
              <Row label="80G Requested" value={selected.certificate ? "Yes" : "No"} />
              <Row label="PAN" value={selected.panNumber} />
              <Row label="Mahaprasadam Requested" value={selected.wantPrasadam ? "Yes" : "No"} />
              {selected.wantPrasadam && selected.prasadamAddress && (
                <Row
                  label="Prasadam Address"
                  value={[
                    selected.prasadamAddress.doorNo, selected.prasadamAddress.house, selected.prasadamAddress.street,
                    selected.prasadamAddress.area, selected.prasadamAddress.city, selected.prasadamAddress.state,
                    selected.prasadamAddress.pincode, selected.prasadamAddress.country,
                  ].filter(Boolean).join(", ")}
                />
              )}
              <Row label="Receipt Number" value={selected.receiptNumber} />
              <Row label="DCC Sync Status" value={selected.dccSyncStatus} />
              <Row label="WhatsApp Receipt" value={selected.whatsappReceiptSentAt ? new Date(selected.whatsappReceiptSentAt).toLocaleString("en-IN") : "Not sent"} />
              {selected.whatsappReceiptError && <Row label="WhatsApp Error" value={selected.whatsappReceiptError} />}
              {selected.utm && (selected.utm.source || selected.utm.campaign) && (
                <div className="rounded-lg border border-border bg-muted/40 p-3">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Campaign Attribution</p>
                  <Row label="Source" value={selected.utm.source} />
                  <Row label="Medium" value={selected.utm.medium} />
                  <Row label="Campaign" value={selected.utm.campaign} />
                  {selected.utm.content && <Row label="Content" value={selected.utm.content} />}
                  {selected.utm.term && <Row label="Term" value={selected.utm.term} />}
                </div>
              )}
              {selected.status === "pending" && (
                <ManualCompleteBox donationId={selected._id} onDone={() => { setSelected(null); fetchTransactions(); }} />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ManualCompleteBox({ donationId, onDone }: { donationId: string; onDone: () => void }) {
  const [paymentId, setPaymentId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const submit = async () => {
    if (!paymentId.trim()) return;
    setSubmitting(true);
    setMsg(null);
    try {
      const res = await authFetch(`${apiUrl()}/donations-admin/manual-complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ donationId, razorpayPaymentId: paymentId.trim() }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setMsg(data.message);
      setTimeout(onDone, 1200);
    } catch (err) {
      setMsg(err instanceof Error ? err.message : "Failed to mark as paid");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-800">
        Found this paid in the Razorpay dashboard?
      </p>
      <p className="mb-2 text-xs text-amber-700">
        Paste the Payment ID (starts with pay_) from Razorpay's dashboard to mark this complete and trigger the receipt/WhatsApp.
      </p>
      <div className="flex gap-2">
        <Input placeholder="pay_..." value={paymentId} onChange={(e) => setPaymentId(e.target.value)} className="text-sm" />
        <Button size="sm" onClick={submit} disabled={submitting || !paymentId.trim()}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Mark Paid"}
        </Button>
      </div>
      {msg && <p className="mt-2 text-xs font-medium text-amber-900">{msg}</p>}
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value || "—"}</span>
    </div>
  );
}

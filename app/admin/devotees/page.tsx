"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Mail, Phone, MapPin, Eye, Download } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface Devotee {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  city?: string;
  donations: number;
  totalAmount: number;
  firstDonation: string;
  lastDonation: string;
  status: "active" | "patron" | "new";
}

export default function AdminDevotees() {
  const [devotees, setDevotees] = useState<Devotee[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedDevotee, setSelectedDevotee] = useState<Devotee | null>(null);

  const fetchDevotees = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("q", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      params.set("limit", "200");
      const res = await authFetch(`${API_URL}/devotees?${params.toString()}`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setDevotees(data.devotees || []);
        setTotal(data.total || 0);
      }
    } catch {}
    setLoading(false);
  }, [search, statusFilter]);

  useEffect(() => {
    const t = setTimeout(fetchDevotees, 300); // debounce search
    return () => clearTimeout(t);
  }, [fetchDevotees]);

  const handleExport = () => {
    const rows = [
      ["Name", "Email", "Phone", "City", "Donations", "Total Amount", "Status", "First Donation"],
      ...devotees.map((d) => [
        d.name, d.email || "", d.phone || "", d.city || "",
        String(d.donations), String(d.totalAmount), d.status,
        new Date(d.firstDonation).toLocaleDateString("en-IN"),
      ]),
    ];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `devotees-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const patrons = devotees.filter((d) => d.status === "patron").length;
  const newThisMonth = devotees.filter((d) => {
    const days = (Date.now() - new Date(d.firstDonation).getTime()) / 86400000;
    return days <= 30;
  }).length;

  const initials = (name: string) => name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-heading text-3xl font-bold">Devotees</h1>
          <p className="text-muted-foreground">
            Real donors aggregated from completed donations — there's no separate registration; a devotee is anyone who has donated.
          </p>
        </div>
        <Button onClick={handleExport} disabled={devotees.length === 0} className="gap-2 bg-transparent border border-border text-foreground hover:bg-muted">
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total Devotees</p><p className="text-2xl font-bold mt-1">{total}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">Patrons</p><p className="text-2xl font-bold mt-1">{patrons}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">New (Last 30 Days)</p><p className="text-2xl font-bold mt-1">{newThisMonth}</p></CardContent></Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name, email, or phone" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
        </div>
        <select className="rounded-md border border-input bg-background px-3 py-2 text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="patron">Patron</option>
          <option value="new">New</option>
        </select>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <p className="py-16 text-center text-sm text-muted-foreground">Loading…</p>
          ) : devotees.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No donors yet — this fills in automatically as donations complete.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium">Name</th>
                    <th className="px-4 py-3 text-left font-medium">Contact</th>
                    <th className="px-4 py-3 text-left font-medium">City</th>
                    <th className="px-4 py-3 text-left font-medium">Donations</th>
                    <th className="px-4 py-3 text-left font-medium">Total</th>
                    <th className="px-4 py-3 text-left font-medium">Status</th>
                    <th className="px-4 py-3 text-left font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {devotees.map((d) => (
                    <tr key={d._id} className="border-b hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                            {initials(d.name || "?")}
                          </div>
                          <div>
                            <div className="font-medium">{d.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Joined {new Date(d.firstDonation).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col gap-0.5 text-xs">
                          {d.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {d.email}</span>}
                          {d.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {d.phone}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {d.city ? <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {d.city}</span> : <span className="text-muted-foreground">—</span>}
                      </td>
                      <td className="px-4 py-3">{d.donations}</td>
                      <td className="px-4 py-3 font-semibold">₹{d.totalAmount.toLocaleString("en-IN")}</td>
                      <td className="px-4 py-3">
                        <Badge className={
                          d.status === "patron" ? "bg-amber-100 text-amber-700" :
                          d.status === "new" ? "bg-blue-100 text-blue-700" :
                          "bg-green-100 text-green-700"
                        }>
                          {d.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Button className="p-2 h-auto bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => setSelectedDevotee(d)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedDevotee && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setSelectedDevotee(null)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-md shadow-elevated" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold">Devotee Details</h2>
              <button onClick={() => setSelectedDevotee(null)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold">
                {initials(selectedDevotee.name || "?")}
              </div>
              <div>
                <h3 className="font-semibold text-lg">{selectedDevotee.name}</h3>
                <Badge className="capitalize">{selectedDevotee.status}</Badge>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span>{selectedDevotee.email || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span>{selectedDevotee.phone || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">City</span><span>{selectedDevotee.city || "—"}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">First Donation</span><span>{new Date(selectedDevotee.firstDonation).toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Last Donation</span><span>{new Date(selectedDevotee.lastDonation).toLocaleDateString("en-IN")}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Donations</span><span>{selectedDevotee.donations}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-semibold">₹{selectedDevotee.totalAmount.toLocaleString("en-IN")}</span></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

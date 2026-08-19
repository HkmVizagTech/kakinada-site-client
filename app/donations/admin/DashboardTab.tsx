"use client";

import { useEffect, useState } from "react";
import { authFetch } from "@/lib/authClient";
import { Card, CardContent } from "@/components/ui/card";
import { IndianRupee, Users, TrendingUp, CalendarDays, Loader2, AlertTriangle } from "lucide-react";

const apiUrl = () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface DashboardStats {
  totalDonations: { value: number; count: number };
  totalDonors: { value: number };
  thisMonth: { value: number; changePct: number | null };
  today: { value: number };
  needsAttentionCount: number;
}

const fmtRupees = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function DashboardTab() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    authFetch(`${apiUrl()}/donations-admin/dashboard-stats`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.stats);
        else setError(data.message || "Failed to load stats");
      })
      .catch(() => setError("Failed to load stats"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading dashboard...
      </div>
    );
  }

  if (error || !stats) {
    return <div className="rounded-lg bg-red-50 p-6 text-center text-red-700">{error || "No data available"}</div>;
  }

  const cards = [
    {
      label: "Total Donations",
      value: fmtRupees(stats.totalDonations.value),
      sub: `${stats.totalDonations.count} transaction${stats.totalDonations.count === 1 ? "" : "s"}`,
      icon: IndianRupee,
    },
    {
      label: "Total Donors",
      value: stats.totalDonors.value.toLocaleString("en-IN"),
      sub: "unique donors",
      icon: Users,
    },
    {
      label: "This Month",
      value: fmtRupees(stats.thisMonth.value),
      sub:
        stats.thisMonth.changePct === null
          ? "no prior month data"
          : `${stats.thisMonth.changePct >= 0 ? "+" : ""}${stats.thisMonth.changePct}% vs last month`,
      icon: TrendingUp,
    },
    {
      label: "Today",
      value: fmtRupees(stats.today.value),
      sub: "received today",
      icon: CalendarDays,
    },
    {
      label: "Needs Attention",
      value: String(stats.needsAttentionCount || 0),
      sub: "Receipt / WhatsApp issues",
      icon: AlertTriangle,
      highlight: (stats.needsAttentionCount || 0) > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-semibold text-muted-foreground">{c.label}</span>
              <c.icon className={`h-4 w-4 ${c.highlight ? "text-red-500" : "text-amber-500"}`} />
            </div>
            <p className="text-2xl font-bold text-foreground">{c.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

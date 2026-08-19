"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { IndianRupee, TrendingUp, Users, Crown } from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";
const COLORS = ["hsl(30,85%,50%)", "hsl(350,45%,35%)", "hsl(42,90%,55%)", "hsl(200,70%,50%)", "hsl(150,60%,40%)", "hsl(270,50%,55%)"];
const STATUS_COLORS: Record<string, string> = { completed: "hsl(150,60%,40%)", pending: "hsl(42,90%,55%)", failed: "hsl(0,70%,55%)" };

interface Devotee { _id: string; name: string; email?: string; totalAmount: number; donations: number; status: string }

export default function AdminAnalytics() {
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [sevaBreakdown, setSevaBreakdown] = useState<any[]>([]);
  const [statusBreakdown, setStatusBreakdown] = useState<any[]>([]);
  const [topDonors, setTopDonors] = useState<Devotee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsRes, devoteesRes] = await Promise.all([
          authFetch(`${API_URL}/dashboard/stats`, { credentials: "include" }),
          authFetch(`${API_URL}/devotees?limit=5`, { credentials: "include" }),
        ]);
        if (statsRes.ok) {
          const d = await statsRes.json();
          setMonthlyData(d.monthlyData || []);
          setDailyData(d.dailyData || []);
          setSevaBreakdown(d.sevaBreakdown || []);
          setStatusBreakdown(d.statusBreakdown || []);
        }
        if (devoteesRes.ok) {
          const d = await devoteesRes.json();
          setTopDonors(d.devotees || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const totalCompleted = statusBreakdown.find((s) => s.status === "completed")?.count || 0;
  const totalAttempted = statusBreakdown.reduce((sum, s) => sum + s.count, 0);
  const successRate = totalAttempted > 0 ? Math.round((totalCompleted / totalAttempted) * 100) : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Donation Analytics</h1>
        <p className="text-muted-foreground">
          Real donation data from the database. (Visitor/traffic analytics require a separate analytics
          service, e.g. Google Analytics or Plausible, which isn't connected yet.)
        </p>
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">Loading…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-green-500/10 text-green-600"><IndianRupee className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Successful Payments</p>
                  <p className="text-xl font-bold">{totalCompleted}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600"><TrendingUp className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Payment Success Rate</p>
                  <p className="text-xl font-bold">{successRate !== null ? `${successRate}%` : "—"}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 rounded-xl bg-pink-500/10 text-pink-600"><Users className="w-5 h-5" /></div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Donation Attempts</p>
                  <p className="text-xl font-bold">{totalAttempted}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader><CardTitle className="text-lg">Daily Donations (last 30 days)</CardTitle></CardHeader>
              <CardContent>
                {dailyData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No completed donations in the last 30 days.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={dailyData}>
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      <Line type="monotone" dataKey="donations" stroke="hsl(30,85%,50%)" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Payment Status</CardTitle></CardHeader>
              <CardContent className="flex items-center justify-center">
                {statusBreakdown.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie data={statusBreakdown} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="count" nameKey="status">
                        {statusBreakdown.map((s, i) => (
                          <Cell key={i} fill={STATUS_COLORS[s.status] || COLORS[i]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              <div className="px-6 pb-4 flex flex-wrap gap-3">
                {statusBreakdown.map((s) => (
                  <div key={s.status} className="flex items-center gap-1.5 text-xs capitalize">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[s.status] }} />
                    <span className="text-muted-foreground">{s.status} ({s.count})</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-lg">Monthly Growth (6 months)</CardTitle></CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      <Bar dataKey="donations" fill="hsl(200,70%,50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500" /> Top Donors</CardTitle></CardHeader>
              <CardContent>
                {topDonors.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No donors yet.</p>
                ) : (
                  <div className="space-y-3">
                    {topDonors.map((d, i) => (
                      <div key={d._id} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium truncate">{d.name}</p>
                            <p className="text-xs text-muted-foreground">{d.donations} donation{d.donations !== 1 ? "s" : ""}</p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold">₹{d.totalAmount.toLocaleString("en-IN")}</p>
                          {d.status === "patron" && <Badge className="text-[10px] bg-amber-500 hover:bg-amber-500/90">Patron</Badge>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}

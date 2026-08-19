"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live data and a stale cached shell can end up referencing an old JS
// bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IndianRupee, Image, CalendarDays, TrendingUp, Users, FileText, Mail, TrendingDown } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell,
} from "recharts";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";
const COLORS = ["hsl(30,85%,50%)", "hsl(350,45%,35%)", "hsl(42,90%,55%)", "hsl(200,70%,50%)", "hsl(150,60%,40%)", "hsl(270,50%,55%)"];

interface Stats {
  totalDonations: number;
  donationCount: number;
  donationChangePct: number | null;
  eventsThisMonth: number;
  galleryImages: number;
  galleryNewThisMonth: number;
  devoteesCount: number;
  publishedBlogs: number;
  newMessages: number;
}
interface MonthlyPoint { month: string; donations: number; count: number }
interface SevaSlice { name: string; value: number }
interface ActivityItem { action: string; detail: string; time: string }

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyPoint[]>([]);
  const [sevaBreakdown, setSevaBreakdown] = useState<SevaSlice[]>([]);
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(`${API_URL}/dashboard/stats`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setMonthlyData(data.monthlyData || []);
          setSevaBreakdown(data.sevaBreakdown || []);
          setRecentActivity(data.recentActivity || []);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const fmtCurrency = (n: number) =>
    n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${n.toLocaleString("en-IN")}`;

  const statCards = stats
    ? [
        {
          label: "Total Donations",
          value: fmtCurrency(stats.totalDonations),
          change: stats.donationChangePct !== null ? `${stats.donationChangePct >= 0 ? "+" : ""}${stats.donationChangePct}%` : null,
          positive: (stats.donationChangePct ?? 0) >= 0,
          icon: IndianRupee,
          color: "text-green-600",
        },
        { label: "Events This Month", value: String(stats.eventsThisMonth), icon: CalendarDays, color: "text-primary" },
        {
          label: "Gallery Images",
          value: String(stats.galleryImages),
          change: stats.galleryNewThisMonth > 0 ? `+${stats.galleryNewThisMonth}` : null,
          positive: true,
          icon: Image,
          color: "text-purple-500",
        },
        { label: "Donors", value: String(stats.devoteesCount), icon: Users, color: "text-pink-500" },
        { label: "Published Blogs", value: String(stats.publishedBlogs), icon: FileText, color: "text-amber-500" },
        { label: "New Messages", value: String(stats.newMessages), icon: Mail, color: "text-blue-500" },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name || "Admin"}</p>
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">Loading real-time stats…</p>
      ) : !stats ? (
        <p className="py-16 text-center text-muted-foreground">Couldn't load dashboard stats.</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {statCards.map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        {stat.change && (
                          <span className={`text-xs flex items-center gap-1 mt-1 ${stat.positive ? "text-green-600" : "text-red-500"}`}>
                            {stat.positive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />} {stat.change}
                          </span>
                        )}
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Donations (last 6 months)</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No completed donations yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      <Bar dataKey="donations" fill="hsl(30,85%,50%)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seva Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                {sevaBreakdown.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie data={sevaBreakdown} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                        {sevaBreakdown.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
              {sevaBreakdown.length > 0 && (
                <div className="px-6 pb-4 flex flex-wrap gap-3">
                  {sevaBreakdown.map((item, i) => (
                    <div key={item.name} className="flex items-center gap-1.5 text-xs">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-muted-foreground">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Donation Trend</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <p className="py-16 text-center text-sm text-muted-foreground">No data yet.</p>
                ) : (
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={monthlyData}>
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip formatter={(v: number) => `₹${v.toLocaleString("en-IN")}`} />
                      <Line type="monotone" dataKey="donations" stroke="hsl(350,45%,35%)" strokeWidth={2} dot={{ fill: "hsl(350,45%,35%)" }} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {recentActivity.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                  <div className="space-y-4">
                    {recentActivity.map((item, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.action}</p>
                          <p className="text-xs text-muted-foreground">{item.detail}</p>
                        </div>
                        <span className="text-xs text-muted-foreground shrink-0">{item.time}</span>
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

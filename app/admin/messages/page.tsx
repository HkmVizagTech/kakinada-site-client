"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  MessageSquare, Mail, Phone, Trash2, CheckCircle2, Circle,
  Reply, Search, Calendar,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ContactMessage {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  authorization?: boolean;
  status: "new" | "read" | "responded";
  createdAt: string;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

export default function AdminMessages() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "new" | "read" | "responded">("all");
  const [q, setQ] = useState("");
  const [newCount, setNewCount] = useState(0);
  const [selected, setSelected] = useState<ContactMessage | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter !== "all") params.set("status", filter);
      params.set("limit", "100");
      const res = await authFetch(`${API_URL}/contact-messages?${params.toString()}`, { credentials: "include" });
      const json = await res.json();
      if (res.ok) {
        setMessages(json.messages || []);
        setNewCount(json.newCount || 0);
      } else {
        toast({ title: "Failed to load messages", description: json.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const updateStatus = async (id: string, status: ContactMessage["status"]) => {
    try {
      const res = await authFetch(`${API_URL}/contact-messages/${id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setMessages((ms) => ms.map((m) => (m._id === id ? { ...m, status } : m)));
        if (selected?._id === id) setSelected((s) => (s ? { ...s, status } : s));
        if (status !== "new") setNewCount((n) => Math.max(0, n - 1));
      }
    } catch {}
  };

  const handleOpen = (m: ContactMessage) => {
    setSelected(m);
    if (m.status === "new") updateStatus(m._id, "read");
  };

  const handleDelete = async (m: ContactMessage) => {
    if (!confirm(`Delete message from ${m.name}?`)) return;
    try {
      const res = await authFetch(`${API_URL}/contact-messages/${m._id}`, { method: "DELETE", credentials: "include" });
      if (res.ok) {
        setMessages((ms) => ms.filter((x) => x._id !== m._id));
        if (selected?._id === m._id) setSelected(null);
        toast({ title: "Deleted" });
      }
    } catch {}
  };

  const visible = messages.filter((m) =>
    q ? (m.name + m.email + m.subject + m.message).toLowerCase().includes(q.toLowerCase()) : true
  );

  const statusBadge = (status: ContactMessage["status"]) => {
    if (status === "new") return <Badge className="bg-blue-500 hover:bg-blue-500/90">New</Badge>;
    if (status === "responded") return <Badge className="bg-green-600 hover:bg-green-600/90">Responded</Badge>;
    return <Badge variant="secondary">Read</Badge>;
  };

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
            <MessageSquare className="h-6 w-6 text-primary" /> Contact Messages
            {newCount > 0 && <Badge className="bg-blue-500 hover:bg-blue-500/90">{newCount} new</Badge>}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Submissions from the public Contact Us form.
          </p>
        </div>
      </div>

      <Card className="mb-5">
        <CardContent className="flex flex-wrap items-center gap-3 p-4">
          <div className="relative min-w-[240px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search messages…" value={q} onChange={(e) => setQ(e.target.value)} className="pl-9" />
          </div>
          <div className="flex gap-1.5">
            {(["all", "new", "read", "responded"] as const).map((f) => (
              <Button
                key={f}
                size="sm"
                variant={filter === f ? "default" : "outline"}
                onClick={() => setFilter(f)}
                className="capitalize"
              >
                {f}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.3fr]">
        {/* List */}
        <div className="space-y-2.5">
          {loading ? (
            <p className="py-16 text-center text-muted-foreground">Loading…</p>
          ) : visible.length === 0 ? (
            <Card>
              <CardContent className="py-16 text-center">
                <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
              </CardContent>
            </Card>
          ) : (
            visible.map((m) => (
              <Card
                key={m._id}
                onClick={() => handleOpen(m)}
                className={`cursor-pointer transition hover:shadow-md ${selected?._id === m._id ? "border-primary" : ""} ${m.status === "new" ? "bg-blue-50/50 dark:bg-blue-950/10" : ""}`}
              >
                <CardContent className="p-4">
                  <div className="mb-1.5 flex items-center justify-between gap-2">
                    <span className="flex items-center gap-1.5 truncate font-semibold">
                      {m.status === "new" ? (
                        <Circle className="h-2 w-2 shrink-0 fill-blue-500 text-blue-500" />
                      ) : null}
                      {m.name}
                    </span>
                    {statusBadge(m.status)}
                  </div>
                  <p className="mb-1 truncate text-sm font-medium text-foreground/80">{m.subject}</p>
                  <p className="line-clamp-1 text-xs text-muted-foreground">{m.message}</p>
                  <p className="mt-2 flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {new Date(m.createdAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail */}
        <Card className="h-fit lg:sticky lg:top-6">
          <CardContent className="p-6">
            {!selected ? (
              <div className="py-24 text-center text-muted-foreground">
                <Mail className="mx-auto mb-3 h-10 w-10 opacity-30" />
                Select a message to view details
              </div>
            ) : (
              <div>
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{selected.subject}</h2>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {new Date(selected.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {statusBadge(selected.status)}
                </div>

                <div className="mb-5 space-y-1.5 rounded-lg bg-muted/40 p-4 text-sm">
                  <p className="font-semibold">{selected.name}</p>
                  <p className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3.5 w-3.5" />
                    <a href={`mailto:${selected.email}`} className="hover:text-primary hover:underline">
                      {selected.email}
                    </a>
                  </p>
                  {selected.phone && (
                    <p className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <a href={`tel:${selected.phone}`} className="hover:text-primary hover:underline">
                        {selected.phone}
                      </a>
                    </p>
                  )}
                </div>

                <p className="mb-6 whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {selected.message}
                </p>

                <p className={`mb-6 flex items-center gap-2 rounded-lg border px-3 py-2 text-xs ${selected.authorization ? "border-green-600/40 bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400" : "border-border bg-muted/40 text-muted-foreground"}`}>
                  {selected.authorization ? "✓" : "✗"}{" "}
                  {selected.authorization
                    ? "SMS / Promotional message authorization granted"
                    : "No SMS / promotional message authorization"}
                </p>

                <div className="flex flex-wrap items-center gap-2 border-t pt-4">
                  <Button asChild size="sm">
                    <a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject)}`}>
                      <Reply className="mr-1.5 h-4 w-4" /> Reply by Email
                    </a>
                  </Button>
                  {selected.status !== "responded" && (
                    <Button size="sm" variant="outline" onClick={() => updateStatus(selected._id, "responded")}>
                      <CheckCircle2 className="mr-1.5 h-4 w-4" /> Mark Responded
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-red-600 hover:bg-red-50 hover:text-red-700"
                    onClick={() => handleDelete(selected)}
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" /> Delete
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

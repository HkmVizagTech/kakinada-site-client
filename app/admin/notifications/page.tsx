"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";


import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Bell, Send, Plus, X, CheckCircle, Clock, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Notification =
  | { id: number; title: string; message: string; status: "sent"; sentAt: string; recipients: number }
  | { id: number; title: string; message: string; status: "scheduled"; scheduledFor: string; recipients: number }
  | { id: number; title: string; message: string; status: "draft"; recipients: number };

const initialNotifications: Notification[] = [
  { id: 1, title: "Janmashtami 2026 Registration Open", message: "Register now for the grand Janmashtami celebration. Limited seats available for the midnight abhishekam.", status: "sent", sentAt: "2026-03-05 10:30 AM", recipients: 1250 },
  { id: 2, title: "Temple Timings Change", message: "From March 10th, evening aarti timings will be changed to 7:30 PM due to summer schedule.", status: "scheduled", scheduledFor: "2026-03-08 9:00 AM", recipients: 0 },
  { id: 3, title: "Gaura Purnima Special Programs", message: "Join us for the auspicious Gaura Purnima festival with special kirtan, abhishekam, and feast.", status: "sent", sentAt: "2026-03-01 8:00 AM", recipients: 1180 },
  { id: 4, title: "Weekly Update - March Week 1", message: "This week's programs include Sunday Feast, Bhagavad Gita study, and special Ekadashi observance.", status: "draft", recipients: 0 },
];

export default function AdminNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", scheduleFor: "" });

  const handleSend = () => {
    if (!form.title || !form.message) return;
    const newNotification: Notification = form.scheduleFor
      ? {
          id: Date.now(),
          title: form.title,
          message: form.message,
          status: "scheduled",
          scheduledFor: form.scheduleFor,
          recipients: 0,
        }
      : {
          id: Date.now(),
          title: form.title,
          message: form.message,
          status: "sent",
          sentAt: new Date().toLocaleString("en-IN"),
          recipients: 1250,
        };

    setNotifications([newNotification, ...notifications]);
    setShowForm(false);
    setForm({ title: "", message: "", scheduleFor: "" });
  };

  const statusIcon = (status: string) => {
    if (status === "sent") return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === "scheduled") return <Clock className="w-4 h-4 text-blue-500" />;
    return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Send push notifications to devotees</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4 mr-2" /> New Notification</Button>
      </div>

      {
}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Total Sent</p>
            <p className="text-2xl font-bold mt-1">{notifications.filter(n => n.status === "sent").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Scheduled</p>
            <p className="text-2xl font-bold mt-1">{notifications.filter(n => n.status === "scheduled").length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="text-2xl font-bold mt-1">{notifications.filter(n => n.status === "draft").length}</p>
          </CardContent>
        </Card>
      </div>

      {
}
      {showForm && (
        <div className="fixed inset-0 z-50 bg-foreground/50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
          <div className="bg-background rounded-2xl p-6 w-full max-w-lg shadow-elevated" onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-heading text-xl font-bold">Create Notification</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Title</label>
                <Input placeholder="Notification title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Message</label>
                <Textarea placeholder="Notification message..." value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={4} />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Schedule (optional)</label>
                <Input type="datetime-local" value={form.scheduleFor} onChange={(e) => setForm({ ...form, scheduleFor: e.target.value })} />
                <p className="text-xs text-muted-foreground mt-1">Leave empty to send immediately</p>
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={handleSend}>
                  <Send className="w-4 h-4 mr-2" /> {form.scheduleFor ? "Schedule" : "Send Now"}
                </Button>
                <Button className="bg-transparent border border-border text-foreground hover:bg-muted" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {
}
      <div className="space-y-4">
        {notifications.map((notif) => (
          <Card key={notif.id}>
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-muted">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{notif.title}</h3>
                    <div className="flex items-center gap-1">
                      {statusIcon(notif.status)}
                      <Badge className="capitalize">{notif.status}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{notif.message}</p>
                  <div className="text-xs text-muted-foreground">
                    {notif.status === "sent" && <>Sent: {notif.sentAt} • {notif.recipients} recipients</>}
                    {notif.status === "scheduled" && <>Scheduled for: {notif.scheduledFor}</>}
                    {notif.status === "draft" && <>Draft — not sent</>}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

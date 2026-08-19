"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/contexts/AuthContext";
import { User, Lock, Bell, Palette, Shield, LogOut, Save, Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:8080";

interface Preferences {
  newDonation: boolean;
  newDevotee: boolean;
  eventReminders: boolean;
  weeklyReport: boolean;
}

export default function AdminSettings() {
  const { logout, user } = useAuth();
  const router = useRouter();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: "", new: "", confirm: "" });
  const [showPasswords, setShowPasswords] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [notifications, setNotifications] = useState<Preferences>({
    newDonation: true, newDevotee: true, eventReminders: true, weeklyReport: false,
  });
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [appearance, setAppearance] = useState({ darkMode: false, compactMode: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Appearance is a genuine local browser preference — persisted via localStorage, not the backend
    try {
      const saved = localStorage.getItem("hkm-admin-appearance");
      if (saved) setAppearance(JSON.parse(saved));
    } catch {}

    (async () => {
      try {
        const res = await authFetch(`${API_URL}/users/profile`, { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setProfile({ name: data.user.name || "", email: data.user.email || "" });
          if (data.user.preferences) setNotifications(data.user.preferences);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
  };

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await authFetch(`${API_URL}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: profile.name, email: profile.email }),
      });
      const json = await res.json();
      if (res.ok) toast({ title: "Profile updated" });
      else toast({ title: "Failed", description: json.message, variant: "destructive" });
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!passwordForm.current || !passwordForm.new) {
      toast({ title: "Fill in both password fields", variant: "destructive" });
      return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      toast({ title: "Passwords don't match", variant: "destructive" });
      return;
    }
    setSavingPassword(true);
    try {
      const res = await authFetch(`${API_URL}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.new }),
      });
      const json = await res.json();
      if (res.ok) {
        toast({ title: "Password updated" });
        setPasswordForm({ current: "", new: "", confirm: "" });
      } else {
        toast({ title: "Failed", description: json.message, variant: "destructive" });
      }
    } catch (e: any) {
      toast({ title: "Network error", description: e.message, variant: "destructive" });
    } finally {
      setSavingPassword(false);
    }
  };

  const handleToggleNotification = async (key: keyof Preferences, checked: boolean) => {
    const updated = { ...notifications, [key]: checked };
    setNotifications(updated); // optimistic
    setSavingPrefs(true);
    try {
      const res = await authFetch(`${API_URL}/users/update`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ preferences: updated }),
      });
      if (!res.ok) {
        setNotifications(notifications); // revert on failure
        toast({ title: "Failed to save preference", variant: "destructive" });
      }
    } catch {
      setNotifications(notifications);
    } finally {
      setSavingPrefs(false);
    }
  };

  const handleToggleAppearance = (key: keyof typeof appearance, checked: boolean) => {
    const updated = { ...appearance, [key]: checked };
    setAppearance(updated);
    try {
      localStorage.setItem("hkm-admin-appearance", JSON.stringify(updated));
    } catch {}
  };

  if (loading) {
    return <div className="py-24 text-center text-muted-foreground">Loading settings…</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><User className="w-5 h-5" /> Profile</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Name</label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Email</label>
              <Input type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>
            <Button onClick={handleSaveProfile} disabled={savingProfile}>
              {savingProfile ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5" /> Change Password</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Current Password</label>
              <Input type={showPasswords ? "text" : "password"} value={passwordForm.current} onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">New Password</label>
              <Input type={showPasswords ? "text" : "password"} value={passwordForm.new} onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Confirm New Password</label>
              <Input type={showPasswords ? "text" : "password"} value={passwordForm.confirm} onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowPasswords(!showPasswords)} className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
                {showPasswords ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showPasswords ? "Hide" : "Show"} passwords
              </button>
            </div>
            <Button onClick={handleChangePassword} disabled={savingPassword}>
              {savingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Lock className="w-4 h-4 mr-2" />} Update Password
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications {savingPrefs && <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {([
              { key: "newDonation", label: "New Donation Alerts", desc: "Get notified when a new donation is received" },
              { key: "newDevotee", label: "New Devotee Registration", desc: "Get notified when a first-time donor gives" },
              { key: "eventReminders", label: "Event Reminders", desc: "Reminders for upcoming temple events" },
              { key: "weeklyReport", label: "Weekly Report", desc: "Receive a weekly summary email" },
            ] as const).map((item) => (
              <div key={item.key} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch checked={notifications[item.key]} onCheckedChange={(checked) => handleToggleNotification(item.key, checked)} />
              </div>
            ))}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Preference is saved, but actual email/WhatsApp delivery for these alerts isn't wired up yet.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5" /> Appearance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div><p className="font-medium">Dark Mode</p><p className="text-sm text-muted-foreground">Use dark theme for the admin panel</p></div>
              <Switch checked={appearance.darkMode} onCheckedChange={(checked) => handleToggleAppearance("darkMode", checked)} />
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="font-medium">Compact Mode</p><p className="text-sm text-muted-foreground">Reduce spacing and padding</p></div>
              <Switch checked={appearance.compactMode} onCheckedChange={(checked) => handleToggleAppearance("compactMode", checked)} />
            </div>
            <p className="text-xs text-muted-foreground pt-2 border-t">Saved to this browser only.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Shield className="w-5 h-5" /> Security</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div><p className="font-medium">Two-Factor Authentication</p><p className="text-sm text-muted-foreground">Add an extra layer of security</p></div>
              <Button disabled title="Not built yet" className="bg-transparent border border-border text-muted-foreground">Coming Soon</Button>
            </div>
            <div className="flex items-center justify-between py-2">
              <div><p className="font-medium">Active Sessions</p><p className="text-sm text-muted-foreground">Manage devices where you're logged in</p></div>
              <Button disabled title="Not built yet" className="bg-transparent border border-border text-muted-foreground">Coming Soon</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div><p className="font-medium text-destructive">Sign Out</p><p className="text-sm text-muted-foreground">Sign out of the admin panel</p></div>
              <Button className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={handleLogout}>
                <LogOut className="w-4 h-4 mr-2" /> Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

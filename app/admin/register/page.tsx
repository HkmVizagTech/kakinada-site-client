"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, User, AlertCircle, ShieldCheck } from "lucide-react";
import { authFetch } from "@/lib/authClient";

export default function AdminRegister() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "user" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      // This endpoint now requires an authenticated admin — you must already
      // be logged in as an admin to invite another staff account.
      const res = await authFetch(`${(process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "")}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Registration failed");
      setForm({ name: "", email: "", password: "", role: "user" });
      router.push("/admin/settings");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted to-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-primary-foreground" />
          </div>
          <h1 className="font-heading text-3xl font-bold">Add Staff Account</h1>
          <p className="text-muted-foreground mt-2">You must be logged in as an admin to add a new account.</p>
        </div>
        <div className="bg-card rounded-2xl shadow-elevated p-8 border border-border">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 p-3 rounded-lg">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="name"
                  placeholder="Your Name"
                  value={form.name}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">Access Level</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "user" })}
                  className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${form.role === "user" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <span className="block font-semibold">Standard</span>
                  <span className="block text-xs text-muted-foreground">No admin access</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "donations_admin" })}
                  className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${form.role === "donations_admin" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <span className="block font-semibold">Donations Admin</span>
                  <span className="block text-xs text-muted-foreground">Only /donations/admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, role: "blogs_admin" })}
                  className={`rounded-lg border-2 p-3 text-left text-sm transition-colors ${form.role === "blogs_admin" ? "border-primary bg-primary/5" : "border-border"}`}
                >
                  <span className="block font-semibold">Blog Manager</span>
                  <span className="block text-xs text-muted-foreground">Write/edit only — deletion needs your approval</span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "Registering..." : "Register"}
            </Button>
          </form>
          <p className="text-xs text-center mt-4 text-muted-foreground">
            Need a full admin account instead? That has to be set up separately — this form only creates Standard or Donations Admin accounts.
          </p>
        </div>
      </motion.div>
    </div>
  );
}

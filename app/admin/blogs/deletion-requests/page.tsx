"use client";

// Admin pages must never be statically cached at the CDN edge.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Check, X, Loader2, ExternalLink } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3000";

interface DeletionRequest {
  _id: string;
  title: string;
  slug: string;
  category: string;
  coverImage?: string;
  deletionRequestedBy?: { name: string; email: string };
  deletionRequestedAt?: string;
}

export default function DeletionRequestsPage() {
  const [requests, setRequests] = useState<DeletionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_URL}/blogs/deletion-requests`, { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setRequests(data.blogs || []);
      }
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (req: DeletionRequest) => {
    if (!confirm(`Permanently delete "${req.title}"? This cannot be undone.`)) return;
    setActingOn(req._id);
    try {
      const res = await authFetch(`${API_URL}/blogs/${req._id}/approve-deletion`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: "Post deleted" });
        setRequests((rs) => rs.filter((r) => r._id !== req._id));
      } else {
        toast({ title: "Failed to approve", variant: "destructive" });
      }
    } finally {
      setActingOn(null);
    }
  };

  const handleReject = async (req: DeletionRequest) => {
    setActingOn(req._id);
    try {
      const res = await authFetch(`${API_URL}/blogs/${req._id}/reject-deletion`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        toast({ title: "Request rejected", description: "The post has been kept." });
        setRequests((rs) => rs.filter((r) => r._id !== req._id));
      } else {
        toast({ title: "Failed to reject", variant: "destructive" });
      }
    } finally {
      setActingOn(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Trash2 className="h-6 w-6 text-amber-500" /> Pending Blog Deletions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Posts a Blog Manager has asked to delete. Nothing is removed until you approve it here.
        </p>
      </div>

      {loading ? (
        <p className="py-16 text-center text-muted-foreground">Loading…</p>
      ) : requests.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Trash2 className="mx-auto mb-3 h-12 w-12 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground">No pending deletion requests right now.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((req) => (
            <Card key={req._id} className="border-amber-200 bg-amber-50/40">
              <CardContent className="flex flex-wrap items-center gap-4 p-4">
                {req.coverImage && (
                  <div className="relative h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                    <Image src={req.coverImage} alt={req.title} fill className="object-cover" />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <Link href={`/blogs/${req.slug}`} target="_blank" className="flex items-center gap-1.5 truncate font-medium hover:text-primary">
                    {req.title} <ExternalLink className="h-3 w-3 shrink-0" />
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {req.category} · Requested by {req.deletionRequestedBy?.name || "unknown"}
                    {req.deletionRequestedAt && ` on ${new Date(req.deletionRequestedAt).toLocaleDateString("en-IN")}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={actingOn === req._id}
                    onClick={() => handleReject(req)}
                    className="border-border"
                  >
                    {actingOn === req._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="mr-1 h-3.5 w-3.5" />}
                    Keep Post
                  </Button>
                  <Button
                    size="sm"
                    disabled={actingOn === req._id}
                    onClick={() => handleApprove(req)}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    {actingOn === req._id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="mr-1 h-3.5 w-3.5" />}
                    Approve Deletion
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

// Admin pages must never be statically cached at the CDN edge — they show
// live, admin-managed data and a stale cached shell can end up referencing
// an old JS bundle indefinitely.
export const dynamic = "force-dynamic";

import { authFetch } from "@/lib/authClient";

import { useEffect, useMemo, useState, Fragment } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useParams } from "next/navigation";

export default function FestivalDonations() {
  const params = useParams();
  const festivalId = params?.id;
  const [donations, setDonations] = useState<any[]>([]);
  const [filters, setFilters] = useState({ q: '', status: 'all', minAmount: '', maxAmount: '', from: '', to: '' });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [total, setTotal] = useState(0);
  const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003";

  useEffect(() => { if (festivalId) fetchDonations(); }, [festivalId, page, pageSize, filters]);

  const fetchDonations = async () => {
    setLoading(true);
    try {
  const fid = Array.isArray(festivalId) ? festivalId[0] : (festivalId || '');
  const q = new URLSearchParams({ festivalId: String(fid), page: String(page), limit: String(pageSize) });
      if (filters.status && filters.status !== 'all') q.set('status', filters.status);
      if (filters.from) q.set('from', filters.from);
      if (filters.to) q.set('to', filters.to);
      if (filters.q) q.set('q', filters.q);
      const res = await authFetch(`${apiUrl}/donations?${q.toString()}`, { credentials: 'include' });
      if (!res.ok) return;
      const data = await res.json();
      setDonations(data.donations || []);
      setTotal(data.total || 0);
    } catch (err) {}
    setLoading(false);
  };

  const exportCSV = () => {
    const cols = ['donorName','donorEmail','donorMobile','amount','panNumber','certificate','wantPrasadam','prasadamAddress','status','date','transactionId','razorpayOrderId'];
    const rows = donations.map(d => cols.map(c => {
      if (c === 'certificate' || c === 'wantPrasadam') return JSON.stringify(d[c] ? '✓' : '');
      if (c === 'prasadamAddress') return JSON.stringify(d.prasadamAddress ? JSON.stringify(d.prasadamAddress) : '');
      return JSON.stringify(d[c] ?? '');
    }).join(',') );
    const csv = [cols.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `festival-${festivalId}-donations.csv`; a.click(); URL.revokeObjectURL(url);
  };


  const resendReceipt = async (donationId: string) => {
    try {
      const res = await authFetch(`${apiUrl}/donations/${donationId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      if (!res.ok) throw new Error('Failed');
      alert('Resend triggered (if configured)');
    } catch (err) {
      console.error(err);
      alert('Failed to trigger resend');
    }
  };

  const clearFilters = () => { setFilters({ q: '', status: 'all', minAmount: '', maxAmount: '', from: '', to: '' }); setPage(1); };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const paginatedDonations = donations;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold">Donations</h1>
          <p className="text-muted-foreground">Donations for festival: {festivalId}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportCSV}>Export CSV</Button>
          <Button onClick={fetchDonations} variant="outline">Refresh</Button>
        </div>
      </div>

      <div className="bg-card rounded-lg p-3 flex gap-3 items-center">
        <input value={filters.q} onChange={(e)=>setFilters(f=>({...f, q: e.target.value}))} placeholder="Search donor / email / mobile" className="px-3 py-2 rounded border bg-white/5 text-sm w-64" />
        <select value={filters.status} onChange={(e)=>setFilters(f=>({...f, status: e.target.value}))} className="px-3 py-2 rounded border bg-white/5 text-sm">
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
        <input value={filters.minAmount} onChange={(e)=>setFilters(f=>({...f, minAmount: e.target.value}))} placeholder="Min amount" className="px-3 py-2 rounded border bg-white/5 text-sm w-28" />
        <input value={filters.maxAmount} onChange={(e)=>setFilters(f=>({...f, maxAmount: e.target.value}))} placeholder="Max amount" className="px-3 py-2 rounded border bg-white/5 text-sm w-28" />
        <input type="date" value={filters.from} onChange={(e)=>setFilters(f=>({...f, from: e.target.value}))} className="px-3 py-2 rounded border bg-white/5 text-sm" />
        <input type="date" value={filters.to} onChange={(e)=>setFilters(f=>({...f, to: e.target.value}))} className="px-3 py-2 rounded border bg-white/5 text-sm" />
        <Button variant="ghost" onClick={clearFilters}>Clear</Button>
      </div>

      <section className="bg-card rounded-2xl p-4">
        {loading && <div className="text-center py-8">Loading...</div>}
        {!loading && !donations.length && <div className="text-center text-muted-foreground py-8">No donations yet.</div>}
  {!loading && donations.length > 0 && (
          <>
          <div className="overflow-auto max-h-[60vh]">
            <table className="min-w-full text-sm border-collapse">
              <thead className="sticky top-0 bg-white/5 backdrop-blur-md z-10">
                <tr className="text-left text-muted-foreground border-b">
                  <th className="p-3">Donor</th>
                  <th className="p-3">Email / Mobile</th>
                  <th className="p-3">PAN</th>
                  <th className="p-3">80G</th>
                  <th className="p-3">Prasadam</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Txn / Order</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDonations.map((d) => (
                  <Fragment key={d._id}>
                    <tr className="border-b even:bg-white/2">
                      <td className="p-3 font-medium">{d.donorName || 'Anonymous'}</td>
                      <td className="p-3 text-muted-foreground">{d.donorEmail}<br/><span className="text-xs">{d.donorMobile}</span></td>
                      <td className="p-3">{d.panNumber || '-'}</td>
                      <td className="p-3 text-center">{d.certificate ? '✓' : ''}</td>
                      <td className="p-3 text-center">{d.wantPrasadam ? '✓' : ''}</td>
                      <td className="p-3">₹{d.amount}</td>
                      <td className="p-3">{d.status}</td>
                      <td className="p-3 text-muted-foreground">{d.date ? new Date(d.date).toLocaleString() : ''}</td>
                      <td className="p-3 text-muted-foreground">{d.transactionId || '-'}<br/><span className="text-xs">{d.razorpayOrderId || ''}</span></td>
                      <td className="p-3">
                        <div className="flex gap-2 items-center">
                          <div className="text-xs text-muted-foreground">(paid via webhook)</div>
                          <Button size="sm" variant="outline" onClick={()=>resendReceipt(d._id)}>Resend</Button>
                          <Button size="sm" variant="ghost" onClick={()=>setExpandedId(expandedId===d._id?null:d._id)}>Details</Button>
                        </div>
                      </td>
                    </tr>
                    {expandedId===d._id && (
                      <tr key={d._id+"-details"} className="bg-white/3">
                        <td colSpan={10} className="p-3 text-sm">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <h4 className="font-semibold">Prasadam Address</h4>
                              {d.prasadamAddress ? (
                                <div className="text-xs mt-1">
                                  <div>{d.prasadamAddress.doorNo} {d.prasadamAddress.house}</div>
                                  <div>{d.prasadamAddress.street}</div>
                                  <div>{d.prasadamAddress.area}</div>
                                  <div>{d.prasadamAddress.city}, {d.prasadamAddress.state} - {d.prasadamAddress.pincode}</div>
                                </div>
                              ) : (<div className="text-xs text-muted-foreground">No address provided</div>)}
                            </div>
                            <div>
                              <h4 className="font-semibold">Notes & Tax</h4>
                              <div className="text-xs mt-1">PAN: {d.panNumber || '-'}</div>
                              <div className="text-xs">80G requested: {d.certificate ? 'Yes' : 'No'}</div>
                              <div className="text-xs mt-2">Message: {d.message || '-'}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
            </div>
            {
}
            <div className="mt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <div>Total: {total}</div>
                <div>Page {page} / {totalPages}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>Prev</Button>
                <Button size="sm" variant="outline" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))}>Next</Button>
                <select value={pageSize} onChange={(e)=>{ setPageSize(Number(e.target.value)); setPage(1); }} className="px-2 py-1 rounded border bg-white/5 text-sm">
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

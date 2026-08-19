"use client";
import { authFetch } from "@/lib/authClient";

import React, { useEffect, useState } from "react";
import QRScannerModal from "./QRScannerModal";

type Registration = {
  _id: string;
  token: string;
  data: Record<string, any>;
  files?: { url: string; fieldname?: string }[];
  present?: boolean;
  createdAt?: string;
};

export default function RegistrationsList({ eventId, tableOnly }: { eventId: string; tableOnly?: boolean }) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [tableView, setTableView] = useState(!!tableOnly);
  const [formFields, setFormFields] = useState<{ name: string; label?: string }[]>([]);
  const [filterField, setFilterField] = useState<string>("");
  const [filterValue, setFilterValue] = useState<string>("");
  const [columnFilters, setColumnFilters] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState<string>("");
  const [filterPresent, setFilterPresent] = useState<'all' | 'present' | 'absent'>('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [scannerOpen, setScannerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPage(1);
  }, [eventId]);

  useEffect(() => {
    const loadForm = async () => {
      if (!eventId) return;
      try {
        const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "") || "http://localhost:3003";
  const res = await authFetch(`${apiUrl}/events/${eventId}`, { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        const rf = json.event?.registrationForm;
        if (rf && Array.isArray(rf.fields)) {
          setFormFields(rf.fields.map((f: any) => ({ name: f.name || f.key || f.id || '', label: f.label || f.title || f.name })));
        } else {
          setFormFields([]);
        }
      } catch (e) {
      }
    };
    loadForm();
  }, [eventId]);

  async function fetchPage(p: number) {
    setLoading(true);
  setError(null);
    try {
  const params = new URLSearchParams();
  params.set('page', String(p));
  params.set('limit', String(pageSize));
  if (query) params.set('q', query);
  if (filterPresent === 'present') params.set('attended', 'true');
  if (filterPresent === 'absent') params.set('attended', 'false');
  const res = await authFetch(`/api/events/${eventId}/registrations?${params.toString()}`);
      if (!res.ok) {
        let errMsg = `Status ${res.status}`;
        try {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const errJson = await res.json().catch(() => null);
            if (errJson) {
              if (typeof errJson === "string") errMsg = errJson;
              else if (errJson.message) errMsg = errJson.message;
              else errMsg = JSON.stringify(errJson);
            }
          } else {
            const text = await res.text().catch(() => null);
            if (text) errMsg = text;
          }
        } catch (e) {
          // fall back to status
        }
  // set visible error and exit early instead of throwing to avoid
  // client-side uncaught error traces in the dev overlay
  setError(errMsg);
  setLoading(false);
  return;
      }
      const json = await res.json();
      setRegistrations(json.items || []);
      setTotal(json.total || 0);
      setPage(p);
    } catch (e) {
      console.error(e);
      setError((e as Error).message || 'Failed to load registrations');
    } finally {
      setLoading(false);
    }
  }

  function exportCSV() {
    const headersSet = new Set<string>();
    registrations.forEach((r) => Object.keys(r.data || {}).forEach((k) => headersSet.add(k)));
    const cols = formFields.length ? formFields.map((f) => f.name) : Array.from(headersSet);
    const site = (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || ''));
    const rows = filteredRegistrations.map((r) => {
      const checkin = `${site}/events/${eventId}/checkin/${encodeURIComponent(r.token)}`;
      const vals = cols.map((c) => JSON.stringify(r.data?.[c] ?? ""));
      vals.push(JSON.stringify(r.token || ""));
      vals.push(JSON.stringify(checkin));
      return vals.join(",");
    });
    const headerRow = [...cols, 'token', 'checkin_url'].join(",");
    const csv = [headerRow, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `registrations-${eventId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const filteredRegistrations = registrations.filter((r) => {
    if (filterPresent === 'present' && !r.present) return false;
    if (filterPresent === 'absent' && r.present) return false;
    if (filterField && filterValue) {
      const v = String(r.data?.[filterField] ?? '');
      if (!v.toLowerCase().includes(filterValue.toLowerCase())) return false;
    }
    for (const k of Object.keys(columnFilters)) {
      const val = columnFilters[k];
      if (!val) continue;
      const rv = String(r.data?.[k] ?? '');
      if (!rv.toLowerCase().includes(val.toLowerCase())) return false;
    }
    return true;
  });

  async function markAttendance(token: string) {
    try {
      const res = await authFetch(`/api/events/${eventId}/registrations/${token}/attendance`, { method: "POST" });
      if (!res.ok) throw new Error("failed");
      fetchPage(page);
    } catch (e) {
      console.error(e);
    }
  }

  if (tableOnly) {
    if (loading) return (<div className="text-center py-6">Loading...</div>);
    const cols = formFields.length ? formFields.map((f) => ({ key: f.name, label: f.label || f.name })) : (() => {
      const headers = new Set<string>();
      registrations.forEach((r) => Object.keys(r.data || {}).forEach((k) => headers.add(k)));
      return Array.from(headers).map((k) => ({ key: k, label: k }));
    })();

    return (
    <div>
        <div className="flex items-center justify-between mb-3">
          <div />
          <div className="flex items-center gap-2">
            <button className="btn" onClick={() => exportCSV()}>Export CSV</button>
          </div>
        </div>
        {
}
        <div className="flex items-center gap-2 mb-3">
          <select value={filterField} onChange={(e) => setFilterField(e.target.value)} className="rounded-md border px-2 py-1">
            <option value="">All fields</option>
            {cols.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </select>
          <input value={filterValue} onChange={(e) => setFilterValue(e.target.value)} placeholder="Filter value" className="rounded-md border px-3 py-1" />
          <select value={filterPresent} onChange={(e) => setFilterPresent(e.target.value as any)} className="rounded-md border px-2 py-1">
            <option value="all">All</option>
            <option value="present">Present</option>
            <option value="absent">Absent</option>
          </select>
        </div>

        {error && <div className="text-destructive mb-2">{error}</div>}
        <div className="overflow-x-auto bg-card rounded-md border">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-background/60">
                {cols.map((c) => <th key={c.key} className="text-left px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{c.label}</th>)}
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Attachments</th>
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Check-in URL</th>
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Present</th>
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Registered At</th>
              </tr>
            </thead>
            <tbody>
              {
}
              <tr className="bg-background">
                {cols.map((c) => (
                  <td key={`filter-${c.key}`} className="px-4 py-2">
                    <input value={columnFilters[c.key] || ''} onChange={(e) => setColumnFilters((s) => ({ ...s, [c.key]: e.target.value }))} placeholder={`Filter ${c.label}`} className="w-full rounded-md border px-2 py-1 text-sm" />
                  </td>
                ))}
                <td />
                <td />
                <td />
              </tr>
              {filteredRegistrations.map((r) => (
                <tr key={r._id} className="border-t">
                  {cols.map((c) => <td key={`${r._id}-${c.key}`} className="px-4 py-3 text-sm whitespace-nowrap">{String(r.data?.[c.key] ?? '')}</td>)}
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{r.files?.length ? r.files.map((f, i) => (<div key={i}><a href={f.url} target="_blank" rel="noreferrer" className="text-primary">Attachment</a></div>)) : <span className="text-muted-foreground">-</span>}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <a href={`${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')}/events/${eventId}/checkin/${encodeURIComponent(r.token)}`} target="_blank" rel="noreferrer" className="text-primary underline">Open</a>
                      <button className="px-2 py-1 border rounded text-xs" onClick={() => navigator.clipboard?.writeText(`${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')}/events/${eventId}/checkin/${encodeURIComponent(r.token)}`)}>Copy</button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{r.present ? 'Yes' : 'No'}</td>
                  <td className="px-4 py-3 text-sm whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  return (
    <div>
      {!tableOnly ? (
        <div className="flex items-center justify-between mb-4 gap-4 flex-wrap">
          <div className="flex gap-2 items-center">
            <button className="btn" onClick={() => fetchPage(1)}>Refresh</button>
            <button className="btn" onClick={() => exportCSV()}>Export CSV</button>
            <button className="btn" onClick={() => setScannerOpen(true)}>Open Scanner</button>
            <button className="btn" onClick={() => setTableView((v) => !v)}>{tableView ? 'Card View' : 'Table View'}</button>
          </div>
          <div className="flex items-center gap-3">
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search name or email" className="rounded-md border px-3 py-2" />
            <select value={filterPresent} onChange={(e) => setFilterPresent(e.target.value as any)} className="rounded-md border px-2 py-2">
              <option value="all">All</option>
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </select>
            <div className="text-sm text-muted-foreground">Total: {total}</div>
          </div>
        </div>
      ) : (
        <div className="mb-4"><div className="text-sm text-muted-foreground">Showing registrations for this event</div></div>
      )}

      {loading ? (
        <div className="text-center py-6">Loading...</div>
      ) : tableView ? (
        <div className="overflow-x-auto bg-card rounded-md border">
          <table className="w-full min-w-max table-auto">
            <thead>
              <tr className="bg-background/60">
                {(() => {
                  const headers = new Set<string>();
                  registrations.forEach((r) => Object.keys(r.data || {}).forEach((k) => headers.add(k)));
                  const cols = Array.from(headers).map((k) => ({ key: k, label: k }));
                  return cols.map((c) => <th key={c.key} className="text-left px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{c.label}</th>);
                })()}
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Attachments</th>
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Check-in URL</th>
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Present</th>
                <th className="text-left px-4 py-3 text-sm text-muted-foreground">Registered At</th>
              </tr>
            </thead>
            <tbody>
              <tr className="bg-background">
                {(() => {
                  const headers = new Set<string>();
                  registrations.forEach((r) => Object.keys(r.data || {}).forEach((k) => headers.add(k)));
                  const cols = Array.from(headers).map((k) => ({ key: k, label: k }));
                  return cols.map((c) => (
                    <td key={`filter-${c.key}`} className="px-4 py-2">
                      <input value={columnFilters[c.key] || ''} onChange={(e) => setColumnFilters((s) => ({ ...s, [c.key]: e.target.value }))} placeholder={`Filter ${c.label}`} className="w-full rounded-md border px-2 py-1 text-sm" />
                    </td>
                  ));
                })()}
                <td />
                <td />
                <td />
              </tr>
              {registrations.map((r) => {
                const headers = new Set<string>();
                registrations.forEach((rr) => Object.keys(rr.data || {}).forEach((k) => headers.add(k)));
                const cols = Array.from(headers);
                return (
                  <tr key={r._id} className="border-t">
                    {cols.map((k) => <td key={`${r._id}-${k}`} className="px-4 py-3 text-sm whitespace-nowrap">{String(r.data?.[k] ?? '')}</td>)}
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{r.files?.length ? r.files.map((f, i) => (<div key={i}><a href={f.url} target="_blank" rel="noreferrer" className="text-primary">Attachment</a></div>)) : <span className="text-muted-foreground">-</span>}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <a href={`${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')}/events/${eventId}/checkin/${encodeURIComponent(r.token)}`} target="_blank" rel="noreferrer" className="text-primary underline">Open</a>
                        <button className="px-2 py-1 border rounded text-xs" onClick={() => navigator.clipboard?.writeText(`${typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || '')}/events/${eventId}/checkin/${encodeURIComponent(r.token)}`)}>Copy</button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{r.present ? 'Yes' : 'No'}</td>
                    <td className="px-4 py-3 text-sm whitespace-nowrap">{r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {registrations.map((r) => {
            const site = (typeof window !== 'undefined' ? window.location.origin : (process.env.NEXT_PUBLIC_SITE_URL || ''));
            const url = `${site}/events/${eventId}/checkin/${encodeURIComponent(r.token)}`;
            return (
              <div key={r._id} className="bg-card rounded-xl p-4 border">
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <img src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(url)}`} alt="qr" className="w-28 h-28 object-contain rounded" />
                    <div className="text-xs text-muted-foreground mt-2">{r.token.slice(0, 10)}...</div>
                  </div>
                  <div className="grow">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg">{r.data?.name || '-'} </div>
                        <div className="text-sm text-muted-foreground">{r.data?.email || '-'}</div>
                      </div>
                      <div className="text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.present ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>{r.present ? 'Present' : 'Absent'}</span>
                      </div>
                    </div>
                    <div className="mt-3 text-sm">
                      {r.files?.length ? r.files.map((f, i) => <div key={i}><a href={f.url} target="_blank" rel="noreferrer" className="text-primary">View attachment</a></div>) : <div className="text-muted-foreground">No attachments</div>}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {!r.present && <button className="px-3 py-1 bg-primary text-primary-foreground rounded" onClick={() => markAttendance(r.token)}>Mark Present</button>}
                      <button className="px-3 py-1 border rounded" onClick={() => navigator.clipboard?.writeText(url)}>Copy URL</button>
                      <button className="px-3 py-1 border rounded" onClick={() => setExpanded(expanded === r._id ? null : r._id)}>{expanded === r._id ? 'Hide' : 'Details'}</button>
                    </div>
                    {expanded === r._id && (
                      <div className="mt-3 text-sm border-t pt-3 space-y-2">
                        {Object.entries(r.data || {}).map(([k, v]) => (
                          <div key={k} className="flex justify-between">
                            <div className="text-muted-foreground">{k}</div>
                            <div className="font-medium">{String(v)}</div>
                          </div>
                        ))}
                        <div className="text-muted-foreground text-xs">Registered: {r.createdAt ? new Date(r.createdAt).toLocaleString() : '-'}</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm">Page {page}</div>
        <div className="flex gap-2">
          <button className="btn" onClick={() => fetchPage(Math.max(1, page - 1))}>Prev</button>
          <button className="btn" onClick={() => fetchPage(page + 1)}>Next</button>
        </div>
      </div>

      <QRScannerModal open={scannerOpen} onClose={() => setScannerOpen(false)} onDetected={(token) => { setScannerOpen(false); markAttendance(token); }} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Download, Percent, Phone, Users } from "lucide-react";
import { candidatesApi } from "@/lib/vanabhojanam/api";
import { useAsyncData, useDebouncedValue, usePagination } from "@/lib/vanabhojanam/hooks";
import { exportToExcel } from "@/lib/vanabhojanam/exportExcel";
import { areaKey, areaOptions, inDateRange, matchesSearch, uniqueSorted } from "@/lib/vanabhojanam/filters";
import { formatDate, formatDateTime } from "@/lib/vanabhojanam/format";
import { useAdminEvent } from "../../context/AdminEventContext";
import { ErrorNotice, PageSpinner, VbBadge } from "../../ui/Feedback";
import { VbButton } from "../../ui/Button";
import {
  DataTable, EventSwitcher, FilterBar, InputFilter, PageHeader, Pagination, SelectFilter, StatCard, type Column,
} from "../AdminKit";

const PAGE_SIZE = 50;

const isAttendee = (c: any) => c.paymentStatus === "Paid";
const hasAttended = (c: any) => Boolean(c.adminAttendance || c.attendance);
const attendedAt = (c: any) => c.adminAttendanceDate || c.attendanceDate;

const byPhoneThenName = (a: any, b: any) =>
  (a.whatsappNumber || "").localeCompare(b.whatsappNumber || "") || (a.name || "").localeCompare(b.name || "");

const columns: Column<any>[] = [
  { key: "idx", header: "#", render: (_, i) => i + 1 },
  {
    key: "name",
    header: "Name",
    render: (c) => (
      <div className="flex items-center gap-2">
        <span className="font-semibold">{c.name}</span>
        {c.family && <VbBadge color="blue">Family ({c.family.attended}/{c.family.size})</VbBadge>}
      </div>
    ),
  },
  { key: "gender", header: "Gender", render: (c) => c.gender },
  {
    key: "phone",
    header: "Phone",
    render: (c) => (
      <span className="inline-flex items-center gap-1">
        <Phone size={13} color="#38a169" />
        <span className="text-sm">{c.whatsappNumber}</span>
      </span>
    ),
  },
  { key: "college", header: "College/Company", minW: "180px", wrap: true, render: (c) => <span className="text-sm">{c.college}</span> },
  { key: "branch", header: "Branch", render: (c) => c.branch },
  { key: "area", header: "Area", minW: "120px", wrap: true, render: (c) => c.area || "-" },
  {
    key: "email",
    header: "Email",
    render: (c) => (
      <span className="block max-w-[160px] truncate text-sm" title={c.email}>
        {c.email}
      </span>
    ),
  },
  {
    key: "attendance",
    header: "Attendance",
    render: (c) =>
      hasAttended(c) ? (
        <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} color="#38a169" /><VbBadge color="green">Attended</VbBadge></span>
      ) : (
        <span className="inline-flex items-center gap-2"><AlertTriangle size={16} color="#dd6b20" /><VbBadge color="orange">Not Attended</VbBadge></span>
      ),
  },
  { key: "attDate", header: "Attendance Date", render: (c) => formatDateTime(attendedAt(c)) || "-" },
  { key: "regDate", header: "Registration Date", render: (c) => formatDate(c.registrationDate) || "-" },
];

const familyRowClass = (c: any) => (c.family ? "bg-blue-50 border-l-4 border-l-blue-300" : undefined);

const toExcelRow = (row: any, idx: number) => ({
  "S.No": idx + 1,
  Name: row.name,
  Gender: row.gender,
  Email: row.email,
  "College/Company": row.college,
  Branch: row.branch,
  Area: row.area,
  Phone: row.whatsappNumber,
  Attendance: hasAttended(row) ? "Yes" : "No",
  "Attendance Date": formatDateTime(attendedAt(row)),
  "Registration Date": formatDateTime(row.registrationDate),
});

export default function AttendancePage() {
  const { selected, loaded } = useAdminEvent();
  const { data: rawData, loading, error, reload } = useAsyncData<any[]>(
    // Only paid registrations are attendees. Pending and Failed rows are payment attempts (one person can have several),
    // and Refunded ones are no longer coming, so none of them belong in an attendance list.
    async (signal) => (loaded ? (await candidatesApi.list(selected, signal)).filter(isAttendee).sort(byPhoneThenName) : []),
    [],
    [selected, loaded]
  );
  const data = useMemo(() => rawData ?? [], [rawData]);
  const [filters, setFilters] = useState({ college: "", area: "", start: "", end: "", search: "" });
  const search = useDebouncedValue(filters.search);
  const setFilter = (name: keyof typeof filters) => (value: string) => setFilters((prev) => ({ ...prev, [name]: value }));

  const colleges = useMemo(() => uniqueSorted(data.map((c) => c.college)), [data]);
  const areas = useMemo(() => areaOptions(data.map((c) => c.area)), [data]);

  const filtered = useMemo(() => {
    const rows = data.filter((c) => {
      const date = attendedAt(c) || c.registrationDate;
      return (
        (!filters.college || c.college === filters.college) &&
        (!filters.area || areaKey(c.area) === filters.area) &&
        inDateRange(date, filters.start, filters.end) &&
        matchesSearch([c.name, c.email, c.whatsappNumber, c.college, c.branch, c.area], search)
      );
    });
    // One pass to group family members (same WhatsApp number) instead of a scan per row.
    const groups = new Map<string, { size: number; attended: number }>();
    rows.forEach((c) => {
      const g = groups.get(c.whatsappNumber) || { size: 0, attended: 0 };
      g.size += 1;
      if (hasAttended(c)) g.attended += 1;
      groups.set(c.whatsappNumber, g);
    });
    return rows.map((c) => {
      const g = groups.get(c.whatsappNumber)!;
      return g.size > 1 ? { ...c, family: g } : c;
    });
  }, [data, filters.college, filters.area, filters.start, filters.end, search]);

  const attended = useMemo(() => filtered.filter(hasAttended).length, [filtered]);
  const { page, setPage, pageCount, pageItems, offset } = usePagination(filtered, PAGE_SIZE);

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <div>
      <PageHeader title="All Registrations & Attendance" subtitle="Paid registrations only. Family members share a WhatsApp number and are grouped together">
        <EventSwitcher />
        <VbButton
          leftIcon={<Download size={16} />}
          onClick={() => exportToExcel({ rows: filtered.map(toExcelRow), sheetName: "All Registrations", fileName: "all-registrations-attendance.xlsx" })}
          disabled={filtered.length === 0}
        >
          Export to Excel
        </VbButton>
      </PageHeader>

      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch candidates list" />

      <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total registrations" value={filtered.length} icon={Users} />
        <StatCard label="Attended" value={attended} icon={CheckCircle2} color="green" />
        <StatCard
          label="Not attended"
          value={filtered.length - attended}
          icon={Percent}
          color="orange"
          hint={filtered.length ? `${Math.round((attended / filtered.length) * 100)}% turnout` : undefined}
        />
      </div>

      <FilterBar>
        <SelectFilter label="College/Company" placeholder="All" value={filters.college} onChange={setFilter("college")} options={colleges} />
        <SelectFilter label="Area" placeholder="All areas" value={filters.area} onChange={setFilter("area")} options={areas} />
        <InputFilter label="From" type="date" value={filters.start} onChange={setFilter("start")} />
        <InputFilter label="To" type="date" value={filters.end} onChange={setFilter("end")} />
        <InputFilter label="Search" placeholder="Phone number shows the whole family..." value={filters.search} onChange={setFilter("search")} />
      </FilterBar>

      <DataTable columns={columns} rows={pageItems} offset={offset} rowClassName={familyRowClass} emptyText="No registration records found." />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} offset={offset} pageSize={PAGE_SIZE} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Phone, ScanLine } from "lucide-react";
import { attendanceApi } from "@/lib/vanabhojanam/api";
import { useAsyncData, useDebouncedValue, usePagination } from "@/lib/vanabhojanam/hooks";
import { formatDateTime } from "@/lib/vanabhojanam/format";
import { PageSpinner, ErrorNotice, VbBadge } from "../../ui/Feedback";
import { PageHeader, EventSwitcher, StatCard, DataTable, Pagination, FilterBar, InputFilter, SelectFilter, type Column } from "../AdminKit";
import { useAdminEvent } from "../../context/AdminEventContext";
import { inDateRange, matchesSearch, matchesTimeOfDay, uniqueSorted } from "./filters";

const PAGE_SIZE = 50;

const normalise = (record: any) => ({
  ...record,
  phone: record.whatsappNumber || record.phone,
  branch: record.branch || record.course,
});

const columns: Column<any>[] = [
  { key: "idx", header: "#", render: (_, i) => i + 1 },
  { key: "name", header: "Name", render: (c) => <span className="font-semibold">{c.name}</span> },
  { key: "email", header: "Email", render: (c) => <span className="block max-w-[160px] truncate text-sm" title={c.email}>{c.email}</span> },
  { key: "gender", header: "Gender", render: (c) => c.gender || "" },
  {
    key: "phone",
    header: "Phone",
    render: (c) => (
      <span className="inline-flex items-center gap-1 text-sm">
        <Phone size={13} color="#38a169" />
        {c.phone}
      </span>
    ),
  },
  { key: "college", header: "College", wrap: true, minW: "160px", render: (c) => <span className="text-sm">{c.college || ""}</span> },
  { key: "branch", header: "Branch", render: (c) => c.branch || "" },
  { key: "scannedAt", header: "Scanned At", render: (c) => formatDateTime(c.adminAttendanceDate) },
  {
    key: "status",
    header: "Status",
    render: () => (
      <VbBadge color="green">
        <CheckCircle2 size={13} /> Scanned
      </VbBadge>
    ),
  },
];

export default function ScannedListPage() {
  const { selected, loaded } = useAdminEvent();
  const { data, loading, error, reload } = useAsyncData<any[]>(
    async (signal) => (loaded ? (await attendanceApi.listScanned(selected, signal)).map(normalise) : []),
    [],
    [selected, loaded]
  );
  const rows = data ?? [];
  const [filters, setFilters] = useState({ college: "", start: "", end: "", search: "", time: "" });
  const search = useDebouncedValue(filters.search);
  const setFilter = (name: keyof typeof filters) => (value: string) => setFilters((prev) => ({ ...prev, [name]: value }));

  const colleges = useMemo(() => uniqueSorted(rows.map((c) => c.college)), [rows]);
  const filtered = useMemo(
    () =>
      rows.filter(
        (c) =>
          (!filters.college || c.college === filters.college) &&
          inDateRange(c.adminAttendanceDate, filters.start, filters.end) &&
          matchesSearch([c.name, c.email, c.phone, c.college, c.branch], search) &&
          matchesTimeOfDay(c.adminAttendanceDate, filters.time, filters.start)
      ),
    [rows, filters.college, filters.start, filters.end, filters.time, search]
  );
  const { page, setPage, pageCount, pageItems, offset } = usePagination(filtered, PAGE_SIZE);

  if (loading && rows.length === 0) return <PageSpinner minH="60vh" />;

  return (
    <div>
      <PageHeader title="Admin Scanned Attendance List" subtitle="Everyone checked in at the gate">
        <EventSwitcher />
      </PageHeader>

      <div className="mb-4 max-w-[260px]">
        <StatCard label="Total scanned" value={filtered.length} icon={ScanLine} color="green" />
      </div>

      <ErrorNotice error={error} onRetry={reload} fallback="Failed to fetch scanned attendance" />

      <FilterBar>
        <SelectFilter label="College" placeholder="All colleges" value={filters.college} onChange={setFilter("college")} options={colleges} />
        <InputFilter label="From" type="date" value={filters.start} onChange={setFilter("start")} />
        <InputFilter label="To" type="date" value={filters.end} onChange={setFilter("end")} />
        <InputFilter label="Search" placeholder="Name, email, phone, college..." value={filters.search} onChange={setFilter("search")} />
        <SelectFilter
          label="Time of Day"
          placeholder="All"
          value={filters.time}
          onChange={setFilter("time")}
          options={[{ value: "morning", label: "Morning" }, { value: "evening", label: "Evening" }]}
        />
      </FilterBar>

      <DataTable columns={columns} rows={pageItems} offset={offset} emptyText="No scanned attendance records found." />
      <Pagination page={page} pageCount={pageCount} onChange={setPage} total={filtered.length} offset={offset} pageSize={PAGE_SIZE} />
    </div>
  );
}

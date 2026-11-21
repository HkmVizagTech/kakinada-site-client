"use client";

import { ArrowDownRight, ArrowUpRight, CheckCheck, IndianRupee, Percent, Repeat2, Users } from "lucide-react";
import { eventsApi } from "@/lib/vanabhojanam/api";
import { useAsyncData } from "@/lib/vanabhojanam/hooks";
import { formatEventDate } from "@/lib/vanabhojanam/event";
import { formatINR } from "@/lib/vanabhojanam/format";
import { useAdminEvent } from "../../context/AdminEventContext";
import { ErrorNotice, PageSpinner } from "../../ui/Feedback";
import { DataTable, PageHeader, StatCard, type Column } from "../AdminKit";
import CompareBars from "./CompareBars";
import FollowUpPanel from "./FollowUpPanel";

const Delta = ({ now, before, suffix = "" }: { now: number; before?: number; suffix?: string }) => {
  if (before === undefined) return null;
  const diff = now - before;
  const Icon = diff >= 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={`inline-flex items-center gap-1 ${diff >= 0 ? "text-emerald-600" : "text-red-500"}`}>
      <Icon className="h-[13px] w-[13px]" />
      <span>{Math.abs(diff)}{suffix} vs last</span>
    </span>
  );
};

const columns: Column[] = [
  { key: "name", header: "Event", render: (r) => <span className="font-bold">{r.name}</span> },
  { key: "date", header: "Date", render: (r) => formatEventDate(r.date) },
  { key: "paid", header: "Paid", render: (r) => r.paid },
  { key: "mix", header: "Students / others", render: (r) => `${r.students} / ${r.others}` },
  { key: "attended", header: "Attended", render: (r) => r.attended },
  { key: "rate", header: "Turnout", render: (r) => `${r.attendanceRate}%` },
  { key: "returning", header: "Returning", render: (r) => r.returning },
  { key: "revenue", header: "Revenue", render: (r) => formatINR(r.revenue) },
];

const card = "rounded-2xl border border-black/10 bg-white";

export default function InsightsPage() {
  const { data: result, loading, error, reload } = useAsyncData<any[]>((signal) => eventsApi.analytics(signal), []);
  const data = result || [];
  const { events } = useAdminEvent();

  if (loading && data.length === 0) return <PageSpinner minH="60vh" />;

  const latest = data[data.length - 1];
  const before = data[data.length - 2];

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Insights" subtitle="How each Vanabhojanam compares, and who to invite back next year" />
      <ErrorNotice error={error} onRetry={reload} />

      {data.length === 0 ? (
        <div className={`${card} p-10 text-center`}>
          <h2 className="text-lg font-bold">Nothing to compare yet</h2>
          <p className="mt-2 text-gray-600">Create an event under Events and the numbers appear here as people register.</p>
        </div>
      ) : (
        <>
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-gray-600">{latest.name}</h2>
          <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-5">
            <StatCard label="Registered" value={latest.paid} icon={Users} hint={<Delta now={latest.paid} before={before?.paid} />} />
            <StatCard label="Attended" value={latest.attended} icon={CheckCheck} color="yellow" hint={<Delta now={latest.attended} before={before?.attended} />} />
            <StatCard label="Turnout" value={latest.attendanceRate} icon={Percent} color="purple" format={(n) => `${Math.round(n)}%`} />
            <StatCard label="Revenue" value={latest.revenue} icon={IndianRupee} color="green" format={(n) => formatINR(n)} />
            <StatCard label="Returning" value={latest.returning} icon={Repeat2} color="orange" hint="Also came to an earlier one" />
          </div>

          <h2 className="mb-3 text-lg font-bold">Year by year</h2>
          <div className={`${card} mb-4 p-4 md:p-6`}>
            <CompareBars rows={data} />
          </div>
          <div className="mb-10">
            <DataTable columns={columns} rows={[...data].reverse()} rowKey="id" emptyText="No events" />
          </div>
        </>
      )}

      <h2 className="mb-1 text-lg font-bold">Follow up</h2>
      <p className="mb-3 text-sm text-gray-600">
        Find the people who came before but have not registered for the new event yet. Family members who share a WhatsApp number are one row.
      </p>
      {events.length >= 2 ? (
        <FollowUpPanel events={events} />
      ) : (
        <div className={`${card} p-6`}>
          <p className="text-gray-600">You need at least two events to follow up. Create next year&apos;s event under Events, and this fills in.</p>
        </div>
      )}
    </div>
  );
}

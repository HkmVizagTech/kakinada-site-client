"use client";

/** Plain-CSS grouped bars: registered (paid) vs attended for every edition. */
export default function CompareBars({ rows }: { rows: any[] }) {
  const max = Math.max(1, ...rows.map((r) => r.paid));
  const series: [string, string][] = [
    ["paid", "bg-vb-brand-500"],
    ["attended", "bg-vb-brass-400"],
  ];
  return (
    <div>
      <div className="mb-4 flex gap-5 text-sm">
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-vb-brand-500" />Registered (paid)</span>
        <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-vb-brass-400" />Attended</span>
      </div>
      <div className="flex min-h-[220px] items-end gap-4 overflow-x-auto pb-1 md:gap-8">
        {rows.map((r) => (
          <div key={r.id} className="min-w-[86px] flex-1 text-center">
            <div className="flex h-[180px] items-end justify-center gap-2">
              {series.map(([key, color]) => (
                <div key={key} className="flex h-full w-[34px] flex-col items-center justify-end">
                  <span className="mb-1 text-xs font-bold">{r[key]}</span>
                  <div className={`w-full rounded-t-md transition-[height] duration-[600ms] ease-in-out ${color}`} style={{ height: `${Math.max(3, (r[key] / max) * 100)}%` }} />
                </div>
              ))}
            </div>
            <p className="mt-2 line-clamp-2 text-sm font-bold">{r.name}</p>
            <p className="text-xs text-gray-600">{r.attendanceRate}% came</p>
          </div>
        ))}
      </div>
    </div>
  );
}

"use client";

import { memo, useEffect, useRef, type ComponentType, type ReactNode } from "react";
import { animate, useReducedMotion } from "framer-motion";
import { CalendarRange, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { EmptyState } from "../ui/Feedback";
import { VbButton } from "../ui/Button";
import { VbSelect, VbInput } from "../ui/Fields";
import { useAdminEvent } from "../context/AdminEventContext";

// ───────────────────────── PageHeader ─────────────────────────

export function PageHeader({ title, subtitle, children }: { title: ReactNode; subtitle?: ReactNode; children?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h1 className="font-vb-heading text-3xl font-semibold leading-[1.1] text-vb-brand-700 md:text-4xl">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
      </div>
      {/* Header actions: on a phone they sit two to a row (the event switcher, first, takes a full row). */}
      <div className="flex w-full flex-wrap gap-2 md:w-auto [&>*]:min-w-0 [&>*]:flex-[1_1_calc(50%-4px)] md:[&>*]:flex-none [&>*:first-child]:flex-[1_1_100%] md:[&>*:first-child]:flex-none">
        {children}
      </div>
    </div>
  );
}

// ───────────────────────── EventSwitcher ─────────────────────────

/** "Which year am I looking at?" Remembered between visits and shared by every admin list. */
export function EventSwitcher() {
  const { events, selected, setSelected, loaded } = useAdminEvent();
  return (
    <div className="flex h-10 items-center gap-2 rounded-xl border border-black/10 bg-white pl-3 pr-1" aria-label="Event">
      <CalendarRange className="h-4 w-4 shrink-0" />
      <span className="hidden text-sm text-gray-600 sm:block">Event</span>
      <VbSelect
        inputSize="sm"
        className="h-8 w-auto min-w-[150px] border-0 bg-transparent font-bold focus:ring-0"
        value={selected}
        disabled={!loaded}
        onChange={(e) => setSelected(e.target.value)}
        aria-label="Choose event"
      >
        <option value="all">All events</option>
        {events.map((e) => (
          <option key={e._id} value={e._id}>
            {e.name}
            {e.isCurrent ? " (current)" : ""}
          </option>
        ))}
      </VbSelect>
    </div>
  );
}

// ───────────────────────── FilterBar ─────────────────────────

export const FilterBar = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className="mb-4 rounded-xl border border-black/10 bg-white p-3">
    <div className={cn("grid grid-cols-1 items-end gap-3 sm:grid-cols-2 lg:grid-cols-5", className)}>{children}</div>
  </div>
);

export const SelectFilter = ({
  label, placeholder, value, onChange, options,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  options: (string | { value: string; label: string })[];
}) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-vb-brand-700">{label}</label>
    <VbSelect inputSize="sm" value={value} onChange={(e) => onChange(e.target.value)}>
      {placeholder !== undefined && <option value="">{placeholder}</option>}
      {options.map((o) => {
        const opt = typeof o === "string" ? { value: o, label: o } : o;
        return (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        );
      })}
    </VbSelect>
  </div>
);

export const InputFilter = ({ label, value, onChange, ...rest }: { label: string; value: string; onChange: (value: string) => void } & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) => (
  <div>
    <label className="mb-1 block text-xs font-semibold text-vb-brand-700">{label}</label>
    <VbInput inputSize="sm" value={value} onChange={(e) => onChange(e.target.value)} {...rest} />
  </div>
);

// ───────────────────────── DataTable ─────────────────────────

export interface Column<T = any> {
  key: string;
  header: ReactNode;
  render: (row: T, index: number) => ReactNode;
  minW?: string | number;
  wrap?: boolean;
}

const Row = memo(function Row({ row, index, columns, onRowClick, rowClassName }: { row: any; index: number; columns: Column[]; onRowClick?: (row: any) => void; rowClassName?: (row: any) => string | undefined }) {
  return (
    <tr
      className={cn("border-t border-black/5 hover:bg-black/[0.03]", onRowClick && "cursor-pointer", rowClassName?.(row))}
      onClick={onRowClick ? () => onRowClick(row) : undefined}
    >
      {columns.map((col) => (
        <td key={col.key} className={cn("px-3 py-2.5 align-middle text-sm", col.wrap ? "whitespace-normal" : "whitespace-nowrap")} style={col.minW ? { minWidth: col.minW } : undefined}>
          {col.render(row, index)}
        </td>
      ))}
    </tr>
  );
});

/**
 * Column-driven table.
 * columns: [{ key, header, render(row, index), minW?, wrap? }]. Rows are memoised, so keep
 * `columns`, `onRowClick` and `rowClassName` referentially stable (module constants or useCallback).
 */
export function DataTable<T = any>({
  columns, rows, rowKey = "_id", offset = 0, onRowClick, rowClassName, emptyText,
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey?: string;
  offset?: number;
  onRowClick?: (row: T) => void;
  rowClassName?: (row: T) => string | undefined;
  emptyText?: ReactNode;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-black/10 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.04)]">
      <table className="w-full border-collapse text-left">
        <thead className="sticky top-0 z-[1] bg-black/[0.04]">
          <tr>
            {columns.map((col) => (
              <th key={col.key} className="whitespace-nowrap px-3 py-3 text-xs font-bold uppercase tracking-wider text-gray-600">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row: any, i) => (
            <Row key={row[rowKey]} row={row} index={offset + i} columns={columns as Column[]} onRowClick={onRowClick as any} rowClassName={rowClassName as any} />
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={columns.length}>{typeof emptyText === "string" ? <EmptyState title={emptyText} /> : emptyText}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ───────────────────────── Pagination ─────────────────────────

export function Pagination({ page, pageCount, onChange, total, offset, pageSize }: { page: number; pageCount: number; onChange: (page: number) => void; total: number; offset: number; pageSize: number }) {
  if (total === 0) return null;
  const from = offset + 1;
  const to = Math.min(offset + pageSize, total);
  return (
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3 px-1">
      <p className="text-sm text-gray-600">
        Showing {from}–{to} of {total}
      </p>
      <div className="flex items-center gap-2">
        <VbButton size="sm" variant="outline" aria-label="Previous page" onClick={() => onChange(page - 1)} disabled={page <= 1} className="w-9 px-0">
          <ChevronLeft className="h-4 w-4" />
        </VbButton>
        <span className="min-w-[72px] text-center text-sm">
          {page} / {pageCount}
        </span>
        <VbButton size="sm" variant="outline" aria-label="Next page" onClick={() => onChange(page + 1)} disabled={page >= pageCount} className="w-9 px-0">
          <ChevronRight className="h-4 w-4" />
        </VbButton>
      </div>
    </div>
  );
}

// ───────────────────────── StatCard / CountUp ─────────────────────────

/** Animates a number from its previous value to `value`. */
export function CountUp({ value, format = (n: number) => Math.round(n).toLocaleString("en-IN") }: { value: number; format?: (n: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const last = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduced) {
      node.textContent = format(value);
      last.current = value;
      return;
    }
    const controls = animate(last.current, value, {
      duration: 1.1,
      ease: "easeOut",
      onUpdate: (n) => {
        node.textContent = format(n);
      },
      onComplete: () => {
        last.current = value;
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, reduced]);

  return <span ref={ref}>{format(0)}</span>;
}

const statColor: Record<string, { tile: string; ring: string }> = {
  brand: { tile: "bg-vb-brand-600", ring: "border-vb-brand-500" },
  green: { tile: "bg-emerald-600", ring: "border-emerald-500" },
  orange: { tile: "bg-orange-500", ring: "border-orange-500" },
  red: { tile: "bg-red-600", ring: "border-red-500" },
  blue: { tile: "bg-sky-600", ring: "border-sky-500" },
  purple: { tile: "bg-violet-600", ring: "border-violet-500" },
  teal: { tile: "bg-teal-600", ring: "border-teal-500" },
  yellow: { tile: "bg-amber-500", ring: "border-amber-500" },
  gray: { tile: "bg-gray-600", ring: "border-gray-500" },
};

/** One headline number with an icon tile. `hint` is small supporting text. Pass `onClick` to make the card a button (`active` marks it selected). */
export function StatCard({
  label, value, icon: Icon, color = "brand", format, hint, onClick, active,
}: {
  label: ReactNode;
  value: number;
  icon?: ComponentType<{ className?: string }>;
  color?: string;
  format?: (n: number) => string;
  hint?: ReactNode;
  onClick?: () => void;
  active?: boolean;
}) {
  const c = statColor[color] || statColor.brand;
  const clickable = Boolean(onClick);
  const Tag: any = clickable ? "button" : "div";
  return (
    <Tag
      type={clickable ? "button" : undefined}
      onClick={onClick}
      aria-pressed={clickable ? Boolean(active) : undefined}
      className={cn(
        "flex flex-col items-start gap-2.5 rounded-2xl border bg-white p-4 text-left shadow-[0_1px_2px_rgba(16,24,40,0.04)] transition-shadow hover:shadow-vb-lift sm:flex-row sm:gap-3.5",
        active ? c.ring : "border-black/10",
        clickable && "cursor-pointer"
      )}
    >
      {Icon && (
        <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white sm:h-11 sm:w-11", c.tile)}>
          <Icon className="h-5 w-5" />
        </div>
      )}
      <div className="min-w-0">
        <p className="line-clamp-2 text-[10px] font-bold uppercase tracking-[0.04em] text-gray-500 md:text-xs md:tracking-[0.08em]">{label}</p>
        <p className="mt-0.5 text-2xl font-extrabold leading-[1.15]">
          <CountUp value={value} format={format} />
        </p>
        {hint && <p className="mt-0.5 text-xs text-gray-500">{hint}</p>}
      </div>
    </Tag>
  );
}

// ───────────────────────── StatusChips ─────────────────────────

const chipActive: Record<string, string> = {
  gray: "bg-gray-600 border-gray-600",
  green: "bg-emerald-600 border-emerald-600",
  orange: "bg-orange-500 border-orange-500",
  red: "bg-red-600 border-red-600",
  blue: "bg-sky-600 border-sky-600",
  purple: "bg-violet-600 border-violet-600",
  teal: "bg-teal-600 border-teal-600",
  yellow: "bg-amber-500 border-amber-500",
  brand: "bg-vb-brand-600 border-vb-brand-600",
};

/**
 * Clickable filter pills with live counts, e.g. All 120 | Paid 98 | Pending 12.
 * options: [{ value, label, count, color, amount? }]; `amount` is an optional pre-formatted rupee total.
 */
export function StatusChips({ options, value, onChange }: { options: { value: string; label: string; count: number; color?: string; amount?: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value || "all"}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={active}
            className={cn(
              "flex h-[34px] items-center gap-2 rounded-full border px-3 text-sm font-bold transition-all",
              active ? cn("text-white", chipActive[o.color || "gray"]) : "border-black/10 bg-white hover:border-gray-400"
            )}
          >
            <span>{o.label}</span>
            <span className={cn("rounded-full px-2 text-xs", active ? "bg-white/25" : "bg-black/5")}>{o.count}</span>
            {o.amount && <span className={cn("text-xs font-semibold", active ? "opacity-95" : "opacity-75")}>{o.amount}</span>}
          </button>
        );
      })}
    </div>
  );
}

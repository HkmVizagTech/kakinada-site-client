"use client";

import type { ComponentType, ReactNode } from "react";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, Inbox, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { VbButton } from "./Button";

export type VbColor = "green" | "orange" | "red" | "blue" | "gray" | "purple" | "yellow" | "teal" | "brand";

const badgeClass: Record<VbColor, string> = {
  green: "bg-emerald-100 text-emerald-800",
  orange: "bg-orange-100 text-orange-800",
  red: "bg-red-100 text-red-700",
  blue: "bg-sky-100 text-sky-800",
  gray: "bg-gray-100 text-gray-700",
  purple: "bg-violet-100 text-violet-800",
  yellow: "bg-amber-100 text-amber-800",
  teal: "bg-teal-100 text-teal-800",
  brand: "bg-vb-brand-100 text-vb-brand-700",
};

export function VbBadge({ color = "gray", children, className }: { color?: VbColor; children: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide", badgeClass[color], className)}>
      {children}
    </span>
  );
}

const alertStyles = {
  info: { box: "border-sky-200 bg-sky-50 text-sky-900", Icon: Info },
  success: { box: "border-emerald-200 bg-emerald-50 text-emerald-900", Icon: CheckCircle2 },
  warning: { box: "border-amber-200 bg-amber-50 text-amber-900", Icon: AlertTriangle },
  error: { box: "border-red-200 bg-red-50 text-red-900", Icon: AlertCircle },
} as const;

export function VbAlert({ status = "info", title, children, className }: { status?: keyof typeof alertStyles; title?: ReactNode; children?: ReactNode; className?: string }) {
  const { box, Icon } = alertStyles[status];
  return (
    <div role="alert" className={cn("flex items-start gap-3 rounded-lg border px-3.5 py-3 text-sm", box, className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 flex-1">
        {title && <p className="font-bold">{title}</p>}
        {children && <div className={title ? "mt-0.5" : undefined}>{children}</div>}
      </div>
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn("h-8 w-8 animate-spin text-vb-brand-500", className)} aria-hidden="true" />;
}

export function PageSpinner({ label, minH = "100vh" }: { label?: string; minH?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-3" style={{ minHeight: minH }}>
      <Spinner className="h-12 w-12" />
      {label && <p className="text-gray-600">{label}</p>}
    </div>
  );
}

/** Friendly "nothing here yet" block with an optional next step. */
export function EmptyState({ icon: IconCmp = Inbox, title, text, action }: { icon?: ComponentType<{ className?: string }>; title: ReactNode; text?: ReactNode; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-10 text-center md:py-14">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-vb-brand-50 text-vb-brand-600">
        <IconCmp className="h-6 w-6" />
      </div>
      <p className="mt-1 text-lg font-bold">{title}</p>
      {text && <p className="max-w-md text-sm text-gray-600">{text}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export function ErrorNotice({ error, onRetry, fallback = "Could not load data." }: { error: unknown; onRetry?: () => void; fallback?: string }) {
  if (!error) return null;
  return (
    <div role="alert" className="mb-4 flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-900">
      <AlertCircle className="h-4 w-4 shrink-0" />
      <span className="flex-1">{getErrorMessage(error, fallback)}</span>
      {onRetry && (
        <VbButton size="xs" variant="dangerOutline" onClick={onRetry}>
          Retry
        </VbButton>
      )}
    </div>
  );
}

/** White rounded card used across the console. */
export function VbCard({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-black/10 bg-white shadow-vb-soft", className)}>{children}</div>;
}

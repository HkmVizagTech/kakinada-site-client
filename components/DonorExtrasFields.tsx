"use client";

import { useState } from "react";
import { User, Calendar } from "lucide-react";

interface Props {
  sevakName: string;
  dob: string;
  onSevakNameChange: (v: string) => void;
  onDobChange: (v: string) => void;
  variant?: "default" | "amber";
  // Opt-in only. When true, the Sevak Name + DOB inputs are hidden behind a
  // "This donation is in the memory/honor of someone..." checkbox instead of
  // always showing — many donors don't have this info and the extra fields
  // were adding friction. Defaults to false so any existing caller that
  // doesn't pass this prop keeps its exact current behavior unchanged.
  collapsible?: boolean;
}

export default function DonorExtrasFields({
  sevakName,
  dob,
  onSevakNameChange,
  onDobChange,
  variant = "default",
  collapsible = false,
}: Props) {
  const [expanded, setExpanded] = useState(!collapsible || Boolean(sevakName || dob));
  const isAmber = variant === "amber";

  const wrapperCls = isAmber
    ? "relative flex items-center rounded-lg border border-amber-300 bg-white/90 shadow-sm focus-within:border-amber-500 transition-colors"
    : "relative flex items-center rounded-lg border border-border bg-white dark:bg-card focus-within:border-gold transition-colors";
  const labelCls = isAmber
    ? "mb-1 block text-[11px] font-semibold text-amber-900"
    : "mb-1 block text-[11px] font-medium text-muted-foreground";
  const iconCls = isAmber
    ? "pointer-events-none absolute left-3 h-4 w-4 text-amber-600/60"
    : "pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground";
  const inputCls = isAmber
    ? "h-10 w-full bg-transparent pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-amber-800/50"
    : "h-10 w-full bg-transparent pl-9 pr-3 text-sm text-foreground outline-none placeholder:text-muted-foreground";
  const checkboxLabelCls = isAmber
    ? "flex cursor-pointer items-start gap-2.5 text-sm text-amber-900"
    : "flex cursor-pointer items-start gap-2.5 text-sm text-foreground";

  const fields = (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className={labelCls}>
          Sevak Name <span className="font-normal">(optional)</span>
        </label>
        <div className={wrapperCls}>
          <User className={iconCls} />
          <input
            type="text"
            placeholder="Name for seva dedication"
            value={sevakName}
            onChange={(e) => onSevakNameChange(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>
          Date of Birth <span className="font-normal">(optional)</span>
        </label>
        <div className={wrapperCls}>
          <Calendar className={iconCls} />
          <input
            type="date"
            value={dob}
            onChange={(e) => onDobChange(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>
    </div>
  );

  if (!collapsible) return fields;

  return (
    <div className="space-y-3">
      <label className={checkboxLabelCls}>
        <input
          type="checkbox"
          checked={expanded}
          onChange={(e) => {
            const checked = e.target.checked;
            setExpanded(checked);
            if (!checked) {
              // Clear so an unchecked box never silently submits stale values.
              onSevakNameChange("");
              onDobChange("");
            }
          }}
          className="mt-0.5 h-4 w-4 shrink-0 rounded border-border text-primary focus:ring-primary"
        />
        <span>This Donation is in the memory/honor of someone or performed on a specific occasion</span>
      </label>
      {expanded && fields}
    </div>
  );
}

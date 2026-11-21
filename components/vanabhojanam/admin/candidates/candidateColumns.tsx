"use client";

import type { MouseEvent } from "react";
import { AlertTriangle, CheckCircle2, Phone } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDateIST, formatTimeIST } from "@/lib/vanabhojanam/format";
import { VbBadge } from "../../ui/Feedback";
import { VbButton } from "../../ui/Button";
import type { Column } from "../AdminKit";
import { ADMIN_ACTION_COLORS, PAYMENT_COLORS } from "./constants";
import { needsApproval } from "./needsApproval";

const openInNewTab = (url: string) => (e: MouseEvent) => {
  e.stopPropagation();
  window.open(url, "_blank", "noopener");
};

function IdCardCell({ candidate }: { candidate: any }) {
  if (candidate.studentIdCardUrl) {
    return (
      <div className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={candidate.studentIdCardUrl}
          alt="Student ID Card"
          loading="lazy"
          className="h-[60px] w-[60px] cursor-pointer rounded-md border border-black/10 object-cover"
          onClick={openInNewTab(candidate.studentIdCardUrl)}
        />
        <VbButton size="xs" variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50" onClick={openInNewTab(candidate.studentIdCardUrl)}>
          View Full
        </VbButton>
      </div>
    );
  }
  const missing = candidate.collegeOrWorking === "College";
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className={cn(
          "grid h-[60px] w-[60px] place-items-center rounded-md",
          missing ? "border-2 border-dashed border-red-200 bg-red-50" : "border border-black/10 bg-black/5"
        )}
      >
        {missing ? <AlertTriangle size={18} color="#f56565" /> : <span className="text-xs text-gray-600">N/A</span>}
      </div>
      <span className={cn("text-xs", missing ? "text-red-500" : "text-gray-600")}>{missing ? "No ID Card" : "Working Prof."}</span>
    </div>
  );
}

/** Greys out a row whose accept / reject / refund is still being finished on the server (module-level so rows stay memoised). */
export const candidateRowClass = (row: any) => (row._busy ? "pointer-events-none opacity-[0.45] grayscale" : undefined);

/** Module-level so DataTable's memoised rows keep a stable reference. */
export const candidateColumns: Column<any>[] = [
  { key: "idx", header: "#", render: (_, i) => i + 1 },
  {
    key: "name",
    header: "Name",
    render: (c) => (
      <div>
        <p className="font-semibold">{c.name}</p>
        <p className="text-xs text-gray-600">{c.serialNo || "-"}</p>
      </div>
    ),
  },
  { key: "gender", header: "Gender", render: (c) => c.gender },
  {
    key: "phone",
    header: "Phone",
    render: (c) => (
      <span className="inline-flex items-center gap-1" title={c.whatsappNumber}>
        <Phone size={13} color="#38a169" />
        <span className="text-sm">{c.whatsappNumber}</span>
      </span>
    ),
  },
  {
    key: "college",
    header: "College/Company",
    minW: "180px",
    wrap: true,
    render: (c) => <span className="text-sm">{c.college || <span className="text-sky-600">{c.companyName || "-"}</span>}</span>,
  },
  { key: "area", header: "Area", minW: "120px", wrap: true, render: (c) => c.area || "-" },
  { key: "course", header: "Course", render: (c) => c.course || "-" },
  { key: "year", header: "Year", render: (c) => c.year || "-" },
  { key: "idcard", header: "ID Card", render: (c) => <IdCardCell candidate={c} /> },
  {
    key: "reg",
    header: "Registered",
    render: (c) =>
      c.registrationDate ? (
        <div className="leading-[1.3]">
          <p className="text-sm">{formatDateIST(c.registrationDate)}</p>
          <p className="text-xs text-gray-600">{formatTimeIST(c.registrationDate)}</p>
        </div>
      ) : (
        "N/A"
      ),
  },
  {
    key: "payment",
    header: "Payment",
    render: (c) => <VbBadge color={PAYMENT_COLORS[c.paymentStatus] || "gray"}>{c.paymentStatus}</VbBadge>,
  },
  {
    key: "method",
    header: "Method",
    render: (c) => <VbBadge color={c.paymentMethod ? "orange" : "gray"}>{c.paymentMethod || "-"}</VbBadge>,
  },
  {
    key: "source",
    header: "Source",
    render: (c) => (
      <span className="block max-w-[120px] truncate text-sm" title={c.howDidYouKnow || "Not specified"}>
        {c.howDidYouKnow || <span className="text-gray-600">-</span>}
      </span>
    ),
  },
  {
    key: "attendance",
    header: "Attendance",
    render: (c) => (c.attendance ? <CheckCircle2 size={18} color="#48bb78" /> : <AlertTriangle size={18} color="#a0aec0" />),
  },
  {
    key: "action",
    header: "Admin Action",
    render: (c) =>
      c.adminAction ? (
        <VbBadge color={ADMIN_ACTION_COLORS[c.adminAction] || "gray"} className="bg-opacity-100">
          {c.adminAction}
        </VbBadge>
      ) : (
        <VbBadge color="gray" className="border border-gray-300 bg-transparent">
          {needsApproval(c) ? "Pending" : "Not needed"}
        </VbBadge>
      ),
  },
];

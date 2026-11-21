"use client";

import type { ComponentType, ReactNode } from "react";
import { AlertTriangle, CalendarDays, Check, CheckCircle2, Eye, Mail, Phone, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { formatDate, formatDateTime, formatDateTimeIST, formatINR } from "@/lib/vanabhojanam/format";
import { VbBadge } from "../../ui/Feedback";
import { VbButton } from "../../ui/Button";
import { ADMIN_ACTION_COLORS, PAYMENT_COLORS, type CandidateAction } from "./constants";
import { needsApproval } from "./needsApproval";
import QrSection from "./QrSection";

const Stat = ({ icon: Icon, color, label, children }: { icon?: ComponentType<{ className?: string }>; color?: string; label: string; children: ReactNode }) => (
  <div className="rounded-lg border border-black/10 bg-black/5 p-4">
    <div className="flex items-center gap-3">
      {Icon && <Icon className={`h-5 w-5 shrink-0 ${color}`} />}
      <div className="min-w-0">
        <p className="text-sm text-gray-600">{label}</p>
        <p className="truncate text-sm font-semibold">{children}</p>
      </div>
    </div>
  </div>
);

const Pair = ({ label, children }: { label: string; children: ReactNode }) => (
  <div className="flex items-start gap-2">
    <span className="min-w-[80px] text-sm text-gray-600">{label}</span>
    <div className="text-sm font-medium">{children}</div>
  </div>
);

const Heading = ({ children, className = "mb-4" }: { children: ReactNode; className?: string }) => <h3 className={`${className} text-lg font-semibold`}>{children}</h3>;

const initials = (name?: string) =>
  String(name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

interface Props {
  candidate: any | null;
  isOpen: boolean;
  onClose: () => void;
  onAction: (action: CandidateAction, id: string) => void;
  busy?: boolean;
  readOnly?: boolean;
}

export default function CandidateDetailModal({ candidate, isOpen, onClose, onAction, busy, readOnly }: Props) {
  if (!candidate) return null;
  const c = candidate;
  const isCollege = c.collegeOrWorking === "College";
  const isPaid = c.paymentStatus === "Paid";
  // Accept / Reject is only for a student whose ID photo is still to be checked; refunds only for online payments.
  const canDecide = !readOnly && isPaid && needsApproval(c) && !c.adminAction;
  const canRefund = !readOnly && isPaid && c.paymentMethod !== "Cash";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="flex max-h-[90vh] w-[calc(100%-2rem)] max-w-4xl flex-col gap-0 overflow-hidden rounded-2xl bg-white p-0 text-gray-900 [&>button.absolute]:text-white [&>button.absolute]:opacity-90">
        <div className="bg-vb-brand-700 px-6 py-4 text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white font-bold text-vb-brand-600">{initials(c.name)}</div>
            <div>
              <DialogTitle className="text-xl font-bold leading-tight">{c.name}</DialogTitle>
              <DialogDescription className="text-sm text-white/90">Registration Details</DialogDescription>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col gap-6">
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Payment Information</h3>
                <VbBadge color={PAYMENT_COLORS[c.paymentStatus] || "gray"} className="px-3 py-1 text-xs">{c.paymentStatus}</VbBadge>
              </div>
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(220px,1fr))]">
                <Stat icon={RotateCcw} color="text-green-500" label="Payment Amount">
                  {c.paymentAmount ? formatINR(c.paymentAmount) : "N/A"}
                </Stat>
                <Stat icon={Eye} color="text-blue-500" label="Order ID">{c.orderId || "N/A"}</Stat>
                <Stat icon={CalendarDays} color="text-purple-500" label="Payment Date">{formatDateTimeIST(c.paymentDate) || "N/A"}</Stat>
                <Stat label="Method">{c.paymentMethod || "N/A"}</Stat>
              </div>
            </div>

            <hr className="border-black/10" />

            <div>
              <Heading>Personal Information</Heading>
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2"><Mail className="h-4 w-4 text-teal-500" /><span className="text-sm font-medium">{c.email}</span></div>
                  <div className="flex items-center gap-2"><Phone className="h-4 w-4 text-green-500" /><span className="text-sm font-medium">{c.whatsappNumber}</span></div>
                  <Pair label="Gender:"><VbBadge color="purple">{c.gender}</VbBadge></Pair>
                  <Pair label="Area:">{c.area || "N/A"}</Pair>
                  <Pair label="DOB:">{formatDate(c.dob) || "N/A"}</Pair>
                  {c.howDidYouKnow && <Pair label="Source:"><VbBadge color="teal" className="border border-teal-600 bg-transparent">{c.howDidYouKnow}</VbBadge></Pair>}
                </div>
                <div className="flex flex-col gap-3">
                  <Pair label="Type:"><VbBadge color="blue">{c.collegeOrWorking}</VbBadge></Pair>
                  {isCollege ? (
                    <>
                      <Pair label="College:">{c.college || "N/A"}</Pair>
                      <Pair label="Course:">{c.course || "N/A"}</Pair>
                      <Pair label="Year:">{c.year || "N/A"}</Pair>
                    </>
                  ) : (
                    <Pair label="Company:">{c.companyName || "N/A"}</Pair>
                  )}
                </div>
              </div>
            </div>

            {isCollege && (
              <>
                <hr className="border-black/10" />
                <div>
                  <Heading>Student ID Card</Heading>
                  {c.studentIdCardUrl ? (
                    <div className="flex flex-col items-center gap-4">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.studentIdCardUrl} alt="Student ID Card" className="max-h-[300px] max-w-full rounded-lg border-2 border-black/10 object-contain shadow-md sm:max-w-[400px]" />
                      <VbButton variant="outline" className="border-sky-300 text-sky-700 hover:bg-sky-50" leftIcon={<Eye size={16} />} onClick={() => window.open(c.studentIdCardUrl, "_blank", "noopener")}>
                        View Full Size
                      </VbButton>
                    </div>
                  ) : (
                    <div className="rounded-lg border-2 border-dashed border-red-200 bg-red-50 p-8 text-center">
                      <AlertTriangle className="mx-auto mb-2 h-8 w-8 text-red-400" />
                      <p className="font-medium text-red-600">No ID Card Uploaded</p>
                      <p className="text-sm text-red-500">Student verification may be required</p>
                    </div>
                  )}
                </div>
              </>
            )}

            <hr className="border-black/10" />
            {!readOnly && <QrSection candidate={c} />}

            <hr className="border-black/10" />
            <div>
              <Heading>Registration Details</Heading>
              <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(190px,1fr))]">
                <div><p className="text-sm text-gray-600">Registration Date</p><p className="text-sm font-medium">{formatDateTimeIST(c.registrationDate) || "N/A"}</p></div>
                <div><p className="text-sm text-gray-600">Serial Number</p><p className="text-sm font-medium">{c.serialNo || "N/A"}</p></div>
                <div>
                  <p className="text-sm text-gray-600">Attendance</p>
                  <div className="flex items-center gap-2">
                    {c.attendance ? <CheckCircle2 size={16} color="#38a169" /> : <AlertTriangle size={16} color="#ed8936" />}
                    <span className={`text-sm font-medium ${c.attendance ? "text-green-600" : "text-orange-600"}`}>{c.attendance ? "Present" : "Not Marked"}</span>
                  </div>
                </div>
                <div><p className="text-sm text-gray-600">Receipt</p><p className="text-sm font-medium">{c.receipt || "N/A"}</p></div>
                <div>
                  <p className="text-sm text-gray-600">Admin Action</p>
                  {c.adminAction ? (
                    <VbBadge color={ADMIN_ACTION_COLORS[c.adminAction] || "gray"}>{c.adminAction}</VbBadge>
                  ) : (
                    <VbBadge color="gray" className="border border-gray-300 bg-transparent">{needsApproval(c) ? "Pending" : "Not needed"}</VbBadge>
                  )}
                  {c.adminActionDate && <p className="mt-1 text-xs text-gray-600">{formatDateTime(c.adminActionDate)}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 bg-black/5 p-4">
          {canDecide && (
            <>
              <VbButton variant="success" leftIcon={<Check size={16} />} onClick={() => onAction("accept", c._id)} loading={busy}>Accept</VbButton>
              <VbButton variant="danger" leftIcon={<X size={16} />} onClick={() => onAction("reject", c._id)} loading={busy}>Reject</VbButton>
            </>
          )}
          {canRefund && (
            <VbButton className="bg-orange-500 text-white hover:bg-orange-600" leftIcon={<RotateCcw size={16} />} onClick={() => onAction("refund", c._id)} loading={busy}>Refund</VbButton>
          )}
          <VbButton variant="ghost" onClick={onClose}>Close</VbButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}

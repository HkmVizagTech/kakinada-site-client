import type { VbColor } from "../../ui/Feedback";

export const PAYMENT_COLORS: Record<string, VbColor> = { Paid: "green", Pending: "yellow", Failed: "red", Refunded: "orange" };
export const ADMIN_ACTION_COLORS: Record<string, VbColor> = { Accepted: "green", Rejected: "red", Refunded: "orange" };
export const PAYMENT_STATUSES = ["Paid", "Pending", "Failed", "Refunded"];

export type CandidateAction = "accept" | "reject" | "refund";

export const ACTION_COPY: Record<CandidateAction, { tone: "danger" | "success"; done: string; target: string; note: string }> = {
  accept: {
    tone: "success",
    done: "Candidate accepted and WhatsApp notification sent!",
    target: "this candidate's registration",
    note: "A WhatsApp acceptance message will be sent to the candidate.",
  },
  reject: {
    tone: "danger",
    done: "Candidate rejected and WhatsApp notification sent!",
    target: "this candidate's registration",
    note: "A WhatsApp rejection message will be sent, and an online payment is refunded automatically. This cannot be undone.",
  },
  refund: {
    tone: "danger",
    done: "Refund processed successfully!",
    target: "this candidate's payment",
    note: "💰 The payment will be refunded through Razorpay. This action cannot be undone.",
  },
};

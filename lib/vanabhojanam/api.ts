/* eslint-disable @typescript-eslint/no-explicit-any */
// One typed-ish client for every Vanabhojanam endpoint. Records come back with both `id` and `_id`.
import { http, unwrapList } from "./http";

type Sig = AbortSignal | undefined;
const q = (event?: string) => (event ? { event } : {});

export const authApi = {
  login: (credentials: { email: string; password: string }) =>
    http.post("/auth/login", credentials, { skipAuthRedirect: true }).then((r) => r.data),
  /** Who am I (staff, admin or devotee). Used to verify a stored token. */
  me: () => http.get("/auth/me", { skipAuthRedirect: true }).then((r) => r.data),
  listUsers: (signal?: Sig) => http.get("/staff", { signal }).then((r) => r.data.user as any[]),
  createUser: (payload: { name: string; email: string; password: string; canCollectCash?: boolean }) =>
    http.post("/staff", payload).then((r) => r.data),
  updateUser: (id: string, changes: { active?: boolean; canCollectCash?: boolean; password?: string }) =>
    http.put(`/staff/${id}`, changes).then((r) => r.data.user),
  deleteUser: (id: string) => http.delete(`/staff/${id}`).then((r) => r.data),
};

export const eventsApi = {
  /** Public: the edition shown on the registration site (null when none is set up yet). */
  current: (signal?: Sig) => http.get("/events/current", { signal }).then((r) => r.data.event),
  list: (signal?: Sig) => http.get("/events", { signal }).then((r) => r.data as { events: any[]; legacyRegistrations: number }),
  create: (body: any) => http.post("/events", body).then((r) => r.data.event),
  update: (id: string, body: any) => http.put(`/events/${id}`, body).then((r) => r.data.event),
  remove: (id: string) => http.delete(`/events/${id}`).then((r) => r.data),
  setCurrent: (id: string) => http.post(`/events/${id}/set-current`).then((r) => r.data.event),
  adoptLegacy: (id: string) => http.post(`/events/${id}/adopt-legacy`).then((r) => r.data),
  analytics: (signal?: Sig) => http.get("/events/analytics", { signal }).then((r) => r.data.events as any[]),
  followup: (params: { from: string; to: string; audience?: string }, signal?: Sig) =>
    http.get("/events/followup", { params, signal }).then((r) => r.data),
  sendFollowup: (body: { from: string; to: string; audience?: string }) =>
    http.post("/events/followup/send", body).then((r) => r.data),
};

export const registrationApi = {
  /** Public list; managed on the admin Colleges page. */
  getColleges: (signal?: Sig) => http.get("/colleges", { signal }).then((r) => (Array.isArray(r.data) ? (r.data as any[]) : [])),

  /** Creates the Razorpay order. A student ID photo, when present, goes up as multipart. */
  createOrder: ({ amountInPaise, formData, studentIdCard }: { amountInPaise: number; formData: any; studentIdCard?: File | null }) => {
    if (studentIdCard) {
      const body = new FormData();
      body.append("amount", String(amountInPaise));
      body.append("formData", JSON.stringify(formData));
      body.append("studentIdCard", studentIdCard);
      return http.post("/payments/create-order-with-file", body).then((r) => r.data);
    }
    return http.post("/payments/create-order", { amount: amountInPaise, formData }).then((r) => r.data);
  },
  verifyPayment: (payload: any) => http.post("/payments/verify", payload).then((r) => r.data),
  getPaymentStatus: (paymentId: string, signal?: Sig) => http.get(`/payments/status/${encodeURIComponent(paymentId)}`, { signal }),
  verifyImmediately: ({ orderId, paymentId }: { orderId?: string; paymentId?: string }) =>
    http.post("/payments/verify-immediately", { orderId, paymentId }).then((r) => r.data),
};

export const candidatesApi = {
  /** event: an event id, 'all', or undefined for the current event. */
  list: (event?: string, signal?: Sig) =>
    http.get("/registrations", { params: q(event), signal }).then((r) => unwrapList<any>(r.data, ["candidates", "records"])),
  /** The entry QR token of a paid (and, for students, approved) registration. */
  qr: (candidateId: string) => http.get(`/registrations/${candidateId}/qr`).then((r) => r.data),
  /** Sends the entry QR to the person's WhatsApp. */
  sendQr: (candidateId: string) => http.post(`/registrations/${candidateId}/send-qr`).then((r) => r.data),
  /** Dashboard totals against what Razorpay holds, plus every registration that disagrees. */
  auditPayments: (event?: string) => http.get("/payments/audit", { params: q(event) }).then((r) => r.data),
  /** Asks Razorpay about registrations still Pending and settles the ones it has captured. */
  checkPending: () => http.post("/payments/check-pending").then((r) => r.data),
  /** action: 'accept' | 'reject' | 'refund' */
  act: (action: "accept" | "reject" | "refund", candidateId: string) =>
    http.post(`/registrations/${candidateId}/${action}`).then((r) => r.data),
  get: (id: string) => http.get(`/registrations/${id}`).then((r) => r.data.candidate),
  update: (id: string, changes: any) => http.put(`/registrations/${id}`, changes).then((r) => r.data.candidate),
  remove: (id: string) => http.delete(`/registrations/${id}`).then((r) => r.data),
  removeByName: (name: string) => http.delete("/registrations/by-name", { data: { name } }).then((r) => r.data),
  sendReminders: (time: string) => http.post("/registrations/reminders", { time }).then((r) => r.data),
  forceCheck: (id: string) => http.get(`/payments/force-check/${id}`).then((r) => r.data),
};

export const attendanceApi = {
  getQrCodes: (whatsappNumber: string) => http.post("/attendance/qr-codes", { whatsappNumber }).then((r) => r.data),
  scan: (token: string) => http.post("/attendance/scan", { token }).then((r) => r.data),
  markByPhone: (whatsappNumber: string) => http.post("/attendance/mark", { whatsappNumber }).then((r) => r.data),
  /** Records scanned by volunteers. */
  listScanned: (event?: string, signal?: Sig) =>
    http.get("/attendance/scanned", { params: q(event), signal }).then((r) => unwrapList<any>(r.data, ["candidates", "records", "scannedList"])),
  report: (params: { event?: string; status?: "present" | "absent"; date?: string }, signal?: Sig) =>
    http.get("/attendance/report", { params, signal }).then((r) => r.data),
};

export const cashApi = {
  list: (signal?: Sig) => http.get("/cash", { signal }).then((r) => r.data),
  register: (body: any) => http.post("/cash/register", body).then((r) => r.data),
  sendQr: (id: string) => http.post(`/cash/${id}/send-qr`).then((r) => r.data),
};

export const collegesApi = {
  list: (signal?: Sig) => http.get("/colleges", { signal }).then((r) => (Array.isArray(r.data) ? (r.data as any[]) : [])),
  create: (name: string) => http.post("/colleges", { name }).then((r) => r.data),
  bulk: (names: string[]) => http.post("/colleges/bulk", { names }).then((r) => r.data as { created: number; skipped: number }),
  update: (id: string, name: string) => http.put(`/colleges/${id}`, { name }).then((r) => r.data),
  remove: (id: string) => http.delete(`/colleges/${id}`).then((r) => r.data),
};

export const devoteesApi = {
  // Admin: manage the list
  list: (signal?: Sig) => http.get("/devotees", { signal }).then((r) => r.data.devotees as any[]),
  add: (body: { name: string; whatsappNumber: string }) => http.post("/devotees", body).then((r) => r.data.devotee),
  addMany: (rows: { name?: string; phone?: string }[]) => http.post("/devotees/bulk", { rows }).then((r) => r.data),
  update: (id: string, changes: { name?: string; active?: boolean }) => http.put(`/devotees/${id}`, changes).then((r) => r.data.devotee),
  remove: (id: string) => http.delete(`/devotees/${id}`).then((r) => r.data),
  // Public: sign in with a code sent on WhatsApp
  requestCode: (phone: string) => http.post("/devotee-auth/otp", { phone }, { skipAuthRedirect: true }).then((r) => r.data),
  verifyCode: (phone: string, otp: string) => http.post("/devotee-auth/verify", { phone, otp }, { skipAuthRedirect: true }).then((r) => r.data),
};

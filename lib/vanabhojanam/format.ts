const ORDINALS: Record<string, string> = { "1": "st", "2": "nd", "3": "rd" };

export const ordinalYear = (year?: string | number | null) => {
  if (!year) return "";
  return `${year}${ORDINALS[String(year)] || "th"} Year`;
};

export const formatDate = (value?: string | Date | null) => (value ? new Date(value).toLocaleDateString() : "");

const IST = { timeZone: "Asia/Kolkata" } as const;

/** "12 Nov 2026" in Indian time, whatever the viewer's own timezone is. */
export const formatDateIST = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleDateString("en-IN", { ...IST, day: "numeric", month: "short", year: "numeric" }) : "";

/** "5:49 pm" in Indian time. */
export const formatTimeIST = (value?: string | Date | null) =>
  value ? new Date(value).toLocaleTimeString("en-IN", { ...IST, hour: "numeric", minute: "2-digit", hour12: true }) : "";

/** "12 Nov 2026, 5:49 pm" in Indian time. */
export const formatDateTimeIST = (value?: string | Date | null) =>
  value ? `${formatDateIST(value)}, ${formatTimeIST(value)}` : "";

export const formatDateTime = (value?: string | Date | null) => (value ? new Date(value).toLocaleString() : "");

export const onlyDigits = (value: unknown) => String(value ?? "").replace(/\D/g, "");

export const formatINR = (value: unknown) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Number(value) || 0);

/** Whole years between a YYYY-MM-DD birth date and `on`. */
export const ageOn = (dob?: string | Date | null, on: Date = new Date()): number | null => {
  if (!dob) return null;
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return null;
  let age = on.getFullYear() - birth.getFullYear();
  const beforeBirthday =
    on.getMonth() < birth.getMonth() || (on.getMonth() === birth.getMonth() && on.getDate() < birth.getDate());
  if (beforeBirthday) age -= 1;
  return age;
};

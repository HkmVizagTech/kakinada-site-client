import { onlyDigits } from "./format";
import type { PresentedEvent } from "./event";

export const initialValues = {
  serialNo: "",
  name: "",
  whatsappNumber: "",
  email: "",
  gender: "",
  collegeOrWorking: "",
  companyName: "",
  college: "",
  course: "",
  year: "",
  dob: "",
  area: "",
};

export type FormValues = typeof initialValues;
export type FormErrors = Partial<Record<keyof FormValues | "studentIdCard", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns `{ field: message }`; an empty object means the form is valid. */
export function validateRegistration(values: FormValues, { hasIdCard = true } = {}): FormErrors {
  const e: FormErrors = {};
  const isCollege = values.collegeOrWorking === "College";
  const isWorking = values.collegeOrWorking === "Working";

  if (!values.name.trim()) e.name = "Name is required";
  if (!values.dob) e.dob = "Date of birth is required";

  if (!values.whatsappNumber.trim()) e.whatsappNumber = "WhatsApp number is required";
  else if (!/^\d{10}$/.test(onlyDigits(values.whatsappNumber))) e.whatsappNumber = "Enter a valid 10-digit number";

  if (!values.email) e.email = "Email is required";
  else if (!EMAIL_RE.test(values.email)) e.email = "Enter a valid email";

  if (!values.area.trim()) e.area = "Area is required";

  if (!values.gender) e.gender = "Please select gender";
  if (!values.collegeOrWorking) e.collegeOrWorking = "Please select one option";

  if (isWorking && !values.companyName.trim()) e.companyName = "Company name is required";

  if (isCollege) {
    if (!values.college.trim()) e.college = "College name is required";
    if (!values.course.trim()) e.course = "Course is required";
    if (!values.year) e.year = "Year is required";
    if (!hasIdCard) e.studentIdCard = "Please upload your student ID card";
  }
  return e;
}

/** Field order on screen, used to focus the first invalid field. */
export const FIELD_ORDER = [
  "name", "dob", "whatsappNumber", "email", "area", "gender", "collegeOrWorking",
  "companyName", "college", "course", "year", "studentIdCard",
] as const;

/** Fee in rupees for a candidate type in the given (presented) event, or null when not chosen yet. */
export const feeFor = (event: PresentedEvent | null | undefined, category: string): number | null =>
  (event?.fees as any)?.[category]?.amount ?? null;

/** Shape the backend expects (trimmed, digits-only phone). */
export function buildPayload(values: FormValues) {
  return {
    ...values,
    name: values.name.trim(),
    whatsappNumber: onlyDigits(values.whatsappNumber),
    college: values.college.trim(),
    area: values.area.trim(),
  };
}

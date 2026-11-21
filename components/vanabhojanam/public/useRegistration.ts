"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { registrationApi } from "@/lib/vanabhojanam/api";
import { BASE_PATH, EVENT } from "@/lib/vanabhojanam/config";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";
import { onlyDigits } from "@/lib/vanabhojanam/format";
import { loadRazorpay } from "@/lib/vanabhojanam/razorpay";
import { FIELD_ORDER, feeFor, initialValues, validateRegistration, type FormErrors, type FormValues } from "@/lib/vanabhojanam/validation";
import { useCurrentEvent } from "../context/CurrentEventContext";

const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** All form state, validation and student-ID upload handling for the registration form. */
export function useRegistrationForm() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [idCard, setIdCard] = useState<{ file: File | null; previewUrl: string }>({ file: null, previewUrl: "" });
  const previewRef = useRef("");

  // Release the blob URL when it is replaced or the page unmounts.
  useEffect(() => {
    previewRef.current = idCard.previewUrl;
  }, [idCard.previewUrl]);
  useEffect(() => () => {
    if (previewRef.current) URL.revokeObjectURL(previewRef.current);
  }, []);

  const setField = useCallback((name: keyof FormValues, rawValue: string) => {
    const value = name === "whatsappNumber" ? onlyDigits(rawValue).slice(0, 10) : rawValue;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => (prev[name] ? { ...prev, [name]: "" } : prev));
  }, []);

  const clearIdCard = useCallback(() => {
    setIdCard((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file: null, previewUrl: "" };
    });
  }, []);

  const pickIdCard = useCallback((file?: File | null) => {
    if (!file) return;
    const fail = (title: string, description: string) => vbToast({ title, description, status: "error", duration: 3000 });
    if (!ALLOWED_TYPES.includes(file.type)) return fail("Invalid file type", "Please upload a JPG, PNG, or WebP image file");
    if (file.size > MAX_FILE_BYTES) return fail("File too large", "Please upload an image smaller than 5MB");
    setIdCard((prev) => {
      if (prev.previewUrl) URL.revokeObjectURL(prev.previewUrl);
      return { file, previewUrl: URL.createObjectURL(file) };
    });
    setErrors((prev) => (prev.studentIdCard ? { ...prev, studentIdCard: "" } : prev));
  }, []);

  /** Validates, shows errors and focuses the first invalid field. Returns true when valid. */
  const validate = useCallback(() => {
    const found = validateRegistration(values, { hasIdCard: Boolean(idCard.file) });
    setErrors(found);
    const first = FIELD_ORDER.find((f) => (found as any)[f]);
    if (first) {
      const field = document.querySelector(`[data-field="${first}"]`);
      field?.scrollIntoView({ behavior: "smooth", block: "center" });
      (field?.querySelector("input, select, textarea") as HTMLElement | null)?.focus({ preventScroll: true });
    }
    return !first;
  }, [values, idCard.file]);

  return { values, errors, setField, idCard, pickIdCard, clearIdCard, validate };
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/** A failed confirmation call is worth repeating when the network, the server or the rate limit is to blame, not when the signature is wrong. */
const isRetryable = (err: any) => !err?.response || err.response.status >= 500 || err.response.status === 429;

/**
 * Asks our server to confirm a payment the student has already made. Tries the normal confirmation a few times, then asks the
 * server to look the payment up at Razorpay. Resolves true when the server has it as paid.
 */
async function confirmPayment({ response, payload }: { response: any; payload: any }) {
  const body = {
    razorpay_payment_id: response.razorpay_payment_id,
    razorpay_order_id: response.razorpay_order_id,
    razorpay_signature: response.razorpay_signature,
    formData: { ...payload, paymentMethod: "Online", receipt: `receipt_${Date.now()}` },
  };
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const result = await registrationApi.verifyPayment(body);
      if (result.message === "success" || result.message === "Already Registered") return true;
      throw new Error(result.message);
    } catch (err) {
      if (!isRetryable(err)) throw err;
      await wait(1000 * (attempt + 1));
    }
  }
  const lookup = await registrationApi.verifyImmediately({ orderId: response.razorpay_order_id, paymentId: response.razorpay_payment_id }).catch(() => null);
  return Boolean(lookup?.success);
}

/** Creates the order, opens Razorpay checkout, confirms the payment, then routes to the thank-you page. */
export function usePayment() {
  const router = useRouter();
  const { event } = useCurrentEvent();
  const [isPaying, setIsPaying] = useState(false);
  const lastFailure = useRef<string | null>(null); // the newest failure in the open checkout window, shown only if the student gives up

  const notifyError = useCallback(
    (title: string, description?: string) => vbToast({ title, description: description || "Try again later", status: "error", duration: 5000 }),
    []
  );

  const pay = useCallback(
    async ({ payload, studentIdCard }: { payload: any; studentIdCard: File | null }) => {
      setIsPaying(true);
      try {
        const Razorpay = await loadRazorpay();
        const amountInPaise = (feeFor(event, payload.collegeOrWorking) || 0) * 100;
        const order = await registrationApi.createOrder({ amountInPaise, formData: payload, studentIdCard });
        if (!order?.id) throw new Error("Order creation failed");

        lastFailure.current = null;
        const checkout = new Razorpay({
          key: order.keyId,
          amount: order.amount,
          currency: "INR",
          name: event?.title || EVENT.title,
          description: "Registration Fee",
          order_id: order.id,
          prefill: { name: payload.name, email: payload.email, contact: `91${payload.whatsappNumber}` },
          theme: { color: "#20603d" },
          // Wallets are hidden: nearly every wallet payment was declined. Closing the window asks first, because a student
          // may be in their UPI app approving the payment.
          config: { display: { hide: [{ method: "wallet" }, { method: "emi" }, { method: "paylater" }] } },
          modal: {
            confirm_close: true,
            ondismiss: () => {
              // Razorpay lets the student retry inside the window, so a failure is only reported once they close it.
              if (lastFailure.current) {
                notifyError("Payment didn't go through", `${lastFailure.current} Nothing was taken, or any amount taken is returned by your bank. You can try again.`);
                lastFailure.current = null;
              }
              setIsPaying(false);
            },
          },
          handler: async (response: any) => {
            lastFailure.current = null;
            try {
              if (!(await confirmPayment({ response, payload }))) {
                // The money has been taken: never tell the student it failed, or they will pay a second time.
                vbToast({
                  title: "Payment received. Please do not pay again.",
                  description: `We are confirming it and will send your confirmation on WhatsApp shortly. Reference: ${response.razorpay_payment_id}`,
                  status: "warning",
                  duration: 20000,
                });
                return;
              }
              vbToast({ title: "Registration Successful!", description: "Your registration is confirmed.", status: "success", duration: 5000 });
              router.push(`${BASE_PATH}/thankyou/${response.razorpay_payment_id}`);
            } catch (err) {
              notifyError(
                "We could not confirm your payment yet",
                `${getErrorMessage(err)} If money was deducted, please do not pay again: write to us with reference ${response.razorpay_payment_id}.`
              );
            } finally {
              setIsPaying(false);
            }
          },
        });
        // Keep the window's own retry in charge: remember why this try failed, say nothing yet, leave the button locked.
        checkout.on("payment.failed", (response: any) => {
          lastFailure.current = response?.error?.description || "The payment could not be completed.";
        });
        checkout.open();
      } catch (err: any) {
        // 409 means this person has already paid: say so, instead of a generic "Payment failed".
        const already = err?.response?.status === 409 && /already registered/i.test(getErrorMessage(err));
        // Anything that fails before the checkout window opens has not charged the student, so do not call it a payment failure.
        notifyError(already ? "Already registered" : "Could not start the payment", already ? getErrorMessage(err) : `${getErrorMessage(err)} Nothing was charged.`);
        setIsPaying(false);
      }
    },
    [event, notifyError, router]
  );

  return { pay, isPaying };
}

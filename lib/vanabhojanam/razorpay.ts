import { RAZORPAY_SCRIPT_URL } from "./config";

let loader: Promise<any> | null = null;

/** The checkout script is fetched once, on first use. */
export const loadRazorpay = (): Promise<any> => {
  if (typeof window === "undefined") return Promise.reject(new Error("Payments need a browser"));
  const w = window as any;
  if (w.Razorpay) return Promise.resolve(w.Razorpay);
  if (!loader) {
    loader = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = RAZORPAY_SCRIPT_URL;
      script.async = true;
      script.onload = () => resolve(w.Razorpay);
      script.onerror = () => {
        loader = null; // allow a retry after a network blip
        reject(new Error("Could not load the payment gateway. Check your connection."));
      };
      document.body.appendChild(script);
    });
  }
  return loader;
};

export const preloadRazorpay = () => {
  loadRazorpay().catch(() => {});
};

/**
 * True inside the browser built into WhatsApp, Instagram, Facebook and similar apps, or an Android WebView.
 * These often cannot open a UPI app, so a UPI payment started there tends to time out.
 */
export const isInAppBrowser = (userAgent = typeof navigator !== "undefined" ? navigator.userAgent : "") =>
  /FBAN|FBAV|FB_IAB|Instagram|Line\/|Snapchat|Twitter|LinkedInApp|MicroMessenger|; wv\)|WhatsApp/i.test(String(userAgent));

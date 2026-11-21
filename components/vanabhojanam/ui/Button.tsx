"use client";

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type VbButtonVariant = "festival" | "brass" | "outline" | "ghost" | "danger" | "success" | "dangerOutline" | "soft";
export type VbButtonSize = "xs" | "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-vb-brand-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export const variantClass: Record<VbButtonVariant, string> = {
  // Primary action: solid deep green, no gradient, no motion.
  festival: "bg-vb-brand-600 text-white shadow-[0_1px_2px_rgba(16,32,24,0.2)] hover:bg-vb-brand-700 active:bg-vb-brand-800",
  // Brass action for dark surfaces.
  brass: "bg-vb-brass-400 text-vb-brand-900 hover:bg-vb-brass-300 active:bg-vb-brass-500",
  outline: "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50",
  soft: "bg-vb-brand-50 text-vb-brand-700 hover:bg-vb-brand-100",
  ghost: "text-gray-700 hover:bg-black/5",
  danger: "bg-red-600 text-white hover:bg-red-700",
  dangerOutline: "border border-red-300 bg-white text-red-600 hover:bg-red-50",
  success: "bg-emerald-600 text-white hover:bg-emerald-700",
};

export const sizeClass: Record<VbButtonSize, string> = {
  xs: "h-7 px-2.5 text-xs",
  sm: "h-9 px-3.5 text-sm",
  md: "h-10 px-5 text-sm",
  lg: "h-14 px-8 text-base",
};

export interface VbButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: VbButtonVariant;
  size?: VbButtonSize;
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

/** The Vanabhojanam button: variants festival | brass | outline | soft | ghost | danger | dangerOutline | success. */
export const VbButton = forwardRef<HTMLButtonElement, VbButtonProps>(function VbButton(
  { variant = "festival", size = "md", loading, loadingText, leftIcon, rightIcon, className, children, disabled, type = "button", ...rest },
  ref
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={cn(base, variantClass[variant], sizeClass[size], className)} {...rest}>
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {loading && loadingText ? loadingText : children}
      {!loading && rightIcon}
    </button>
  );
});

/** Class string for links (<a>, next/link) that should look like a VbButton. */
export const vbButtonClass = (variant: VbButtonVariant = "festival", size: VbButtonSize = "md", extra?: string) =>
  cn(base, variantClass[variant], sizeClass[size], extra);

"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400 transition-colors focus:border-vb-brand-500 focus:outline-none focus:ring-1 focus:ring-vb-brand-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-70";

export const VbInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean; inputSize?: "sm" | "md" }>(
  function VbInput({ className, invalid, inputSize = "md", ...rest }, ref) {
    return (
      <input
        ref={ref}
        className={cn(control, inputSize === "sm" ? "h-9" : "h-10", invalid && "border-red-500 focus:border-red-500 focus:ring-red-500", className)}
        {...rest}
      />
    );
  }
);

export const VbSelect = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean; inputSize?: "sm" | "md" }>(
  function VbSelect({ className, invalid, inputSize = "md", children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        className={cn(control, inputSize === "sm" ? "h-9" : "h-10", "pr-8", invalid && "border-red-500", className)}
        {...rest}
      >
        {children}
      </select>
    );
  }
);

export const VbTextarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function VbTextarea({ className, invalid, ...rest }, ref) {
    return <textarea ref={ref} className={cn(control, "min-h-[88px] py-2", invalid && "border-red-500", className)} {...rest} />;
  }
);

/** Input with a fixed prefix, e.g. "+91" before a phone number. */
export function VbInputGroup({ prefix, children }: { prefix: ReactNode; children: ReactNode }) {
  return (
    <div className="flex">
      <span className="inline-flex h-10 items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-3 text-sm font-medium text-gray-600">{prefix}</span>
      <div className="min-w-0 flex-1 [&>input]:rounded-l-none">{children}</div>
    </div>
  );
}

/** Label + control + error wrapper. `id` is also the DOM id the control must use; `data-field` is used to focus the first invalid field. */
export function FormField({
  id,
  label,
  required,
  error,
  hint,
  children,
  className,
}: {
  id: string;
  label: ReactNode;
  required?: boolean;
  error?: string;
  hint?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div data-field={id} className={cn("w-full", className)}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-semibold text-vb-brand-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {hint && !error && <p className="mt-1.5 text-xs text-gray-500">{hint}</p>}
      {error && (
        <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

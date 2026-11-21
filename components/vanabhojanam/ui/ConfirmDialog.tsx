"use client";

import type { ReactNode } from "react";
import {
  AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { VbButton } from "./Button";

export default function ConfirmDialog({
  isOpen,
  title = "Confirm Action",
  children,
  confirmLabel = "Confirm",
  tone = "danger",
  isLoading,
  onConfirm,
  onClose,
}: {
  isOpen: boolean;
  title?: string;
  children?: ReactNode;
  confirmLabel?: string;
  /** danger = red button, festival = green */
  tone?: "danger" | "festival" | "success";
  isLoading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-white text-gray-900">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="text-sm text-gray-600">{children}</div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <VbButton variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </VbButton>
          <VbButton variant={tone} onClick={onConfirm} loading={isLoading}>
            {confirmLabel}
          </VbButton>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

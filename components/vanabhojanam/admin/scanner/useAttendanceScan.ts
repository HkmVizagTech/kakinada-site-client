"use client";

import { useCallback, useRef, useState } from "react";
import { attendanceApi } from "@/lib/vanabhojanam/api";
import { getErrorMessage } from "@/lib/vanabhojanam/http";
import { vbToast } from "@/lib/vanabhojanam/hooks";
import { signal } from "./feedback";

const COOLDOWN_MS = 3000; // the camera re-decodes a held-up code every frame
const HISTORY_LIMIT = 10;

export interface ScanResult {
  token: string;
  status: string;
  message?: string;
  members: any[];
  total: number;
  scannedBy: string;
  at: Date;
}

const toResult = (token: string, response: any): ScanResult => {
  const members = response.familyMembers?.length ? response.familyMembers : response.data ? [response.data] : [];
  return {
    token,
    status: response.status,
    message: response.message,
    members,
    total: response.totalMembers || members.length,
    scannedBy: response.scannedPerson || (members.length === 1 ? members[0].name : ""),
    at: new Date(),
  };
};

/** Sends each scanned QR token to the backend once, and keeps the latest result + a short history. */
export function useAttendanceScan() {
  const [result, setResult] = useState<ScanResult | null>(null);
  const [history, setHistory] = useState<ScanResult[]>([]);
  const lastRef = useRef({ value: "", time: 0 });
  const busyRef = useRef(false);

  const record = useCallback((next: ScanResult) => {
    setResult(next);
    setHistory((prev) => [next, ...prev].slice(0, HISTORY_LIMIT));
  }, []);

  const handleDecode = useCallback(
    async (token: string) => {
      const now = Date.now();
      if (busyRef.current) return;
      if (token === lastRef.current.value && now - lastRef.current.time < COOLDOWN_MS) return;
      lastRef.current = { value: token, time: now };
      busyRef.current = true;
      setResult(null);
      vbToast({ title: "QR Code Scanned", status: "success", duration: 1500 });
      try {
        const next = toResult(token, await attendanceApi.scan(token));
        signal(next.status === "already-marked" ? "warning" : "success");
        record(next);
      } catch (err: any) {
        // 401/403 are handled globally (logout + redirect), everything else is shown inline.
        signal("error");
        record({
          token,
          status: "error",
          message: err.response?.data?.message || getErrorMessage(err, "Error fetching candidate details"),
          members: [],
          total: 0,
          scannedBy: "",
          at: new Date(),
        });
      } finally {
        busyRef.current = false;
        lastRef.current.time = Date.now();
      }
    },
    [record]
  );

  return { result, history, handleDecode };
}

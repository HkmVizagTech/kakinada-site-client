"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { eventsApi } from "@/lib/vanabhojanam/api";
import { useVbAuth } from "./VbAuthContext";

const KEY = "vb_adminEvent";
const read = () => {
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
};

/**
 * Admin-wide "which edition am I looking at". `selected` is an event id or 'all'.
 * Defaults to the current event; the choice is remembered between visits.
 */
interface AdminEventValue {
  events: any[];
  legacy: number;
  loaded: boolean;
  current: any | null;
  selected: string;
  setSelected: (value: string) => void;
  refresh: () => Promise<any[]>;
}

const AdminEventContext = createContext<AdminEventValue | null>(null);

export function AdminEventProvider({ children }: { children: ReactNode }) {
  const { status } = useVbAuth();
  const [events, setEvents] = useState<any[]>([]);
  const [legacy, setLegacy] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [selected, setSelectedState] = useState<string | null>(null);

  useEffect(() => {
    setSelectedState(read());
  }, []);

  const refresh = useCallback(async () => {
    const { events: list, legacyRegistrations } = await eventsApi.list();
    setEvents(list);
    setLegacy(legacyRegistrations);
    setLoaded(true);
    return list;
  }, []);

  useEffect(() => {
    if (status !== "authenticated") return;
    refresh().catch(() => setLoaded(true));
  }, [status, refresh]);

  const setSelected = useCallback((value: string) => {
    setSelectedState(value);
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* private mode: the choice just isn't remembered */
    }
  }, []);

  const current = events.find((e) => e.isCurrent) || null;
  // Fall back to the current event when nothing (or a deleted event) is selected.
  const valid = selected === "all" || events.some((e) => e._id === selected);
  const effective = valid && selected ? selected : current?._id || "all";

  const value = useMemo(
    () => ({ events, legacy, loaded, current, selected: effective, setSelected, refresh }),
    [events, legacy, loaded, current, effective, setSelected, refresh]
  );
  return <AdminEventContext.Provider value={value}>{children}</AdminEventContext.Provider>;
}

export const useAdminEvent = () => {
  const ctx = useContext(AdminEventContext);
  if (!ctx) throw new Error("useAdminEvent must be used inside <AdminEventProvider>");
  return ctx;
};

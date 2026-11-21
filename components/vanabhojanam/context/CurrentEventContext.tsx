"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { eventsApi } from "@/lib/vanabhojanam/api";
import { presentEvent, type PresentedEvent } from "@/lib/vanabhojanam/event";

/**
 * The edition the public site is about. Loaded once from the backend, so a new year only needs
 * a new event in the admin console. status: 'loading' | 'ready' | 'error'; event is null when none is set up.
 */
interface CurrentEventState {
  event: PresentedEvent | null;
  status: "loading" | "ready" | "error";
}

const CurrentEventContext = createContext<CurrentEventState>({ event: null, status: "loading" });

export function CurrentEventProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CurrentEventState>({ event: null, status: "loading" });

  useEffect(() => {
    const controller = new AbortController();
    eventsApi
      .current(controller.signal)
      .then((api) => setState({ event: presentEvent(api), status: "ready" }))
      .catch(() => !controller.signal.aborted && setState({ event: null, status: "error" }));
    return () => controller.abort();
  }, []);

  const value = useMemo(() => state, [state]);
  return <CurrentEventContext.Provider value={value}>{children}</CurrentEventContext.Provider>;
}

export const useCurrentEvent = () => useContext(CurrentEventContext);

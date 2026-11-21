"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { isCancel } from "./http";

/**
 * Runs `fetcher(signal)` on mount and whenever `reload` is called (or `deps` change).
 * Aborts in-flight requests on unmount so state is never set on a dead component.
 */
export function useAsyncData<T = any>(fetcher: (signal: AbortSignal) => Promise<T>, initialData: T | null = null, deps: unknown[] = []) {
  const [state, setState] = useState<{ data: T | null; error: any; loading: boolean }>({ data: initialData, error: null, loading: true });
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const controllerRef = useRef<AbortController | null>(null);

  const run = useCallback(async () => {
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fetcherRef.current(controller.signal);
      if (!controller.signal.aborted) setState({ data, error: null, loading: false });
    } catch (error) {
      if (isCancel(error) || controller.signal.aborted) return;
      setState((prev) => ({ ...prev, error, loading: false }));
    }
  }, []);

  const depsKey = JSON.stringify(deps);
  useEffect(() => {
    run();
    return () => controllerRef.current?.abort();
  }, [run, depsKey]);

  const setData = useCallback(
    (updater: T | null | ((prev: T | null) => T | null)) =>
      setState((prev) => ({ ...prev, data: typeof updater === "function" ? (updater as (p: T | null) => T | null)(prev.data) : updater })),
    []
  );

  return { ...state, reload: run, setData };
}

const split = (ms: number) => ({
  days: Math.floor(ms / 86400000),
  hours: Math.floor((ms / 3600000) % 24),
  minutes: Math.floor((ms / 60000) % 60),
  seconds: Math.floor((ms / 1000) % 60),
});

/** Time left until `target` (ISO string); returns null once it has passed (and on the server, to avoid a hydration mismatch). */
export function useCountdown(target: string) {
  const targetMs = new Date(target).getTime();
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    if (Number.isNaN(targetMs)) return undefined;
    setLeft(targetMs - Date.now());
    const id = setInterval(() => setLeft(targetMs - Date.now()), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  return left === null || Number.isNaN(targetMs) || left <= 0 ? null : split(left);
}

export function usePagination<T>(items: T[], pageSize = 50) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  // Filters shrink the list; never leave the user stranded on a page that no longer exists.
  useEffect(() => {
    setPage((p) => Math.min(p, pageCount));
  }, [pageCount]);

  const pageItems = useMemo(() => items.slice((page - 1) * pageSize, page * pageSize), [items, page, pageSize]);
  return { page, setPage, pageCount, pageItems, offset: (page - 1) * pageSize };
}

export function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

type Status = "success" | "error" | "warning" | "info";

/** Chakra-style toast helper: vbToast({ title, description, status, duration }). */
export function vbToast({ title, description, status = "info", duration = 4000 }: { title: string; description?: string; status?: Status; duration?: number }) {
  const icon = { success: "✓ ", error: "", warning: "⚠ ", info: "" }[status];
  toast({
    title: `${icon}${title}`,
    description,
    variant: status === "error" ? "destructive" : "default",
    duration,
  } as any);
}

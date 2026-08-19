"use client";

import React, { createContext, useContext, useState, useRef, ReactNode } from "react";

type AdminLoaderContextType = {
  isLoading: boolean;
  message?: string;
  show: (message?: string) => void;
  hide: () => void;
};

const AdminLoaderContext = createContext<AdminLoaderContextType | null>(null);

export const AdminLoaderProvider = ({ children }: { children: ReactNode }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | undefined>(undefined);
  const counterRef = useRef(0);

  const show = (msg?: string) => {
    counterRef.current = counterRef.current + 1;
    setMessage(msg);
    setIsLoading(true);
  };

  const hide = () => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      setIsLoading(false);
      setMessage(undefined);
    }
  };

  return (
    <AdminLoaderContext.Provider value={{ isLoading, message, show, hide }}>
      {children}
    </AdminLoaderContext.Provider>
  );
};

export const useAdminLoader = () => {
  const ctx = useContext(AdminLoaderContext);
  if (!ctx) throw new Error("useAdminLoader must be used within AdminLoaderProvider");
  return ctx;
};

export default AdminLoaderContext;

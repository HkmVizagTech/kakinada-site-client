"use client";

import { useLayoutEffect, type ReactNode } from "react";
import { VbAuthProvider } from "./context/VbAuthContext";
import { CurrentEventProvider } from "./context/CurrentEventContext";

/**
 * The Vanabhojanam pages are designed light-only, but the temple site follows the visitor's system theme
 * (a `dark` class on <html>). Dialogs and menus render in a portal on <body>, so the class has to be lifted
 * from <html> itself for the whole time one of these pages is open, then restored for the rest of the site.
 */
function ForceLight() {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const hadDark = root.classList.contains("dark");
    const previousScheme = root.style.colorScheme;
    const lift = () => {
      if (root.classList.contains("dark")) root.classList.remove("dark");
      root.style.colorScheme = "light";
    };
    lift();
    const observer = new MutationObserver(lift);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => {
      observer.disconnect();
      root.style.colorScheme = previousScheme;
      if (hadDark) root.classList.add("dark");
    };
  }, []);
  return null;
}

export default function VbProviders({ children }: { children: ReactNode }) {
  return (
    <VbAuthProvider>
      <CurrentEventProvider>
        <ForceLight />
        {children}
      </CurrentEventProvider>
    </VbAuthProvider>
  );
}

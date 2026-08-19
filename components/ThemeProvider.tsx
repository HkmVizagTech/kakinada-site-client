"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { ReactNode } from "react";

// Theme handling for the whole app:
//  - attribute="class" toggles the `dark` class on <html> (tailwind darkMode: ["class"])
//  - storageKey keeps the existing "hkm-theme" localStorage key so previously
//    saved preferences still work.
// next-themes injects a small inline script before first paint, which prevents
// the light-mode "flash" that the old manual toggle produced on every page load.
const ThemeProvider = ({ children }: { children: ReactNode }) => (
  <NextThemesProvider
    attribute="class"
    storageKey="hkm-theme"
    defaultTheme="system"
    enableSystem
    disableTransitionOnChange={false}
  >
    {children}
  </NextThemesProvider>
);

export default ThemeProvider;

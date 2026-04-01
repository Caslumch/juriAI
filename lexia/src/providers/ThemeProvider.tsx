"use client";

import { useEffect } from "react";
import { useAtom } from "jotai";
import { themeAtom, type Theme } from "@/store/theme";

const STORAGE_KEY = "lexia-theme";

function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "dark" || stored === "light") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useAtom(themeAtom);

  // Initialize theme from localStorage / system preference
  useEffect(() => {
    setTheme(getInitialTheme());
  }, [setTheme]);

  // Apply class and persist
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return <>{children}</>;
}

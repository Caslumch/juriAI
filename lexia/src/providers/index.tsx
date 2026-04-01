"use client";

import { SessionProvider } from "next-auth/react";
import { Provider as JotaiProvider } from "jotai";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <JotaiProvider>
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </JotaiProvider>
    </SessionProvider>
  );
}

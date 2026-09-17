"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { THEME_COOKIE, type Theme } from "@/lib/theme-constants";

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (next: Theme) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

// Unlike locale, a theme switch never changes rendered text — only which
// set of CSS variables applies (see globals.css) — so flipping the
// `data-theme` attribute directly on <html> is enough. No router.refresh()
// needed, no flash: the server already set the right attribute from the
// theme cookie on first paint (see lib/theme.ts + app/layout.tsx).
export function ThemeProvider({
  initialTheme,
  children,
}: {
  initialTheme: Theme;
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>(initialTheme);

  const applyTheme = useCallback((next: Theme) => {
    document.documentElement.setAttribute("data-theme", next);
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    setThemeState(next);
  }, []);

  // The navbar's quick toggle only ever flips between the two matcha
  // brightness levels — Edge is a distinct style picked explicitly from
  // Settings (via setTheme below), not something a one-tap icon should
  // land on by accident. Toggling while on Edge falls back to light.
  const toggleTheme = useCallback(() => {
    applyTheme(theme === "dark" ? "light" : theme === "light" ? "dark" : "light");
  }, [theme, applyTheme]);

  const value = useMemo(
    () => ({ theme, toggleTheme, setTheme: applyTheme }),
    [theme, toggleTheme, applyTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

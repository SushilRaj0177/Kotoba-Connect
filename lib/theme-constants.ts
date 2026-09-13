// Split from lib/theme.ts: that file imports next/headers (server-only), so
// client components (ThemeProvider, ThemeToggle) import the shared type/
// constant from here instead — importing a value from a next/headers module
// pulls the whole module into the client bundle even for a type-only need.
export type Theme = "light" | "dark";
export const THEME_COOKIE = "theme";

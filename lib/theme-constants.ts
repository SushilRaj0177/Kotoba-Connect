// Split from lib/theme.ts: that file imports next/headers (server-only), so
// client components (ThemeProvider, ThemeToggle) import the shared type/
// constant from here instead — importing a value from a next/headers module
// pulls the whole module into the client bundle even for a type-only need.
// "edge" is a separate OLED/minimal theme (true black, flattened surfaces,
// no shadows) — distinct from the light/dark pair, which are both the
// matcha palette at different brightness. Selected explicitly from
// Settings rather than the quick light/dark toggle in the navbar.
export type Theme = "light" | "dark" | "edge";
export const THEME_COOKIE = "theme";

// Each theme's page background (--c-bg in globals.css) as hex, for the
// <meta name="theme-color"> that tints the mobile browser's toolbar and
// status bar to match the app instead of a default white/grey strip.
export const THEME_COLORS: Record<Theme, string> = {
  light: "#fbf8f0",
  dark: "#111210",
  edge: "#000000",
};

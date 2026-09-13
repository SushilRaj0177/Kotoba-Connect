import type { Config } from "tailwindcss";

// Tailwind supports a function here at runtime (its own color-opacity
// plugin calls color functions exactly like this), but @types/tailwindcss's
// ThemeConfig only types color values as strings — so this whole object is
// deliberately typed as `any` below rather than fighting that mismatch.
function withOpacity(cssVar: string) {
  return ({ opacityValue }: { opacityValue?: string }) => {
    if (opacityValue !== undefined) return `rgb(var(${cssVar}) / ${opacityValue})`;
    return `rgb(var(${cssVar}))`;
  };
}

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Warm "ink on paper" palette — CSS-variable driven so the same
        // classes work under both the light (cream/paper) and dark
        // (candlelit brown) themes; see globals.css for the values.
        ink: {
          bg: withOpacity("--c-bg"),
          "bg-secondary": withOpacity("--c-bg-secondary"),
          "bg-input": withOpacity("--c-bg-input"),
          "bg-hover": withOpacity("--c-bg-hover"),
          border: withOpacity("--c-border"),
          accent: withOpacity("--c-accent"),
          "accent-hover": withOpacity("--c-accent-hover"),
          green: withOpacity("--c-green"),
          red: withOpacity("--c-red"),
          "red-hover": withOpacity("--c-red-hover"),
          yellow: withOpacity("--c-yellow"),
          text: withOpacity("--c-text"),
          "text-muted": withOpacity("--c-text-muted"),
          "text-header": withOpacity("--c-text-header"),
          "text-link": withOpacity("--c-link"),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } as any,
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
        jp: ["var(--font-jp)", "sans-serif"],
      },
      boxShadow: {
        cozy: "0 1px 2px rgb(0 0 0 / 0.04), 0 4px 16px -4px rgb(0 0 0 / 0.08)",
      },
    },
  },
  plugins: [],
};

export default config;

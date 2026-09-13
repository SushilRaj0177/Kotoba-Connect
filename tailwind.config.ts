import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Dark, layered-surface palette with a shu-iro (vermillion) accent —
        // the red of a torii gate or a hanko stamp, not a borrowed brand color.
        ink: {
          bg: "#18181b",
          "bg-secondary": "#202023",
          "bg-tertiary": "#131315",
          "bg-input": "#28282c",
          "bg-hover": "#2d2d32",
          border: "#313136",
          accent: "#e8542f",
          "accent-hover": "#c8451f",
          green: "#4ade80",
          red: "#f87171",
          "red-hover": "#ef4444",
          yellow: "#fbbf24",
          text: "#d4d4d8",
          "text-muted": "#8b8b93",
          "text-header": "#f4f4f5",
          "text-link": "#60a5fa",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        jp: ["var(--font-jp)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

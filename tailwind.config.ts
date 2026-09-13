import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0F172A",
        slate: {
          muted: "#64748B",
        },
        accent: "#2563EB",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        jp: ["var(--font-jp)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;

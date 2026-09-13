import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Discord-inspired dark palette.
        discord: {
          bg: "#313338", // primary content background
          "bg-secondary": "#2b2d31", // cards, header
          "bg-tertiary": "#1e1f22", // icon rail, darkest
          "bg-floating": "#111214", // modals/popouts
          "bg-input": "#383a40", // form fields
          "bg-hover": "#3a3c43", // hover state on rows
          "bg-active": "#404249",
          border: "#3f4147",
          blurple: "#5865f2",
          "blurple-hover": "#4752c4",
          green: "#23a55a",
          red: "#f23f43",
          "red-hover": "#da373c",
          yellow: "#f0b232",
          text: "#dbdee1", // normal body text
          "text-muted": "#949ba4",
          "text-header": "#f2f3f5",
          "text-link": "#00a8fc",
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

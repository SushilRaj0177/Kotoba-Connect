"use client";

import { useTheme } from "@/components/theme/ThemeProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Theme } from "@/lib/theme-constants";

const OPTIONS: { value: Theme; swatch: string[] }[] = [
  { value: "light", swatch: ["#fbf8f0", "#688c4a"] },
  { value: "dark", swatch: ["#111210", "#96c26a"] },
  { value: "edge", swatch: ["#000000", "#86b25e"] },
];

// A third, deliberately different theme from the matcha light/dark pair —
// true OLED black with every surface flattened into it (see globals.css'
// [data-theme="edge"] block), picked explicitly here rather than folded
// into the navbar's quick light/dark toggle since it's a different style
// family, not another brightness level.
export default function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  const { t } = useLocale();

  return (
    <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-text-header">{t("settings.appearanceTitle")}</h2>
      <p className="mt-1 text-sm text-ink-text-muted">{t("settings.appearanceHint")}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setTheme(opt.value)}
            aria-pressed={theme === opt.value}
            className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition active:scale-95 ${
              theme === opt.value
                ? "border-ink-accent bg-ink-accent/10"
                : "border-ink-border/70 hover:bg-ink-bg-hover"
            }`}
          >
            <span
              className="flex h-9 w-9 flex-none items-center justify-center overflow-hidden rounded-full border border-ink-border/60"
              style={{ backgroundColor: opt.swatch[0] }}
              aria-hidden="true"
            >
              <span className="h-3.5 w-3.5 rounded-full" style={{ backgroundColor: opt.swatch[1] }} />
            </span>
            <span className="text-xs font-semibold text-ink-text">{t(`settings.theme.${opt.value}`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

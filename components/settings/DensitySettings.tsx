"use client";

import { useDensity } from "@/components/theme/DensityProvider";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { CardDensity } from "@/lib/density-constants";

const OPTIONS: CardDensity[] = ["comfortable", "compact"];

// Independent of ThemeSettings' light/dark/edge picker — this is about how
// much of a card shows by default, not what color it is. Edge's own layout
// always renders the collapsed insight regardless of this setting (its
// whole layout is a deliberate package), but on light/dark this is what
// gets the same "tap to expand" behavior without switching color theme.
export default function DensitySettings() {
  const { density, setDensity } = useDensity();
  const { t } = useLocale();

  return (
    <div className="mt-4 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-text-header">{t("settings.densityTitle")}</h2>
      <p className="mt-1 text-sm text-ink-text-muted">{t("settings.densityHint")}</p>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setDensity(opt)}
            aria-pressed={density === opt}
            className={`flex flex-col items-start gap-1 rounded-xl border p-3 text-left transition active:scale-95 ${
              density === opt
                ? "border-ink-accent bg-ink-accent/10"
                : "border-ink-border/70 hover:bg-ink-bg-hover"
            }`}
          >
            <span className="text-sm font-semibold text-ink-text">{t(`settings.density.${opt}`)}</span>
            <span className="text-xs text-ink-text-muted">{t(`settings.density.${opt}Hint`)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

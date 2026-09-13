"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import type { Locale } from "@/lib/i18n/dictionaries";

const OPTIONS: { value: Locale; label: string }[] = [
  { value: "en", label: "EN" },
  { value: "ja", label: "JP" },
];

export default function LanguageToggle() {
  const { locale, setLocale, t } = useLocale();

  return (
    <div
      role="group"
      aria-label={t("lang.toggleLabel")}
      className="flex items-center rounded-full bg-ink-bg-input p-0.5 text-xs font-semibold"
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLocale(opt.value)}
          aria-pressed={locale === opt.value}
          className={`rounded-full px-2.5 py-1 transition ${
            locale === opt.value
              ? "bg-ink-accent text-white"
              : "text-ink-text-muted hover:text-ink-text"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

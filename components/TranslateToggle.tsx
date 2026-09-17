"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import type { useTranslate } from "@/lib/use-translate";

// The bare button half of on-demand translation, for the cases where the
// text it controls has to be rendered somewhere a <button> structurally
// can't sit (e.g. inside a <Link>) — the caller renders the text via
// useTranslate's own `display`/`showingTranslation` wherever it needs to,
// and drops this button wherever it needs to. See TranslateButton for the
// self-contained version used everywhere else.
export default function TranslateToggle({
  state,
  className = "",
}: {
  state: ReturnType<typeof useTranslate>;
  className?: string;
}) {
  const { t } = useLocale();
  const { translation, showingTranslation, loading, error, translate } = state;

  return (
    <button
      type="button"
      onClick={translate}
      disabled={loading}
      className={`flex items-center gap-1 text-xs font-semibold text-ink-text-link transition hover:underline disabled:opacity-60 ${className}`}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
      </svg>
      {loading
        ? t("translate.loading")
        : error
          ? t("translate.error")
          : translation
            ? showingTranslation
              ? t("translate.showOriginal")
              : t("translate.show")
            : t("translate.action")}
    </button>
  );
}

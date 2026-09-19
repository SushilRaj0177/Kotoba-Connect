"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useTranslate } from "@/lib/use-translate";

// Edge's version of AiNuanceCallout: collapsed by default instead of a
// permanently-open colored box on every single card — one more thing
// competing for attention at rest, expandable on demand since most of the
// time a reader is scanning the feed, not reading the analysis.
export default function AiInsightEdge({
  summary,
  formalitySuggestion,
}: {
  summary: string | null;
  formalitySuggestion: string | null;
}) {
  const { t, locale } = useLocale();
  const [open, setOpen] = useState(false);
  const translate = useTranslate(summary ?? "");
  if (!summary) return null;

  return (
    <div className="mt-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 text-xs font-semibold text-ink-accent"
      >
        <span aria-hidden="true">✦</span>
        {t("ai.label")}
        {formalitySuggestion ? ` · ${formalitySuggestion}` : ""}
        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          className={`transition-transform ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="mt-1.5 border-l-2 border-ink-accent/40 pl-2.5">
          <p className="text-sm text-ink-text">{translate.display}</p>
          {locale === "ja" && (
            <button
              type="button"
              onClick={translate.translate}
              disabled={translate.loading}
              className="mt-1 text-xs font-semibold text-ink-text-link hover:underline disabled:opacity-60"
            >
              {translate.loading
                ? t("translate.loading")
                : translate.error
                  ? t("translate.error")
                  : translate.translation
                    ? translate.showingTranslation
                      ? t("translate.showOriginal")
                      : t("translate.show")
                    : t("translate.action")}
            </button>
          )}
          <p className="mt-1.5 text-xs text-ink-text-muted">{t("ai.trustHint")}</p>
        </div>
      )}
    </div>
  );
}

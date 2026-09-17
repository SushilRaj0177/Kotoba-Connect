"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import TranslateButton from "@/components/TranslateButton";

// The AI read is generated once, always in English (see analyzePragmatics
// in lib/groq.ts), and stored — it doesn't regenerate per-locale, so
// switching the UI to 日本語 leaves this stuck in English. TranslateButton
// gives a per-card way to translate it on demand instead.
export default function AiNuanceCallout({
  summary,
  formalitySuggestion,
}: {
  summary: string | null;
  formalitySuggestion: string | null;
}) {
  const { t, locale } = useLocale();
  if (!summary) return null;

  return (
    <div className="mt-2 rounded-lg border-l-4 border-ink-accent bg-ink-bg-input px-3 py-2">
      <p className="text-xs font-semibold text-ink-accent">
        ✦ {t("ai.label")}
        {formalitySuggestion ? ` · ${t("ai.suggests")} ${formalitySuggestion}` : ""}
      </p>
      {/* The AI read is always generated in English — offering to
         "translate" it while already viewing the English UI would just
         translate English to English and echo the same text back, so only
         swap in TranslateButton (which replaces this text with its
         translation, toggled by its own button) when that's useful. */}
      {locale === "ja" ? (
        <TranslateButton text={summary} textClassName="text-sm text-ink-text" className="mt-0.5" />
      ) : (
        <p className="mt-0.5 text-sm text-ink-text">{summary}</p>
      )}
    </div>
  );
}

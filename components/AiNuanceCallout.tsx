"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

export default function AiNuanceCallout({
  summary,
  formalitySuggestion,
}: {
  summary: string | null;
  formalitySuggestion: string | null;
}) {
  const { t } = useLocale();
  if (!summary) return null;

  return (
    <div className="mt-2 rounded-lg border-l-4 border-ink-accent bg-ink-bg-input px-3 py-2">
      <p className="text-xs font-semibold text-ink-accent">
        ✦ {t("ai.label")}
        {formalitySuggestion ? ` · ${t("ai.suggests")} ${formalitySuggestion}` : ""}
      </p>
      <p className="mt-0.5 text-sm text-ink-text">{summary}</p>
    </div>
  );
}

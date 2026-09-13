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
    <div className="mt-2 rounded-lg border-l-4 border-discord-blurple bg-discord-bg-input px-3 py-2">
      <p className="text-xs font-semibold text-discord-blurple">
        ✦ {t("ai.label")}
        {formalitySuggestion ? ` · ${t("ai.suggests")} ${formalitySuggestion}` : ""}
      </p>
      <p className="mt-0.5 text-sm text-discord-text">{summary}</p>
    </div>
  );
}

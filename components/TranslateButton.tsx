"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

// A per-piece-of-text "translate this" action for content that doesn't
// track the site's EN/JP toggle: the AI nuance summary is generated once
// in English and stored (see lib/groq.ts's analyzePragmatics), and
// anything a user actually typed — a comment, an annotation note — is
// whatever language its author wrote in. Switching the UI language
// doesn't retroactively translate any of that; this does it on demand,
// scoped to just the text it's attached to.
export default function TranslateButton({ text, className = "" }: { text: string; className?: string }) {
  const { locale, t } = useLocale();
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showingOriginal, setShowingOriginal] = useState(true);

  async function handleClick() {
    if (translation) {
      setShowingOriginal((s) => !s);
      return;
    }
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("/api/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, targetLang: locale }),
      });
      const data = await res.json();
      if (!res.ok || !data.translation) {
        setError(true);
        return;
      }
      setTranslation(data.translation);
      setShowingOriginal(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={className}>
      {translation && !showingOriginal && (
        <p className="mb-1 text-sm leading-relaxed text-ink-text">{translation}</p>
      )}
      <button
        type="button"
        onClick={handleClick}
        disabled={loading}
        className="flex items-center gap-1 text-xs font-semibold text-ink-text-link transition hover:underline disabled:opacity-60"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m5 8 6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" />
        </svg>
        {loading
          ? t("translate.loading")
          : error
            ? t("translate.error")
            : translation
              ? showingOriginal
                ? t("translate.show")
                : t("translate.showOriginal")
              : t("translate.action")}
      </button>
    </div>
  );
}

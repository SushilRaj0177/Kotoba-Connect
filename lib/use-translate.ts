"use client";

import { useState } from "react";
import { useLocale } from "@/components/i18n/LocaleProvider";

// Shared on-demand-translation logic, split out from the button UI so a
// caller whose original text has to sit somewhere a <button> structurally
// can't (e.g. inside a <Link>, since a button can't nest inside an <a>)
// can still swap that text for its translation in place, driven by a
// separately-rendered TranslateToggle button elsewhere in the tree.
// TranslateButton (the common case — text and button next to each other)
// wraps this same hook internally.
export function useTranslate(text: string) {
  const { locale } = useLocale();
  const [translation, setTranslation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [showingTranslation, setShowingTranslation] = useState(false);

  async function translate() {
    if (translation) {
      setShowingTranslation((s) => !s);
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
      setShowingTranslation(true);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return {
    translation,
    showingTranslation,
    loading,
    error,
    translate,
    // What to actually display right now — the translation once fetched
    // and toggled on, the original text otherwise.
    display: showingTranslation && translation ? translation : text,
  };
}

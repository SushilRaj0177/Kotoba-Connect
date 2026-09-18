"use client";

import { useReadingAid } from "@/lib/use-reading-aid";
import { useLocale } from "@/components/i18n/LocaleProvider";
import type { ReadingAidMode } from "@/lib/reading-aid-store";

const OPTIONS: ReadingAidMode[] = ["none", "furigana", "romaji"];

// Kuromoji already computes a reading for every word in every entry (it
// powers the click-to-annotate feature), but until now nothing ever
// displayed it. This is a pure display preference — nothing server-side
// needs it — so it lives in localStorage rather than a cookie/profile
// column; see lib/reading-aid-store.ts.
export default function ReadingAidSettings() {
  const [mode, setMode] = useReadingAid();
  const { t } = useLocale();

  return (
    <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-text-header">{t("settings.readingAidTitle")}</h2>
      <p className="mt-1 text-sm text-ink-text-muted">{t("settings.readingAidHint")}</p>

      <div className="mt-3 grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setMode(opt)}
            aria-pressed={mode === opt}
            className={`rounded-xl border p-3 text-center text-xs font-semibold transition active:scale-95 ${
              mode === opt
                ? "border-ink-accent bg-ink-accent/10 text-ink-text"
                : "border-ink-border/70 text-ink-text-muted hover:bg-ink-bg-hover"
            }`}
          >
            {t(`settings.readingAid.${opt}`)}
          </button>
        ))}
      </div>

      <p className="mt-3 font-jp text-base text-ink-text-header">
        {mode === "romaji" ? "Nihongo no benkyou wa tanoshii desu." : mode === "furigana" ? (
          <ruby>
            日本語<rt className="text-[0.5em] text-ink-text-muted">にほんご</rt>
            の
            勉強<rt className="text-[0.5em] text-ink-text-muted">べんきょう</rt>
            は
            楽<rt className="text-[0.5em] text-ink-text-muted">たの</rt>
            しいです。
          </ruby>
        ) : (
          "日本語の勉強は楽しいです。"
        )}
      </p>
    </div>
  );
}

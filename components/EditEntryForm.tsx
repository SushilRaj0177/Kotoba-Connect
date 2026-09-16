"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry, FormalityLevel, KuromojiToken } from "@/types/database";
import FormalitySelect from "@/components/FormalitySelect";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";

export interface EntryEditPatch {
  raw_japanese: string;
  primary_translation: string;
  formality_level: FormalityLevel;
  furigana_parsed: KuromojiToken[];
  tags: string[];
}

// Previously the only way to fix a typo in a posted entry was delete +
// repost, which throws away its likes, comments, and annotations. RLS
// already allows an owner to update their own row (see "Users can update
// own entries" in schema.sql) — this was purely a missing UI.
export default function EditEntryForm({
  entry,
  onSaved,
  onCancel,
}: {
  entry: ContextEntry;
  onSaved: (patch: EntryEditPatch) => void;
  onCancel: () => void;
}) {
  const { t } = useLocale();
  const [rawJapanese, setRawJapanese] = useState(entry.raw_japanese);
  const [translation, setTranslation] = useState(entry.primary_translation);
  const [formality, setFormality] = useState<FormalityLevel>(entry.formality_level ?? "Teineigo");
  const [tagsInput, setTagsInput] = useState((entry.tags ?? []).join(", "));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedJapanese = rawJapanese.trim();
    const trimmedTranslation = translation.trim();
    if (!trimmedJapanese) {
      setError(t("form.errorEmptyJapanese"));
      return;
    }
    if (!trimmedTranslation) {
      setError(t("form.errorEmptyTranslation"));
      return;
    }
    const spam = spamSignal(trimmedJapanese) || spamSignal(trimmedTranslation);
    if (spam) {
      setError(spam);
      return;
    }

    setSaving(true);
    try {
      let furiganaParsed = entry.furigana_parsed;
      if (trimmedJapanese !== entry.raw_japanese) {
        const res = await fetch("/api/tokenize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmedJapanese }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tokenization failed.");
        furiganaParsed = data.tokens;
      }

      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8);

      const supabase = createClient();
      const { error: updateError } = await supabase
        .from("context_entries")
        .update({
          raw_japanese: trimmedJapanese,
          primary_translation: trimmedTranslation,
          formality_level: formality,
          furigana_parsed: furiganaParsed,
          tags,
        })
        .eq("id", entry.id);

      if (updateError) throw updateError;

      // Content changed, so re-run the same enrichment a fresh post gets —
      // best-effort, never blocks the edit from succeeding.
      fetch(`/api/entries/${entry.id}/analyze`, { method: "POST" }).catch(() => {});
      fetch(`/api/entries/${entry.id}/embed`, { method: "POST" }).catch(() => {});

      onSaved({
        raw_japanese: trimmedJapanese,
        primary_translation: trimmedTranslation,
        formality_level: formality,
        furigana_parsed: furiganaParsed,
        tags,
      });
    } catch (err) {
      setError(errorMessage(err, t("form.errorGeneric")));
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="mt-2 space-y-2.5 rounded-xl bg-ink-bg-secondary p-3 border border-ink-border/70">
      <textarea
        value={rawJapanese}
        onChange={(e) => setRawJapanese(e.target.value)}
        rows={2}
        maxLength={500}
        className="w-full resize-none rounded-lg border-none bg-ink-bg-input px-3 py-2 font-jp text-base text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
      />
      <input
        value={translation}
        onChange={(e) => setTranslation(e.target.value)}
        maxLength={300}
        className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
      />
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <FormalitySelect value={formality} onChange={setFormality} />
        <input
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder={t("form.tagsPlaceholder")}
          className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
      </div>
      {error && <p className="text-xs text-ink-red">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="btn-chunky rounded-xl bg-ink-accent px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
        >
          {saving ? t("settings.saving") : t("card.saveEdit")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl px-4 py-2 text-xs font-semibold text-ink-text-muted hover:bg-ink-bg-hover"
        >
          {t("card.cancel")}
        </button>
      </div>
    </form>
  );
}

"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FormalityLevel, KuromojiToken } from "@/types/database";
import TokenizedText from "@/components/TokenizedText";
import FormalitySelect from "@/components/FormalitySelect";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import Avatar from "@/components/Avatar";

export default function EntryForm({
  userId,
  username,
  avatarUrl,
  onCreated,
}: {
  userId: string;
  username?: string | null;
  avatarUrl?: string | null;
  onCreated?: () => void;
}) {
  const { t } = useLocale();
  const [rawJapanese, setRawJapanese] = useState("");
  const [translation, setTranslation] = useState("");
  const [formality, setFormality] = useState<FormalityLevel>("Teineigo");
  const [tagsInput, setTagsInput] = useState("");
  const [tokens, setTokens] = useState<KuromojiToken[]>([]);
  const [tokenizing, setTokenizing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleTokenize() {
    const text = rawJapanese.trim();
    if (!text) return;
    setTokenizing(true);
    setError(null);
    try {
      const res = await fetch("/api/tokenize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Tokenization failed.");
      setTokens(data.tokens);
    } catch (err) {
      setError(errorMessage(err, "Could not reach the tokenizer."));
    } finally {
      setTokenizing(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedJapanese = rawJapanese.trim();
    const trimmedTranslation = translation.trim();

    if (!trimmedJapanese) {
      setError(t("form.errorEmptyJapanese"));
      return;
    }
    if (!/[぀-ヿ一-龯]/.test(trimmedJapanese)) {
      setError(t("form.errorNotJapanese"));
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

    setSubmitting(true);
    try {
      let finalTokens = tokens;
      if (!finalTokens.length) {
        const res = await fetch("/api/tokenize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: trimmedJapanese }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Tokenization failed.");
        finalTokens = data.tokens;
      }

      const tags = tagsInput
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .slice(0, 8);

      const supabase = createClient();
      const { data: inserted, error: insertError } = await supabase
        .from("context_entries")
        .insert({
          user_id: userId,
          raw_japanese: trimmedJapanese,
          primary_translation: trimmedTranslation,
          formality_level: formality,
          furigana_parsed: finalTokens,
          tags,
        })
        .select("id")
        .single();

      if (insertError) throw insertError;

      // Phase 2 enrichment (Groq classification, embeddings) — best-effort,
      // never blocks the post from succeeding. No-ops server-side if the
      // relevant API keys aren't configured.
      if (inserted?.id) {
        fetch(`/api/entries/${inserted.id}/analyze`, { method: "POST" }).catch(() => {});
        fetch(`/api/entries/${inserted.id}/embed`, { method: "POST" }).catch(() => {});
      }

      setRawJapanese("");
      setTranslation("");
      setTagsInput("");
      setTokens([]);
      onCreated?.();
    } catch (err) {
      setError(errorMessage(err, t("form.errorGeneric")));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5"
    >
      <div className="mb-4 flex items-center gap-2.5">
        <Avatar username={username ?? "user"} avatarUrl={avatarUrl} size={36} />
        <h2 className="font-display text-base font-bold text-ink-text-header">{t("form.heading")}</h2>
      </div>

      <div className="mb-3">
        <label htmlFor="raw_japanese" className="mb-1 block text-xs font-medium text-ink-text-muted">
          {t("form.rawLabel")}
        </label>
        <textarea
          id="raw_japanese"
          value={rawJapanese}
          onChange={(e) => {
            setRawJapanese(e.target.value);
            setTokens([]);
          }}
          onBlur={handleTokenize}
          rows={2}
          maxLength={500}
          placeholder="例：お先に失礼します"
          className="w-full resize-none rounded-lg border-none bg-ink-bg-input px-3 py-2 font-jp text-base text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
        {tokenizing && <p className="mt-1 text-xs text-ink-text-muted">{t("form.tokenizing")}</p>}
        {!!tokens.length && (
          <div className="mt-2 rounded-lg bg-ink-bg-input p-2">
            <TokenizedText tokens={tokens} />
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="translation" className="mb-1 block text-xs font-medium text-ink-text-muted">
          {t("form.translationLabel")}
        </label>
        <input
          id="translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          maxLength={300}
          placeholder={t("form.translationPlaceholder")}
          className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="formality" className="mb-1 block text-xs font-medium text-ink-text-muted">
            {t("form.formalityLabel")}
          </label>
          <FormalitySelect id="formality" value={formality} onChange={setFormality} />
        </div>
        <div>
          <label htmlFor="tags" className="mb-1 block text-xs font-medium text-ink-text-muted">
            {t("form.tagsLabel")}
          </label>
          <input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder={t("form.tagsPlaceholder")}
            className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
          />
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-ink-red/10 px-3 py-2 text-sm text-ink-red">{error}</p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="btn-chunky w-full rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-white disabled:opacity-60 sm:w-auto"
      >
        {submitting ? t("form.submitting") : t("form.submit")}
      </button>
    </form>
  );
}

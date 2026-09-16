"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FormalityLevel, KuromojiToken } from "@/types/database";
import TokenizedText from "@/components/TokenizedText";
import FormalitySelect from "@/components/FormalitySelect";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/Toast";
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
  const { showToast } = useToast();
  const [rawJapanese, setRawJapanese] = useState("");
  const [translation, setTranslation] = useState("");
  const [formality, setFormality] = useState<FormalityLevel>("Teineigo");
  const [tagsInput, setTagsInput] = useState("");
  const [tokens, setTokens] = useState<KuromojiToken[]>([]);
  const [tokenizing, setTokenizing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [suggestedTags, setSuggestedTags] = useState<string[]>([]);
  const [translationDraft, setTranslationDraft] = useState<string | null>(null);
  const [duplicates, setDuplicates] = useState<
    { id: string; raw_japanese: string; primary_translation: string }[]
  >([]);
  const [duplicatesDismissed, setDuplicatesDismissed] = useState(false);

  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrError, setOcrError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Collapsed by default — a full multi-field form sitting above the feed
  // on every single visit was the single biggest thing pushing real content
  // (other people's posts) below the fold. Expands into the full form on
  // demand, like a Twitter/Facebook-style compose trigger.
  const [expanded, setExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (expanded) textareaRef.current?.focus();
  }, [expanded]);

  async function handlePhotoSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file later
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setOcrError(t("form.ocrErrorType"));
      return;
    }
    if (file.size > 4_000_000) {
      setOcrError(t("form.ocrErrorSize"));
      return;
    }

    setOcrError(null);
    setOcrLoading(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

      const res = await fetch("/api/entries/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't read that photo.");

      const combined = rawJapanese.trim() ? `${rawJapanese.trim()}\n${data.text}` : data.text;
      setRawJapanese(combined);
      setTokens([]);
      await handleTokenize(combined);
      await handleAssist(combined);
    } catch (err) {
      setOcrError(errorMessage(err, t("form.ocrErrorGeneric")));
    } finally {
      setOcrLoading(false);
    }
  }

  async function handleTokenize(overrideText?: string) {
    const text = (overrideText ?? rawJapanese).trim();
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

  // Fires alongside tokenization on blur — best-effort AI assist (tag
  // suggestions, a translation draft, a "similar entries exist" nudge).
  // Never blocks or surfaces errors; the compose flow works identically
  // without it.
  async function handleAssist(overrideText?: string) {
    const text = (overrideText ?? rawJapanese).trim();
    if (!text) return;
    setSuggestedTags([]);
    setTranslationDraft(null);
    setDuplicates([]);
    setDuplicatesDismissed(false);
    try {
      const res = await fetch("/api/entries/assist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rawJapanese: text, hasTranslation: !!translation.trim() }),
      });
      if (!res.ok) return;
      const data = await res.json();
      setSuggestedTags(data.suggestedTags ?? []);
      setTranslationDraft(data.translationDraft ?? null);
      setDuplicates(data.duplicates ?? []);
    } catch {
      // Silent — this is a nice-to-have, not a required step.
    }
  }

  function addSuggestedTag(tag: string) {
    const current = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (current.includes(tag)) return;
    setTagsInput([...current, tag].join(", "));
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
      setSuggestedTags([]);
      setTranslationDraft(null);
      setDuplicates([]);
      setDuplicatesDismissed(false);
      setExpanded(false);
      showToast(t("toast.posted"));
      onCreated?.();
    } catch (err) {
      setError(errorMessage(err, t("form.errorGeneric")));
    } finally {
      setSubmitting(false);
    }
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className="flex w-full items-center gap-2.5 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm text-left transition hover:border-ink-accent/40"
      >
        <Avatar username={username ?? "user"} avatarUrl={avatarUrl} size={36} />
        <span className="min-w-0 flex-1 truncate rounded-full bg-ink-bg-input px-4 py-2.5 text-sm text-ink-text-muted">
          {t("form.composePlaceholder")}
        </span>
      </button>
    );
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
        <div className="mb-1 flex items-center justify-between">
          <label htmlFor="raw_japanese" className="block text-xs font-medium text-ink-text-muted">
            {t("form.rawLabel")}
          </label>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={ocrLoading}
            className="flex items-center gap-1 text-xs font-semibold text-ink-text-link hover:underline disabled:opacity-60"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 8a2 2 0 0 1 2-2h1.5l1-1.5h7l1 1.5H18a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8Z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            {ocrLoading ? t("form.ocrReading") : t("form.ocrFromPhoto")}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoSelected}
            className="hidden"
          />
        </div>
        <textarea
          id="raw_japanese"
          ref={textareaRef}
          value={rawJapanese}
          onChange={(e) => {
            setRawJapanese(e.target.value);
            setTokens([]);
          }}
          onBlur={() => {
            handleTokenize();
            handleAssist();
          }}
          rows={2}
          maxLength={500}
          placeholder="例：お先に失礼します"
          className="w-full resize-none rounded-lg border-none bg-ink-bg-input px-3 py-2 font-jp text-base text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
        {ocrError && <p className="mt-1 text-xs text-ink-red">{ocrError}</p>}
        {tokenizing && <p className="mt-1 text-xs text-ink-text-muted">{t("form.tokenizing")}</p>}
        {!!tokens.length && (
          <div className="mt-2 rounded-lg bg-ink-bg-input p-2">
            <TokenizedText tokens={tokens} />
          </div>
        )}
        {!!duplicates.length && !duplicatesDismissed && (
          <div className="mt-2 rounded-lg bg-ink-yellow/15 p-2.5 text-xs">
            <div className="flex items-start justify-between gap-2">
              <p className="font-semibold text-ink-text-header">{t("form.duplicatesTitle")}</p>
              <button
                type="button"
                onClick={() => setDuplicatesDismissed(true)}
                className="flex-none text-ink-text-muted hover:text-ink-text"
                aria-label={t("card.cancel")}
              >
                ✕
              </button>
            </div>
            <ul className="mt-1 space-y-1">
              {duplicates.map((d) => (
                <li key={d.id}>
                  <a href={`/entries/${d.id}`} target="_blank" rel="noreferrer" className="text-ink-text-link hover:underline">
                    {d.raw_japanese} — {d.primary_translation}
                  </a>
                </li>
              ))}
            </ul>
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
        {translationDraft && !translation.trim() && (
          <button
            type="button"
            onClick={() => {
              setTranslation(translationDraft);
              setTranslationDraft(null);
            }}
            className="mt-1.5 w-full rounded-lg bg-ink-accent/10 px-3 py-2 text-left text-xs text-ink-text transition hover:bg-ink-accent/20"
          >
            <span className="font-semibold text-ink-accent">{t("form.aiDraftLabel")}</span> {translationDraft}
          </button>
        )}
      </div>

      <div className="mb-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
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
          {!!suggestedTags.length && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {suggestedTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addSuggestedTag(tag)}
                  className="rounded-full bg-ink-accent/10 px-2 py-0.5 text-xs text-ink-accent transition hover:bg-ink-accent/20"
                >
                  + {tag}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {error && (
        <p className="mb-3 rounded-md bg-ink-red/10 px-3 py-2 text-sm text-ink-red">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="btn-chunky rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {submitting ? t("form.submitting") : t("form.submit")}
        </button>
        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="rounded-2xl px-6 py-3 text-sm font-semibold text-ink-text-muted transition hover:bg-ink-bg-hover"
        >
          {t("card.cancel")}
        </button>
      </div>
    </form>
  );
}

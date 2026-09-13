"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { FormalityLevel, KuromojiToken } from "@/types/database";
import TokenizedText from "@/components/TokenizedText";

const FORMALITY_LEVELS: FormalityLevel[] = [
  "Sonkeigo",
  "Kenjougo",
  "Teineigo",
  "Casual",
  "Slang",
  "Dialect",
];

export default function EntryForm({
  userId,
  onCreated,
}: {
  userId: string;
  onCreated?: () => void;
}) {
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
      setError(err instanceof Error ? err.message : "Could not reach the tokenizer.");
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
      setError("Enter the Japanese sentence.");
      return;
    }
    if (!/[぀-ヿ一-龯]/.test(trimmedJapanese)) {
      setError("That doesn't look like Japanese text — include kana or kanji.");
      return;
    }
    if (!trimmedTranslation) {
      setError("Add a primary translation so others understand the meaning.");
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
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 8);

      const supabase = createClient();
      const { error: insertError } = await supabase.from("context_entries").insert({
        user_id: userId,
        raw_japanese: trimmedJapanese,
        primary_translation: trimmedTranslation,
        formality_level: formality,
        furigana_parsed: finalTokens,
        tags,
      });

      if (insertError) throw insertError;

      setRawJapanese("");
      setTranslation("");
      setTagsInput("");
      setTokens([]);
      onCreated?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the entry. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5"
    >
      <h2 className="mb-3 text-sm font-semibold text-ink">Add a Japanese sentence</h2>

      <div className="mb-3">
        <label htmlFor="raw_japanese" className="mb-1 block text-xs font-medium text-slate-muted">
          Raw Japanese text
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
          className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 font-jp text-base focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {tokenizing && <p className="mt-1 text-xs text-slate-muted">Tokenizing…</p>}
        {!!tokens.length && (
          <div className="mt-2 rounded-lg bg-slate-50 p-2">
            <TokenizedText tokens={tokens} />
          </div>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="translation" className="mb-1 block text-xs font-medium text-slate-muted">
          Primary translation
        </label>
        <input
          id="translation"
          value={translation}
          onChange={(e) => setTranslation(e.target.value)}
          maxLength={300}
          placeholder="Excuse me for leaving before you"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
      </div>

      <div className="mb-3 grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="formality" className="mb-1 block text-xs font-medium text-slate-muted">
            Formality register
          </label>
          <select
            id="formality"
            value={formality}
            onChange={(e) => setFormality(e.target.value as FormalityLevel)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          >
            {FORMALITY_LEVELS.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tags" className="mb-1 block text-xs font-medium text-slate-muted">
            Tags (comma separated)
          </label>
          <input
            id="tags"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="anime, workplace"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
          />
        </div>
      </div>

      {error && <p className="mb-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60 sm:w-auto"
      >
        {submitting ? "Posting…" : "Post entry"}
      </button>
    </form>
  );
}

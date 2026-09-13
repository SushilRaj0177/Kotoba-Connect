"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry, TokenAnnotation } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import TokenizedText from "@/components/TokenizedText";
import EmptyState from "@/components/EmptyState";

export default function EntryDetail({
  entry,
  userId,
}: {
  entry: ContextEntry;
  userId: string | null;
}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<TokenAnnotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("token_annotations")
        .select("*, profiles(username, avatar_url)")
        .eq("entry_id", entry.id)
        .order("created_at", { ascending: true });
      setAnnotations((data ?? []) as TokenAnnotation[]);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`annotations_${entry.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "token_annotations", filter: `entry_id=eq.${entry.id}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entry.id]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (activeIndex === null) {
      setError("Click a word token above to pin your note to it.");
      return;
    }
    if (!note.trim()) {
      setError("Nuance note can't be empty.");
      return;
    }
    if (!userId) {
      setError("Sign in to add an annotation.");
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("token_annotations").insert({
      entry_id: entry.id,
      user_id: userId,
      token_index: activeIndex,
      nuance_note: note.trim(),
      cultural_context: culturalContext.trim() || null,
    });

    if (insertError) {
      setError("Could not save the annotation. Try again.");
    } else {
      setNote("");
      setCulturalContext("");
    }
    setSubmitting(false);
  }

  const activeAnnotations = annotations.filter((a) => a.token_index === activeIndex);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-2 flex items-start justify-between gap-2">
          <TokenizedText
            tokens={entry.furigana_parsed}
            onTokenClick={setActiveIndex}
            activeIndex={activeIndex}
          />
          <FormalityBadge level={entry.formality_level} />
        </div>
        <p className="text-sm text-slate-muted">{entry.primary_translation}</p>
        <p className="mt-2 text-xs text-slate-muted">
          Posted by @{entry.profiles?.username ?? "unknown"} · {entry.upvotes_count} upvotes
        </p>
        <p className="mt-3 text-xs text-slate-muted">
          Click any word above to pin a pragmatic nuance note to that token.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-ink">
          {activeIndex !== null
            ? `Notes on "${entry.furigana_parsed[activeIndex]?.surface_form}"`
            : "Token annotations"}
        </h2>

        {loading ? (
          <p className="text-sm text-slate-muted">Loading annotations…</p>
        ) : activeIndex === null ? (
          <EmptyState
            title="Select a token"
            description="Click a word in the sentence above to see or add nuance notes for it."
          />
        ) : activeAnnotations.length === 0 ? (
          <p className="text-sm text-slate-muted">No notes on this token yet — add the first one.</p>
        ) : (
          <ul className="mb-4 space-y-3">
            {activeAnnotations.map((a) => (
              <li key={a.id} className="rounded-lg bg-slate-50 p-3">
                <p className="text-sm text-ink">{a.nuance_note}</p>
                {a.cultural_context && (
                  <p className="mt-1 text-xs text-slate-muted">{a.cultural_context}</p>
                )}
                <p className="mt-1 text-xs text-slate-muted">@{a.profiles?.username ?? "unknown"}</p>
              </li>
            ))}
          </ul>
        )}

        {userId ? (
          <form onSubmit={handleSubmit} className="space-y-2 border-t border-slate-100 pt-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="What does this word/phrase really imply here?"
              className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            <input
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              maxLength={300}
              placeholder="Optional cultural context"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={submitting || activeIndex === null}
              className="rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? "Saving…" : "Add note"}
            </button>
          </form>
        ) : (
          <p className="border-t border-slate-100 pt-3 text-sm text-slate-muted">
            <a href="/login" className="font-semibold text-accent hover:underline">
              Sign in
            </a>{" "}
            to add a note.
          </p>
        )}
      </div>
    </div>
  );
}

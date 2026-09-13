"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry, TokenAnnotation } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import TokenizedText from "@/components/TokenizedText";
import EmptyState from "@/components/EmptyState";
import ReportButton from "@/components/ReportButton";
import AiNuanceCallout from "@/components/AiNuanceCallout";
import Avatar from "@/components/Avatar";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function EntryDetail({
  entry,
  userId,
}: {
  entry: ContextEntry;
  userId: string | null;
}) {
  const { t } = useLocale();
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
    const spam = spamSignal(note) || spamSignal(culturalContext);
    if (spam) {
      setError(spam);
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
      setError(errorMessage(insertError, "Could not save the annotation. Try again."));
    } else {
      setNote("");
      setCulturalContext("");
    }
    setSubmitting(false);
  }

  const activeAnnotations = annotations.filter((a) => a.token_index === activeIndex);
  const username = entry.profiles?.username ?? "unknown";

  return (
    <div className="space-y-4">
      <div className="flex gap-3 rounded-lg bg-discord-bg-secondary p-4 sm:p-5">
        <Avatar username={username} size={40} />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-baseline gap-2">
            <span className="text-sm font-semibold text-discord-text-header">@{username}</span>
            <FormalityBadge level={entry.formality_level} />
          </div>
          <TokenizedText
            tokens={entry.furigana_parsed}
            onTokenClick={setActiveIndex}
            activeIndex={activeIndex}
          />
          <p className="mt-1 text-sm text-discord-text-muted">{entry.primary_translation}</p>
          <AiNuanceCallout
            summary={entry.ai_nuance_summary}
            formalitySuggestion={entry.ai_formality_suggestion}
          />
          <p className="mt-2 text-xs text-discord-text-muted">
            {entry.upvotes_count} {t("detail.upvotes")}
          </p>
          <p className="mt-3 text-xs text-discord-text-muted">{t("detail.clickHint")}</p>
        </div>
      </div>

      <div className="rounded-lg bg-discord-bg-secondary p-4 sm:p-5">
        <h2 className="mb-3 text-sm font-semibold text-discord-text-header">
          {activeIndex !== null
            ? `${t("detail.notesOn")} "${entry.furigana_parsed[activeIndex]?.surface_form}"`
            : t("detail.tokenAnnotations")}
        </h2>

        {loading ? (
          <p className="text-sm text-discord-text-muted">Loading annotations…</p>
        ) : activeIndex === null ? (
          <EmptyState title={t("detail.selectTokenTitle")} description={t("detail.selectTokenDescription")} />
        ) : activeAnnotations.length === 0 ? (
          <p className="text-sm text-discord-text-muted">{t("detail.noNotesYet")}</p>
        ) : (
          <ul className="mb-4 space-y-3">
            {activeAnnotations.map((a) => (
              <li key={a.id} className="flex gap-2.5 rounded-lg bg-discord-bg-input p-3">
                <Avatar username={a.profiles?.username ?? "unknown"} size={28} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-discord-text">{a.nuance_note}</p>
                  {a.cultural_context && (
                    <p className="mt-1 text-xs text-discord-text-muted">{a.cultural_context}</p>
                  )}
                  <div className="mt-1 flex items-center gap-2 text-xs text-discord-text-muted">
                    <span>@{a.profiles?.username ?? "unknown"}</span>
                    <ReportButton targetType="annotation" targetId={a.id} userId={userId} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        {userId ? (
          <form onSubmit={handleSubmit} className="space-y-2 border-t border-discord-border pt-3">
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder={t("detail.notePlaceholder")}
              className="w-full resize-none rounded-lg border-none bg-discord-bg-input px-3 py-2 text-sm text-discord-text placeholder:text-discord-text-muted focus:outline-none focus:ring-2 focus:ring-discord-blurple"
            />
            <input
              value={culturalContext}
              onChange={(e) => setCulturalContext(e.target.value)}
              maxLength={300}
              placeholder={t("detail.contextPlaceholder")}
              className="w-full rounded-lg border-none bg-discord-bg-input px-3 py-2 text-sm text-discord-text placeholder:text-discord-text-muted focus:outline-none focus:ring-2 focus:ring-discord-blurple"
            />
            {error && <p className="text-sm text-discord-red">{error}</p>}
            <button
              type="submit"
              disabled={submitting || activeIndex === null}
              className="rounded-lg bg-discord-blurple px-3 py-2 text-sm font-semibold text-white transition hover:bg-discord-blurple-hover disabled:opacity-60"
            >
              {submitting ? t("detail.saving") : t("detail.addNote")}
            </button>
          </form>
        ) : (
          <p className="border-t border-discord-border pt-3 text-sm text-discord-text-muted">
            <a href="/login" className="font-semibold text-discord-text-link hover:underline">
              {t("detail.signInToAnnotate")}
            </a>{" "}
            {t("detail.signInSuffix")}
          </p>
        )}
      </div>
    </div>
  );
}

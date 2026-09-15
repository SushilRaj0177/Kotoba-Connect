"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry, TokenAnnotation } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import TokenizedText from "@/components/TokenizedText";
import EmptyState from "@/components/EmptyState";
import ReportButton from "@/components/ReportButton";
import EntryComments from "@/components/EntryComments";
import AiNuanceCallout from "@/components/AiNuanceCallout";
import Avatar from "@/components/Avatar";
import UserHandle from "@/components/UserHandle";
import BookmarkButton from "@/components/BookmarkButton";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useEntryChatContext } from "@/components/EntryChatContext";

export default function EntryDetail({
  entry,
  userId,
  bookmarked = false,
}: {
  entry: ContextEntry;
  userId: string | null;
  bookmarked?: boolean;
}) {
  const { t } = useLocale();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<TokenAnnotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setEntry: setChatEntry } = useEntryChatContext();

  useEffect(() => {
    setChatEntry({
      raw_japanese: entry.raw_japanese,
      primary_translation: entry.primary_translation,
      nuance_summary: entry.ai_nuance_summary,
    });
    return () => setChatEntry(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entry.id]);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("token_annotations")
        .select("*, profiles(username, display_name, avatar_url)")
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
  const displayName = entry.profiles?.display_name;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* Main column: the sentence and the discussion — comments are a core
         social feature, so they belong in the primary flow right after the
         entry, not buried below the (secondary, per-word) annotations panel. */}
      <div className="min-w-0 flex-1 space-y-4">
        <div className="flex gap-3 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
          <Avatar username={username} avatarUrl={entry.profiles?.avatar_url} size={40} />
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex flex-wrap items-baseline gap-2">
              <Link href={`/u/${username}`} className="font-display text-sm font-bold text-ink-text-header hover:underline">
                {displayName?.trim() || `@${username}`}
              </Link>
              <FormalityBadge level={entry.formality_level} />
            </div>
            <TokenizedText
              tokens={entry.furigana_parsed}
              onTokenClick={setActiveIndex}
              activeIndex={activeIndex}
            />
            <p className="mt-1 text-sm text-ink-text-muted">{entry.primary_translation}</p>
            <AiNuanceCallout
              summary={entry.ai_nuance_summary}
              formalitySuggestion={entry.ai_formality_suggestion}
            />
            {!!entry.tags?.length && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {entry.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="rounded-full bg-ink-bg-input px-2 py-0.5 text-xs text-ink-text-muted transition hover:text-ink-accent"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
            <div className="mt-3 flex items-center gap-4 text-xs">
              <span className="text-ink-text-muted">
                {entry.upvotes_count} {t("detail.upvotes")}
              </span>
              <BookmarkButton entryId={entry.id} userId={userId} initialBookmarked={bookmarked} />
              {userId === entry.user_id && <DeleteEntryButton entryId={entry.id} redirectHome />}
            </div>
            <p className="mt-3 text-xs text-ink-text-muted">{t("detail.clickHint")}</p>
          </div>
        </div>

        <EntryComments entryId={entry.id} userId={userId} />
      </div>

      {/* Side column: token annotations — a per-word glossary (click a word
         in the sentence above to pin a note explaining just that word's
         nuance), distinct from the AI's whole-sentence summary and from
         general discussion. Secondary to the conversation, so it lives
         beside it rather than in the way of it. */}
      <div className="w-full flex-none space-y-4 lg:w-80 lg:sticky lg:top-6">
        <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
          <h2 className="mb-3 text-sm font-semibold text-ink-text-header">
            {activeIndex !== null
              ? `${t("detail.notesOn")} "${entry.furigana_parsed[activeIndex]?.surface_form}"`
              : t("detail.tokenAnnotations")}
          </h2>

          {loading ? (
            <p className="text-sm text-ink-text-muted">Loading annotations…</p>
          ) : activeIndex === null ? (
            <EmptyState title={t("detail.selectTokenTitle")} description={t("detail.selectTokenDescription")} />
          ) : activeAnnotations.length === 0 ? (
            <p className="text-sm text-ink-text-muted">{t("detail.noNotesYet")}</p>
          ) : (
            <ul className="mb-4 space-y-3">
              {activeAnnotations.map((a) => (
                <li key={a.id} className="rounded-2xl bg-ink-bg-input p-3">
                  <UserHandle
                    username={a.profiles?.username ?? "unknown"}
                    displayName={a.profiles?.display_name}
                    avatarUrl={a.profiles?.avatar_url}
                    href={`/u/${a.profiles?.username ?? ""}`}
                    size="sm"
                  />
                  <p className="mt-2 text-sm text-ink-text">{a.nuance_note}</p>
                  {a.cultural_context && (
                    <p className="mt-1 text-xs text-ink-text-muted">{a.cultural_context}</p>
                  )}
                  <div className="mt-1.5">
                    <ReportButton targetType="annotation" targetId={a.id} userId={userId} />
                  </div>
                </li>
              ))}
            </ul>
          )}

          {userId ? (
            <form onSubmit={handleSubmit} className="space-y-2 border-t border-ink-border pt-3">
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={500}
                placeholder={t("detail.notePlaceholder")}
                className="w-full resize-none rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
              />
              <input
                value={culturalContext}
                onChange={(e) => setCulturalContext(e.target.value)}
                maxLength={300}
                placeholder={t("detail.contextPlaceholder")}
                className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
              />
              {error && <p className="text-sm text-ink-red">{error}</p>}
              <button
                type="submit"
                disabled={submitting || activeIndex === null}
                className="btn-chunky rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
              >
                {submitting ? t("detail.saving") : t("detail.addNote")}
              </button>
            </form>
          ) : (
            <p className="border-t border-ink-border pt-3 text-sm text-ink-text-muted">
              <a href="/login" className="font-semibold text-ink-text-link hover:underline">
                {t("detail.signInToAnnotate")}
              </a>{" "}
              {t("detail.signInSuffix")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

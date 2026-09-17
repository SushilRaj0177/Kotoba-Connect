"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry, TokenAnnotation } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import TokenizedText from "@/components/TokenizedText";
import EmptyState from "@/components/EmptyState";
import EntryComments from "@/components/EntryComments";
import AiNuanceCallout from "@/components/AiNuanceCallout";
import Avatar from "@/components/Avatar";
import BookmarkButton from "@/components/BookmarkButton";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import EditEntryForm from "@/components/EditEntryForm";
import ShareEntryButton from "@/components/ShareEntryButton";
import LikeButton from "@/components/LikeButton";
import TranslateToggle from "@/components/TranslateToggle";
import AnnotationNote from "@/components/AnnotationNote";
import { useTranslate } from "@/lib/use-translate";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/Toast";
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
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [annotations, setAnnotations] = useState<TokenAnnotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState("");
  const [culturalContext, setCulturalContext] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [liveEntry, setLiveEntry] = useState(entry);
  const { setEntry: setChatEntry } = useEntryChatContext();
  const rawTranslate = useTranslate(liveEntry.raw_japanese);

  useEffect(() => {
    setChatEntry({
      raw_japanese: liveEntry.raw_japanese,
      primary_translation: liveEntry.primary_translation,
      nuance_summary: liveEntry.ai_nuance_summary,
    });
    return () => setChatEntry(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveEntry]);

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
      showToast(t("toast.noteAdded"));
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
        <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
          {/* Avatar sits inline on the name row instead of anchoring a
             full-height left column that would sit empty beside the rest
             of the entry, the annotation hint, and the action row below it. */}
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <Avatar username={username} avatarUrl={entry.profiles?.avatar_url} size={28} />
            <Link href={`/u/${username}`} className="font-display text-sm font-bold text-ink-text-header hover:underline">
              {displayName?.trim() || `@${username}`}
            </Link>
            {entry.profiles?.is_bot && (
              <span className="flex-none rounded-full bg-ink-accent/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-accent">
                {t("card.bot")}
              </span>
            )}
            <FormalityBadge level={liveEntry.formality_level} />
          </div>

          <div className="min-w-0">
            {editing ? (
              <EditEntryForm
                entry={liveEntry}
                onCancel={() => setEditing(false)}
                onSaved={(patch) => {
                  setLiveEntry((prev) => ({ ...prev, ...patch }));
                  setEditing(false);
                  setActiveIndex(null); // token indices may have shifted after re-tokenizing
                }}
              />
            ) : (
              <>
                {/* Showing the on-demand translation swaps out the
                   interactive per-word view (clicking a word to annotate
                   it doesn't make sense once it's not the original
                   Japanese on screen) rather than appending below it. */}
                {rawTranslate.showingTranslation && rawTranslate.translation ? (
                  <p className="text-lg leading-loose text-ink-text-header">{rawTranslate.translation}</p>
                ) : (
                  <TokenizedText
                    tokens={liveEntry.furigana_parsed}
                    onTokenClick={setActiveIndex}
                    activeIndex={activeIndex}
                  />
                )}
                <p className="mt-1 text-sm text-ink-text-muted">{liveEntry.primary_translation}</p>
                {/* Entries are always Japanese — only useful to translate
                   when viewing the EN UI, otherwise it's Japanese to
                   Japanese. */}
                {locale === "en" && <TranslateToggle state={rawTranslate} className="mt-1" />}
                <AiNuanceCallout
                  summary={liveEntry.ai_nuance_summary}
                  formalitySuggestion={liveEntry.ai_formality_suggestion}
                />
                {!!liveEntry.tags?.length && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {liveEntry.tags.map((tag) => (
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
                <div className="mt-3 flex flex-wrap items-center gap-0.5">
                  <LikeButton
                    entryId={entry.id}
                    currentUserId={userId}
                    initialCount={liveEntry.upvotes_count}
                    initialVoted={!!liveEntry.has_voted}
                  />
                  <BookmarkButton entryId={entry.id} userId={userId} initialBookmarked={bookmarked} />
                  <ShareEntryButton entryId={entry.id} rawJapanese={liveEntry.raw_japanese} />
                  {userId === entry.user_id && (
                    <>
                      <button
                        type="button"
                        onClick={() => setEditing(true)}
                        title={t("card.edit")}
                        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-text"
                      >
                        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                      </button>
                      <DeleteEntryButton entryId={entry.id} redirectHome />
                    </>
                  )}
                </div>
                <p className="mt-3 text-xs text-ink-text-muted">{t("detail.clickHint")}</p>
              </>
            )}
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
              ? `${t("detail.notesOn")} "${liveEntry.furigana_parsed[activeIndex]?.surface_form}"`
              : t("detail.tokenAnnotations")}
          </h2>

          {loading ? (
            <p className="text-sm text-ink-text-muted">Loading annotations…</p>
          ) : activeIndex === null ? (
            <EmptyState title={t("detail.selectTokenTitle")} description={t("detail.selectTokenDescription")} bare />
          ) : activeAnnotations.length === 0 ? (
            <p className="text-sm text-ink-text-muted">{t("detail.noNotesYet")}</p>
          ) : (
            <ul className="mb-4 space-y-3">
              {activeAnnotations.map((a) => (
                <AnnotationNote key={a.id} annotation={a} userId={userId} />
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

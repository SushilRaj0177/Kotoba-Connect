"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EntryComment } from "@/types/database";
import UserHandle from "@/components/UserHandle";
import ReportButton from "@/components/ReportButton";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useBlockedIds } from "@/lib/use-blocked-ids";

export default function EntryComments({
  entryId,
  userId,
  embedded = false,
}: {
  entryId: string;
  userId: string | null;
  // When nested inside another card (e.g. an inline thread on a feed card),
  // the default bg-ink-bg-secondary card styling would sit at the exact
  // same shade as its parent and blend in with no visible separation —
  // swap to an inset ink-bg-input surface instead, same pattern used for
  // AiNuanceCallout nested inside cards elsewhere.
  embedded?: boolean;
}) {
  const { t } = useLocale();
  const [comments, setComments] = useState<EntryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const blockedIds = useBlockedIds(userId);
  const visibleComments = comments.filter((c) => !blockedIds.has(c.user_id));

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("entry_comments")
        .select("*, profiles(username, display_name, avatar_url)")
        .eq("entry_id", entryId)
        .order("created_at", { ascending: true });
      setComments((data ?? []) as EntryComment[]);
      setLoading(false);
    }
    load();

    const channel = supabase
      .channel(`comments_${entryId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entry_comments", filter: `entry_id=eq.${entryId}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [entryId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = body.trim();
    if (!trimmed) return;
    if (!userId) {
      setError("Sign in to comment.");
      return;
    }
    const spam = spamSignal(trimmed);
    if (spam) {
      setError(spam);
      return;
    }

    setSubmitting(true);
    const supabase = createClient();
    const { error: insertError } = await supabase.from("entry_comments").insert({
      entry_id: entryId,
      user_id: userId,
      body: trimmed,
    });

    if (insertError) {
      setError(errorMessage(insertError, "Could not post the comment. Try again."));
    } else {
      setBody("");
    }
    setSubmitting(false);
  }

  async function handleDelete(commentId: string) {
    const supabase = createClient();
    await supabase.from("entry_comments").delete().eq("id", commentId);
  }

  return (
    <div
      className={
        embedded
          ? "rounded-lg bg-ink-bg-input p-3"
          : "rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5"
      }
    >
      <h2 className="mb-3 text-sm font-semibold text-ink-text-header">
        {t("comments.title")} {visibleComments.length > 0 && `(${visibleComments.length})`}
      </h2>

      {loading ? (
        <p className="text-sm text-ink-text-muted">…</p>
      ) : visibleComments.length === 0 ? (
        <p className="text-sm text-ink-text-muted">{t("comments.empty")}</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {visibleComments.map((c) => (
            <li key={c.id} className={`rounded-2xl p-3 ${embedded ? "bg-ink-bg-secondary" : "bg-ink-bg-input"}`}>
              <div className="flex items-center justify-between">
                <UserHandle
                  username={c.profiles?.username ?? "unknown"}
                  displayName={c.profiles?.display_name}
                  avatarUrl={c.profiles?.avatar_url}
                  href={`/u/${c.profiles?.username ?? ""}`}
                  size="sm"
                />
                <span className="text-xs text-ink-text-muted">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-text">{c.body}</p>
              <div className="mt-1.5 flex items-center gap-0.5">
                <ReportButton targetType="comment" targetId={c.id} userId={userId} />
                {userId === c.user_id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    title={t("comments.delete")}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-red"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 6h18" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {userId ? (
        <form onSubmit={handleSubmit} className="space-y-2 border-t border-ink-border pt-3">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={2}
            maxLength={1000}
            placeholder={t("comments.placeholder")}
            className={`w-full resize-none rounded-lg border-none px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent ${
              embedded ? "bg-ink-bg-secondary" : "bg-ink-bg-input"
            }`}
          />
          {error && <p className="text-sm text-ink-red">{error}</p>}
          <button
            type="submit"
            disabled={submitting || !body.trim()}
            className="btn-chunky rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {submitting ? t("comments.posting") : t("comments.post")}
          </button>
        </form>
      ) : (
        <p className="border-t border-ink-border pt-3 text-sm text-ink-text-muted">
          <a href="/login" className="font-semibold text-ink-text-link hover:underline">
            {t("comments.signInToComment")}
          </a>{" "}
          {t("comments.signInSuffix")}
        </p>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { EntryComment } from "@/types/database";
import UserHandle from "@/components/UserHandle";
import ReportButton from "@/components/ReportButton";
import { spamSignal } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function EntryComments({ entryId, userId }: { entryId: string; userId: string | null }) {
  const { t } = useLocale();
  const [comments, setComments] = useState<EntryComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();

    async function load() {
      setLoading(true);
      const { data } = await supabase
        .from("entry_comments")
        .select("*, profiles(username, avatar_url)")
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
    <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="mb-3 text-sm font-semibold text-ink-text-header">
        {t("comments.title")} {comments.length > 0 && `(${comments.length})`}
      </h2>

      {loading ? (
        <p className="text-sm text-ink-text-muted">…</p>
      ) : comments.length === 0 ? (
        <p className="text-sm text-ink-text-muted">{t("comments.empty")}</p>
      ) : (
        <ul className="mb-4 space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-2xl bg-ink-bg-input p-3">
              <div className="flex items-center justify-between">
                <UserHandle username={c.profiles?.username ?? "unknown"} href={`/u/${c.profiles?.username ?? ""}`} size="sm" />
                <span className="text-xs text-ink-text-muted">
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-ink-text">{c.body}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <ReportButton targetType="comment" targetId={c.id} userId={userId} />
                {userId === c.user_id && (
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="rounded px-2 py-1 text-xs font-semibold text-ink-text-muted transition hover:text-ink-red"
                  >
                    {t("comments.delete")}
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
            className="w-full resize-none rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
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

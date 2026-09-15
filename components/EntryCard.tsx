"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import ReportButton from "@/components/ReportButton";
import AiNuanceCallout from "@/components/AiNuanceCallout";
import Avatar from "@/components/Avatar";
import BookmarkButton from "@/components/BookmarkButton";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function EntryCard({
  entry,
  currentUserId,
  bookmarked = false,
}: {
  entry: ContextEntry;
  currentUserId: string | null;
  bookmarked?: boolean;
}) {
  const { t } = useLocale();
  const [hasVoted, setHasVoted] = useState(!!entry.has_voted);
  const [count, setCount] = useState(entry.upvotes_count);
  const [voting, setVoting] = useState(false);

  async function handleVote() {
    if (!currentUserId || voting) return;
    setVoting(true);

    // Optimistic update — reconciled by the realtime subscription on the parent list.
    const nextVoted = !hasVoted;
    setHasVoted(nextVoted);
    setCount((c) => c + (nextVoted ? 1 : -1));

    const supabase = createClient();
    const { error } = await supabase.rpc("toggle_entry_upvote", { p_entry_id: entry.id });

    if (error) {
      setHasVoted(!nextVoted);
      setCount((c) => c + (nextVoted ? -1 : 1));
    }
    setVoting(false);
  }

  const username = entry.profiles?.username ?? "unknown";
  const displayName = entry.profiles?.display_name;
  const avatarUrl = entry.profiles?.avatar_url;
  const timestamp = new Date(entry.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="flex gap-3 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
      <Avatar username={username} avatarUrl={avatarUrl} size={40} />

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-baseline gap-2">
          <Link
            href={`/u/${username}`}
            className="font-display text-sm font-bold text-ink-text-header hover:underline"
          >
            {displayName?.trim() || `@${username}`}
          </Link>
          <span className="text-xs text-ink-text-muted">{timestamp}</span>
          <FormalityBadge level={entry.formality_level} />
        </div>

        <Link href={`/entries/${entry.id}`} className="block min-w-0">
          <p className="font-jp text-lg leading-loose text-ink-text-header">{entry.raw_japanese}</p>
        </Link>

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
          <button
            type="button"
            onClick={handleVote}
            disabled={!currentUserId || voting}
            title={currentUserId ? t("card.upvote") : t("card.signInToVote")}
            className={`flex items-center gap-1.5 font-bold transition active:scale-90 ${
              hasVoted ? "text-ink-accent" : "text-ink-text-muted hover:text-ink-text"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill={hasVoted ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.4-1.2 5 .1 7.4 3 2.4-2.9 5-4.2 7.4-3 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
            </svg>
            {count}
          </button>
          <Link
            href={`/entries/${entry.id}`}
            className="font-medium text-ink-text-link hover:underline"
          >
            {t("card.annotate")}
          </Link>
          <BookmarkButton entryId={entry.id} userId={currentUserId} initialBookmarked={bookmarked} />
          <ReportButton targetType="entry" targetId={entry.id} userId={currentUserId} />
          {currentUserId === entry.user_id && <DeleteEntryButton entryId={entry.id} />}
        </div>
      </div>
    </article>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import TokenizedText from "@/components/TokenizedText";
import ReportButton from "@/components/ReportButton";
import AiNuanceCallout from "@/components/AiNuanceCallout";
import Avatar from "@/components/Avatar";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function EntryCard({
  entry,
  currentUserId,
}: {
  entry: ContextEntry;
  currentUserId: string | null;
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
  const timestamp = new Date(entry.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="flex gap-3 rounded-lg bg-ink-bg-secondary p-3.5">
      <Avatar username={username} size={40} />

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold text-ink-text-header">@{username}</span>
          <span className="text-xs text-ink-text-muted">{timestamp}</span>
          <FormalityBadge level={entry.formality_level} />
        </div>

        <Link href={`/entries/${entry.id}`} className="block min-w-0">
          <TokenizedText tokens={entry.furigana_parsed} />
        </Link>

        <p className="mt-1 text-sm text-ink-text-muted">{entry.primary_translation}</p>

        <AiNuanceCallout
          summary={entry.ai_nuance_summary}
          formalitySuggestion={entry.ai_formality_suggestion}
        />

        {!!entry.tags?.length && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ink-bg-input px-2 py-0.5 text-xs text-ink-text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        <div className="mt-2.5 flex items-center gap-4 text-xs">
          <button
            type="button"
            onClick={handleVote}
            disabled={!currentUserId || voting}
            title={currentUserId ? t("card.upvote") : t("card.signInToVote")}
            className={`flex items-center gap-1 font-semibold transition ${
              hasVoted ? "text-ink-accent" : "text-ink-text-muted hover:text-ink-text"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            ▲ {count}
          </button>
          <Link
            href={`/entries/${entry.id}`}
            className="font-medium text-ink-text-link hover:underline"
          >
            {t("card.annotate")}
          </Link>
          <ReportButton targetType="entry" targetId={entry.id} userId={currentUserId} />
        </div>
      </div>
    </article>
  );
}

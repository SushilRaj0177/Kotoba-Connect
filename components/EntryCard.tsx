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
    <article className="group relative flex gap-3 rounded-lg px-3 py-2.5 transition hover:bg-discord-bg-secondary">
      <Avatar username={username} size={40} />

      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex flex-wrap items-baseline gap-2">
          <span className="text-sm font-semibold text-discord-text-header">@{username}</span>
          <span className="text-xs text-discord-text-muted">{timestamp}</span>
          <FormalityBadge level={entry.formality_level} />
        </div>

        <Link href={`/entries/${entry.id}`} className="block min-w-0">
          <TokenizedText tokens={entry.furigana_parsed} />
        </Link>

        <p className="mt-1 text-sm text-discord-text-muted">{entry.primary_translation}</p>

        <AiNuanceCallout
          summary={entry.ai_nuance_summary}
          formalitySuggestion={entry.ai_formality_suggestion}
        />

        {!!entry.tags?.length && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {entry.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-discord-bg-input px-2 py-0.5 text-xs text-discord-text-muted"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Discord-style hover toolbar: floats over the top-right corner of the
          row on desktop; stays visible on touch screens, where hover doesn't exist. */}
      <div className="absolute -top-3 right-3 flex items-center gap-0.5 rounded-md border border-discord-border bg-discord-bg-secondary p-0.5 opacity-100 shadow-lg transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
        <button
          type="button"
          onClick={handleVote}
          disabled={!currentUserId || voting}
          title={currentUserId ? t("card.upvote") : t("card.signInToVote")}
          className={`flex items-center gap-1 rounded px-2 py-1 text-xs font-semibold transition ${
            hasVoted ? "text-discord-blurple" : "text-discord-text-muted hover:text-discord-text"
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          ▲ {count}
        </button>
        <Link
          href={`/entries/${entry.id}`}
          title={t("card.annotate")}
          className="rounded px-2 py-1 text-xs font-semibold text-discord-text-muted transition hover:text-discord-text"
        >
          #
        </Link>
        <ReportButton targetType="entry" targetId={entry.id} userId={currentUserId} />
      </div>
    </article>
  );
}

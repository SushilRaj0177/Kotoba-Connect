"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import TokenizedText from "@/components/TokenizedText";
import ReportButton from "@/components/ReportButton";
import AiNuanceCallout from "@/components/AiNuanceCallout";

export default function EntryCard({
  entry,
  currentUserId,
}: {
  entry: ContextEntry;
  currentUserId: string | null;
}) {
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

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5">
      <div className="mb-2 flex items-start justify-between gap-2">
        <Link href={`/entries/${entry.id}`} className="min-w-0">
          <TokenizedText tokens={entry.furigana_parsed} />
        </Link>
        <FormalityBadge level={entry.formality_level} />
      </div>

      <p className="mb-3 text-sm text-slate-muted">{entry.primary_translation}</p>

      <AiNuanceCallout
        summary={entry.ai_nuance_summary}
        formalitySuggestion={entry.ai_formality_suggestion}
      />

      {!!entry.tags?.length && (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {entry.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-muted"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between text-xs text-slate-muted">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleVote}
            disabled={!currentUserId || voting}
            title={currentUserId ? "Upvote" : "Sign in to upvote"}
            className={`flex items-center gap-1 rounded-full border px-2.5 py-1 font-semibold transition ${
              hasVoted
                ? "border-accent bg-blue-50 text-accent"
                : "border-slate-200 text-ink hover:bg-slate-50"
            } disabled:cursor-not-allowed disabled:opacity-50`}
          >
            ▲ {count}
          </button>
          <span>@{entry.profiles?.username ?? "unknown"}</span>
          <ReportButton targetType="entry" targetId={entry.id} userId={currentUserId} />
        </div>
        <Link href={`/entries/${entry.id}`} className="font-medium text-accent hover:underline">
          Annotate tokens →
        </Link>
      </div>
    </article>
  );
}

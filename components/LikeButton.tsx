"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useVoteState } from "@/lib/use-entry-interaction";

// Shared by EntryCard and EntryDetail so the like/vote toggle behaves
// identically everywhere it appears — previously EntryDetail only showed
// the count as static text with no way to actually like from the entry's
// own page, only from the board card.
export default function LikeButton({
  entryId,
  currentUserId,
  initialCount,
  initialVoted,
}: {
  entryId: string;
  currentUserId: string | null;
  initialCount: number;
  initialVoted: boolean;
}) {
  const { t } = useLocale();
  // hasVoted/count live in a shared cross-instance store (see
  // use-entry-interaction) instead of local state, so liking this entry
  // here instantly updates every other rendered copy of it — including
  // ones on a page you haven't navigated to yet.
  const [{ hasVoted, count }, updateVote] = useVoteState(entryId, {
    hasVoted: initialVoted,
    count: initialCount,
  });
  const [voting, setVoting] = useState(false);
  // Drives a one-shot pop animation on the icon at the moment it's liked —
  // reset back to false right after so it can play again on a future like.
  const [justVoted, setJustVoted] = useState(false);

  async function handleVote() {
    if (!currentUserId || voting) return;
    setVoting(true);

    const nextVoted = !hasVoted;
    updateVote((current) => ({ hasVoted: nextVoted, count: current.count + (nextVoted ? 1 : -1) }));
    if (nextVoted) {
      setJustVoted(true);
      setTimeout(() => setJustVoted(false), 350);
    }

    const supabase = createClient();
    const { error } = await supabase.rpc("toggle_entry_upvote", { p_entry_id: entryId });

    if (error) {
      updateVote((current) => ({ hasVoted: !nextVoted, count: current.count + (nextVoted ? -1 : 1) }));
    }
    setVoting(false);
  }

  return (
    <button
      type="button"
      onClick={handleVote}
      disabled={!currentUserId || voting}
      title={currentUserId ? t("card.upvote") : t("card.signInToVote")}
      className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition active:scale-90 ${
        hasVoted ? "text-ink-accent" : "text-ink-text-muted hover:bg-ink-bg-hover hover:text-ink-text"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill={hasVoted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        className={justVoted ? "animate-like-pop" : ""}
      >
        <path d="M12 21s-6.7-4.35-9.3-8.1C1 10.1 1.6 6.6 4.6 5.1c2.4-1.2 5 .1 7.4 3 2.4-2.9 5-4.2 7.4-3 3 1.5 3.6 5 1.9 7.8C18.7 16.65 12 21 12 21z" />
      </svg>
      {count}
    </button>
  );
}

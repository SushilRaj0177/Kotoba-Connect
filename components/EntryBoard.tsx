"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import EntryForm from "@/components/EntryForm";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { EntryListSkeleton } from "@/components/Skeletons";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function EntryBoard({
  userId,
  username,
}: {
  userId: string | null;
  username: string | null;
}) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<ContextEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ContextEntry[] | null>(null);

  const loadEntries = useCallback(async () => {
    setError(null);
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("context_entries")
      .select("*, profiles!context_entries_user_id_fkey(username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      setError(t("board.loadError"));
      setLoading(false);
      return;
    }

    let votedIds = new Set<string>();
    if (userId && data?.length) {
      const { data: votes } = await supabase
        .from("entry_upvotes")
        .select("entry_id")
        .eq("user_id", userId)
        .in(
          "entry_id",
          data.map((e) => e.id)
        );
      votedIds = new Set((votes ?? []).map((v) => v.entry_id));
    }

    setEntries(
      (data ?? []).map((e) => ({ ...e, has_voted: votedIds.has(e.id) }) as ContextEntry)
    );
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Real-time sync: any user's new post, upvote, or edit refreshes everyone's board.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("context_entries_board")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "context_entries" },
        () => loadEntries()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entry_upvotes" },
        () => loadEntries()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadEntries]);

  return (
    <div className="space-y-4">
      {userId ? (
        <EntryForm userId={userId} username={username} onCreated={loadEntries} />
      ) : (
        <div className="rounded-2xl bg-ink-bg-secondary p-4 text-center text-sm text-ink-text-muted border-2 border-ink-border">
          <a href="/login" className="font-semibold text-ink-text-link hover:underline">
            {t("board.signInPrompt")}
          </a>{" "}
          {t("board.signInSuffix")}
        </div>
      )}

      <SearchBar onResults={setSearchResults} onClear={() => setSearchResults(null)} />

      {loading ? (
        <EntryListSkeleton />
      ) : error ? (
        <div className="rounded-2xl bg-ink-red/10 p-4 text-center">
          <p className="text-sm text-ink-red">{error}</p>
          <button
            type="button"
            onClick={loadEntries}
            className="mt-2 text-sm font-semibold text-ink-text-link hover:underline"
          >
            {t("board.retry")}
          </button>
        </div>
      ) : searchResults !== null ? (
        searchResults.length === 0 ? (
          <EmptyState title={t("board.searchEmptyTitle")} description={t("board.searchEmptyDescription")} />
        ) : (
          <div className="space-y-3">
            {searchResults.map((entry) => (
              <EntryCard key={entry.id} entry={entry} currentUserId={userId} />
            ))}
          </div>
        )
      ) : entries.length === 0 ? (
        <EmptyState title={t("board.emptyTitle")} description={t("board.emptyDescription")} />
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} currentUserId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

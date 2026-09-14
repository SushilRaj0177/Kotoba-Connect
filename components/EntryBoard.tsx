"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry, FormalityLevel } from "@/types/database";
import EntryForm from "@/components/EntryForm";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import BoardControls, { type SortOption } from "@/components/BoardControls";
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
  const [sortBy, setSortBy] = useState<SortOption>("new");
  const [formalityFilter, setFormalityFilter] = useState<FormalityLevel | "all">("all");

  const loadEntries = useCallback(async () => {
    setError(null);
    const supabase = createClient();

    let query = supabase
      .from("context_entries")
      .select("*, profiles!context_entries_user_id_fkey(username, avatar_url)")
      .order(sortBy === "popular" ? "upvotes_count" : "created_at", { ascending: false })
      .limit(50);

    if (formalityFilter !== "all") {
      query = query.eq("formality_level", formalityFilter);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(t("board.loadError"));
      setLoading(false);
      return;
    }

    let votedIds = new Set<string>();
    let bookmarkedIds = new Set<string>();
    if (userId && data?.length) {
      const ids = data.map((e) => e.id);
      const [{ data: votes }, { data: saves }] = await Promise.all([
        supabase.from("entry_upvotes").select("entry_id").eq("user_id", userId).in("entry_id", ids),
        supabase.from("bookmarks").select("entry_id").eq("user_id", userId).in("entry_id", ids),
      ]);
      votedIds = new Set((votes ?? []).map((v) => v.entry_id));
      bookmarkedIds = new Set((saves ?? []).map((s) => s.entry_id));
    }

    setEntries(
      (data ?? []).map(
        (e) => ({ ...e, has_voted: votedIds.has(e.id), is_bookmarked: bookmarkedIds.has(e.id) }) as ContextEntry
      )
    );
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, sortBy, formalityFilter]);

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
    <div className="space-y-5">
      {userId ? (
        <EntryForm userId={userId} username={username} onCreated={loadEntries} />
      ) : (
        <div className="rounded-2xl bg-ink-bg-secondary p-4 text-center text-sm text-ink-text-muted border border-ink-border/70 shadow-sm">
          <a href="/login" className="font-semibold text-ink-text-link hover:underline">
            {t("board.signInPrompt")}
          </a>{" "}
          {t("board.signInSuffix")}
        </div>
      )}

      <SearchBar onResults={setSearchResults} onClear={() => setSearchResults(null)} />

      {searchResults === null && (
        <BoardControls
          sortBy={sortBy}
          onSortChange={setSortBy}
          formalityFilter={formalityFilter}
          onFormalityChange={setFormalityFilter}
        />
      )}

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
          <EmptyState title={t("board.searchEmptyTitle")} description={t("board.searchEmptyDescription")} variant="obake" />
        ) : (
          <div className="space-y-4">
            {searchResults.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                currentUserId={userId}
                bookmarked={!!entry.is_bookmarked}
              />
            ))}
          </div>
        )
      ) : entries.length === 0 ? (
        formalityFilter !== "all" ? (
          <EmptyState title={t("board.filterEmptyTitle")} description={t("board.filterEmptyDescription")} variant="obake" />
        ) : (
          <EmptyState title={t("board.emptyTitle")} description={t("board.emptyDescription")} />
        )
      ) : (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard key={entry.id} entry={entry} currentUserId={userId} />
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry, FormalityLevel } from "@/types/database";
import EntryForm from "@/components/EntryForm";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import BoardControls, { type SortOption } from "@/components/BoardControls";
import { EntryListSkeleton } from "@/components/Skeletons";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useBlockedIds } from "@/lib/use-blocked-ids";

const PAGE_SIZE = 30;

export default function EntryBoard({
  userId,
  username,
  avatarUrl,
  initialEntries,
  initialCommentCounts,
}: {
  userId: string | null;
  username: string | null;
  avatarUrl?: string | null;
  // Server-fetched first page (newest, unfiltered) so the board paints
  // immediately instead of every visit showing a skeleton while this
  // component's own fetch runs after hydration — see app/page.tsx.
  initialEntries?: ContextEntry[];
  initialCommentCounts?: Record<string, number>;
}) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<ContextEntry[]>(initialEntries ?? []);
  const [loading, setLoading] = useState(!initialEntries);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState((initialEntries?.length ?? 0) >= PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ContextEntry[] | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("new");
  const [formalityFilter, setFormalityFilter] = useState<FormalityLevel | "all">("all");
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(initialCommentCounts ?? {});
  const blockedIds = useBlockedIds(userId);
  // Skips exactly one redundant client fetch on mount when server data was
  // already provided — sort/filter changes after that still fetch normally.
  const skipInitialLoad = useRef(!!initialEntries);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Attaches the current signed-in viewer's like/bookmark state and each
  // entry's comment count to a fetched batch of rows — shared by the first
  // page and every subsequent "load more" page.
  const enrichBatch = useCallback(
    async (rows: ContextEntry[]) => {
      const supabase = createClient();
      if (!rows.length) return { enriched: rows, counts: {} as Record<string, number> };

      const ids = rows.map((e) => e.id);
      const votesQuery = userId
        ? supabase.from("entry_upvotes").select("entry_id").eq("user_id", userId).in("entry_id", ids)
        : Promise.resolve({ data: [] as { entry_id: string }[] });
      const savesQuery = userId
        ? supabase.from("bookmarks").select("entry_id").eq("user_id", userId).in("entry_id", ids)
        : Promise.resolve({ data: [] as { entry_id: string }[] });
      const [{ data: votes }, { data: saves }, { data: commentRows }] = await Promise.all([
        votesQuery,
        savesQuery,
        supabase.from("entry_comments").select("entry_id").in("entry_id", ids),
      ]);
      const votedIds = new Set((votes ?? []).map((v) => v.entry_id));
      const bookmarkedIds = new Set((saves ?? []).map((s) => s.entry_id));
      const counts: Record<string, number> = {};
      (commentRows ?? []).forEach((c) => {
        counts[c.entry_id] = (counts[c.entry_id] ?? 0) + 1;
      });

      return {
        enriched: rows.map(
          (e) => ({ ...e, has_voted: votedIds.has(e.id), is_bookmarked: bookmarkedIds.has(e.id) }) as ContextEntry
        ),
        counts,
      };
    },
    [userId]
  );

  const loadEntries = useCallback(async () => {
    setError(null);
    const supabase = createClient();

    let query = supabase
      .from("context_entries")
      .select("*, profiles!context_entries_user_id_fkey(username, display_name, avatar_url)")
      .order(sortBy === "popular" ? "upvotes_count" : "created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (formalityFilter !== "all") {
      query = query.eq("formality_level", formalityFilter);
    }

    const { data, error: fetchError } = await query;

    if (fetchError) {
      setError(t("board.loadError"));
      setLoading(false);
      return;
    }

    const { enriched, counts } = await enrichBatch((data ?? []) as ContextEntry[]);
    setEntries(enriched);
    setCommentCounts(counts);
    setHasMore((data?.length ?? 0) >= PAGE_SIZE);
    setLoading(false);
  }, [sortBy, formalityFilter, enrichBatch, t]);

  // Appends the next page instead of replacing — the board's actual content
  // "keeps going" the way any mature feed does, instead of hard-stopping at
  // a fixed count with no way to reach older posts.
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !entries.length) return;
    setLoadingMore(true);
    const supabase = createClient();

    let query = supabase
      .from("context_entries")
      .select("*, profiles!context_entries_user_id_fkey(username, display_name, avatar_url)")
      .order(sortBy === "popular" ? "upvotes_count" : "created_at", { ascending: false })
      .range(entries.length, entries.length + PAGE_SIZE - 1);

    if (formalityFilter !== "all") {
      query = query.eq("formality_level", formalityFilter);
    }

    const { data, error: fetchError } = await query;
    if (fetchError || !data?.length) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    const existingIds = new Set(entries.map((e) => e.id));
    const freshRows = (data as ContextEntry[]).filter((e) => !existingIds.has(e.id));
    const { enriched, counts } = await enrichBatch(freshRows);

    setEntries((prev) => [...prev, ...enriched]);
    setCommentCounts((prev) => ({ ...prev, ...counts }));
    setHasMore(data.length >= PAGE_SIZE);
    setLoadingMore(false);
  }, [entries, loadingMore, hasMore, sortBy, formalityFilter, enrichBatch]);

  useEffect(() => {
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false;
      return;
    }
    loadEntries();
  }, [loadEntries]);

  const visibleEntries = entries.filter((e) => !blockedIds.has(e.user_id));
  const visibleSearchResults = searchResults?.filter((e) => !blockedIds.has(e.user_id)) ?? null;

  // Auto-loads the next page as the sentinel at the bottom of the list
  // scrolls into view — no "click to load more" step, matching how a
  // normal social feed behaves.
  useEffect(() => {
    if (searchResults !== null) return; // pagination only applies to the board itself
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (observerEntries) => {
        if (observerEntries[0]?.isIntersecting) loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, searchResults]);

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
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "entry_comments" },
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
        <EntryForm userId={userId} username={username} avatarUrl={avatarUrl} onCreated={loadEntries} />
      ) : (
        <div className="rounded-2xl bg-ink-bg-secondary p-4 text-center text-sm text-ink-text-muted border border-ink-border/70 shadow-sm">
          <a href="/login" className="font-semibold text-ink-text-link hover:underline">
            {t("board.signInPrompt")}
          </a>{" "}
          {t("board.signInSuffix")}
        </div>
      )}

      <SearchBar userId={userId} onResults={setSearchResults} onClear={() => setSearchResults(null)} />

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
      ) : visibleSearchResults !== null ? (
        visibleSearchResults.length === 0 ? (
          <EmptyState title={t("board.searchEmptyTitle")} description={t("board.searchEmptyDescription")} variant="obake" />
        ) : (
          <div className="space-y-4">
            {visibleSearchResults.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                currentUserId={userId}
                bookmarked={!!entry.is_bookmarked}
                commentCount={commentCounts[entry.id] ?? 0}
              />
            ))}
          </div>
        )
      ) : visibleEntries.length === 0 ? (
        formalityFilter !== "all" ? (
          <EmptyState title={t("board.filterEmptyTitle")} description={t("board.filterEmptyDescription")} variant="obake" />
        ) : (
          <EmptyState title={t("board.emptyTitle")} description={t("board.emptyDescription")} variant="obake" />
        )
      ) : (
        <>
          <div className="space-y-4">
            {visibleEntries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                currentUserId={userId}
                commentCount={commentCounts[entry.id] ?? 0}
              />
            ))}
          </div>
          <div ref={sentinelRef} className="h-1" aria-hidden="true" />
          {loadingMore && (
            <p className="py-4 text-center text-sm text-ink-text-muted">{t("board.loadingMore")}</p>
          )}
          {!hasMore && !loadingMore && (
            <p className="py-4 text-center text-xs text-ink-text-muted">{t("board.caughtUp")}</p>
          )}
        </>
      )}
    </div>
  );
}

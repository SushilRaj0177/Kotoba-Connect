"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import EntryForm from "@/components/EntryForm";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import { EntryListSkeleton } from "@/components/Skeletons";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useBlockedIds } from "@/lib/use-blocked-ids";
import { ENTRY_WITH_PROFILE_COLUMNS } from "@/lib/entry-columns";

const PAGE_SIZE = 30;

// The home feed — just the compose box and newest posts, no search or
// sort/filter controls cluttering it (those moved to /search, reachable
// via the sidebar's search icon). Chronological is the feed here; with
// no personalization signal to rank on, "newest first" already is what
// a for-you feed degrades to for a young community — this isn't
// pretending to be a ranked recommender it isn't.
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
  // Server-fetched first page (newest) so the board paints immediately
  // instead of every visit showing a skeleton while this component's own
  // fetch runs after hydration — see app/page.tsx.
  initialEntries?: ContextEntry[];
  initialCommentCounts?: Record<string, number>;
}) {
  const { t } = useLocale();
  const [entries, setEntries] = useState<ContextEntry[]>(initialEntries ?? []);
  const [loading, setLoading] = useState(!initialEntries);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState((initialEntries?.length ?? 0) >= PAGE_SIZE);
  const [error, setError] = useState<string | null>(null);
  const [commentCounts, setCommentCounts] = useState<Record<string, number>>(initialCommentCounts ?? {});
  // Count of new posts that arrived via realtime while the viewer has
  // already scrolled/paginated — surfaced as a banner instead of silently
  // reflowing the feed under them (see the realtime subscription below).
  const [newPostCount, setNewPostCount] = useState(0);
  const blockedIds = useBlockedIds(userId);
  // Skips exactly one redundant client fetch on mount when server data was
  // already provided.
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

    const { data, error: fetchError } = await supabase
      .from("context_entries")
      .select(ENTRY_WITH_PROFILE_COLUMNS)
      .order("created_at", { ascending: false })
      .range(0, PAGE_SIZE - 1);

    if (fetchError) {
      setError(t("board.loadError"));
      setLoading(false);
      return;
    }

    const { enriched, counts } = await enrichBatch((data ?? []) as unknown as ContextEntry[]);
    setEntries(enriched);
    setCommentCounts(counts);
    setHasMore((data?.length ?? 0) >= PAGE_SIZE);
    setLoading(false);
  }, [enrichBatch, t]);

  // Appends the next page instead of replacing — the board's actual content
  // "keeps going" the way any mature feed does, instead of hard-stopping at
  // a fixed count with no way to reach older posts.
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !entries.length) return;
    setLoadingMore(true);
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("context_entries")
      .select(ENTRY_WITH_PROFILE_COLUMNS)
      .order("created_at", { ascending: false })
      .range(entries.length, entries.length + PAGE_SIZE - 1);

    if (fetchError || !data?.length) {
      setHasMore(false);
      setLoadingMore(false);
      return;
    }

    const existingIds = new Set(entries.map((e) => e.id));
    const freshRows = (data as unknown as ContextEntry[]).filter((e) => !existingIds.has(e.id));
    const { enriched, counts } = await enrichBatch(freshRows);

    setEntries((prev) => [...prev, ...enriched]);
    setCommentCounts((prev) => ({ ...prev, ...counts }));
    setHasMore(data.length >= PAGE_SIZE);
    setLoadingMore(false);
  }, [entries, loadingMore, hasMore, enrichBatch]);

  useEffect(() => {
    if (skipInitialLoad.current) {
      skipInitialLoad.current = false;
      return;
    }
    loadEntries();
  }, [loadEntries]);

  const visibleEntries = entries.filter((e) => !blockedIds.has(e.user_id));

  // Auto-loads the next page as the sentinel at the bottom of the list
  // scrolls into view — no "click to load more" step, matching how a
  // normal social feed behaves.
  useEffect(() => {
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
  }, [loadMore]);

  // Real-time sync. Previously any insert/update/delete on any of these
  // tables just re-ran loadEntries(), which replaces the whole list with a
  // fresh page 1 — so if you'd scrolled down or loaded further pages, a
  // stranger upvoting or commenting on anything, anywhere, would silently
  // yank you back to the top and discard everything you'd paginated in.
  // Now: edits/vote-count/delete patch the affected row in place (no
  // reflow), and brand-new posts surface as a "new posts" banner the
  // viewer can choose to load, instead of being spliced in underneath them.
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("context_entries_board")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "context_entries" },
        (payload) => {
          const row = payload.new as ContextEntry;
          if (row.user_id !== userId) {
            setNewPostCount((c) => c + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "context_entries" },
        (payload) => {
          const row = payload.new as ContextEntry;
          setEntries((prev) => prev.map((e) => (e.id === row.id ? { ...e, ...row } : e)));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "context_entries" },
        (payload) => {
          const oldId = (payload.old as { id: string }).id;
          setEntries((prev) => prev.filter((e) => e.id !== oldId));
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "entry_comments" },
        (payload) => {
          const entryId = (payload.new as { entry_id: string }).entry_id;
          setCommentCounts((prev) => ({ ...prev, [entryId]: (prev[entryId] ?? 0) + 1 }));
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "entry_comments" },
        (payload) => {
          const entryId = (payload.old as { entry_id: string }).entry_id;
          setCommentCounts((prev) => ({ ...prev, [entryId]: Math.max(0, (prev[entryId] ?? 1) - 1) }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const loadNewPosts = useCallback(() => {
    setNewPostCount(0);
    loadEntries();
    window.scrollTo({ top: 0, behavior: "smooth" });
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

      {newPostCount > 0 && (
        <button
          type="button"
          onClick={loadNewPosts}
          className="btn-chunky sticky top-2 z-10 flex w-full items-center justify-center gap-1.5 rounded-2xl bg-ink-accent px-4 py-2.5 text-sm font-bold text-[rgb(var(--c-on-accent))] shadow-md animate-toast-in"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M12 19V5M5 12l7-7 7 7" />
          </svg>
          {newPostCount === 1 ? t("board.newPost") : t("board.newPosts").replace("{count}", String(newPostCount))}
        </button>
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
      ) : visibleEntries.length === 0 ? (
        <EmptyState title={t("board.emptyTitle")} description={t("board.emptyDescription")} variant="obake" />
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

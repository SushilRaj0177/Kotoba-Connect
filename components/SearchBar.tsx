"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import { useLocale } from "@/components/i18n/LocaleProvider";

const DEBOUNCE_MS = 450;
// Below this, a semantic-search embedding call is mostly noise (a couple
// of characters aren't enough for the model to pin down meaning) and just
// burns quota/rate-limit budget on every keystroke for no useful result.
const MIN_QUERY_LENGTH = 2;

export default function SearchBar({
  userId,
  onResults,
  onClear,
}: {
  userId: string | null;
  onResults: (entries: ContextEntry[]) => void;
  onClear: () => void;
}) {
  const { t } = useLocale();
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Bumped on every new search kicked off — a response only gets applied
  // if it's still the most recent request, so a slow response to an
  // earlier keystroke can't clobber a faster response to a later one.
  const requestIdRef = useRef(0);

  const runSearch = useCallback(
    async (trimmed: string) => {
      const requestId = ++requestIdRef.current;
      setSearching(true);
      setNotice(null);
      try {
        const res = await fetch("/api/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: trimmed }),
        });
        const data = await res.json();
        if (requestId !== requestIdRef.current) return; // a newer search superseded this one

        if (!res.ok) {
          setNotice(data.error || "Search failed.");
          onClear();
          return;
        }

        const results: { id: string }[] = data.results ?? [];
        if (!results.length) {
          onResults([]);
          return;
        }

        // Semantic search returns a limited row shape (RPC output); fetch
        // the full rows so results render with the same EntryCard as the
        // board.
        const supabase = createClient();
        const ids = results.map((r) => r.id);
        const [{ data: fullEntries }, { data: votes }, { data: saves }] = await Promise.all([
          supabase
            .from("context_entries")
            .select("*, profiles!context_entries_user_id_fkey(username, display_name, avatar_url, is_bot)")
            .in("id", ids),
          userId
            ? supabase.from("entry_upvotes").select("entry_id").eq("user_id", userId).in("entry_id", ids)
            : Promise.resolve({ data: [] as { entry_id: string }[] }),
          userId
            ? supabase.from("bookmarks").select("entry_id").eq("user_id", userId).in("entry_id", ids)
            : Promise.resolve({ data: [] as { entry_id: string }[] }),
        ]);
        if (requestId !== requestIdRef.current) return;

        const votedIds = new Set((votes ?? []).map((v) => v.entry_id));
        const bookmarkedIds = new Set((saves ?? []).map((s) => s.entry_id));

        const order = new Map(ids.map((id, i) => [id, i]));
        const sorted = [...(fullEntries ?? [])]
          .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
          .map((e) => ({ ...e, has_voted: votedIds.has(e.id), is_bookmarked: bookmarkedIds.has(e.id) }));

        onResults(sorted as ContextEntry[]);
      } catch {
        if (requestId !== requestIdRef.current) return;
        setNotice("Couldn't reach the search endpoint.");
        onClear();
      } finally {
        if (requestId === requestIdRef.current) setSearching(false);
      }
    },
    [userId, onResults, onClear]
  );

  // Debounced as-you-type search — each keystroke resets the timer, so a
  // request only actually fires once typing pauses for DEBOUNCE_MS,
  // instead of one request per character.
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!trimmed) {
      requestIdRef.current++; // invalidate any in-flight request
      onClear();
      setNotice(null);
      setSearching(false);
      return;
    }
    if (trimmed.length < MIN_QUERY_LENGTH) return;

    debounceRef.current = setTimeout(() => runSearch(trimmed), DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const trimmed = query.trim();
    if (!trimmed) {
      onClear();
      return;
    }
    runSearch(trimmed);
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("board.searchPlaceholder")}
          className="min-w-0 flex-1 rounded-full border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-full bg-ink-bg-input px-4 py-2 text-sm font-semibold text-ink-text transition active:scale-90 hover:bg-ink-bg-hover disabled:opacity-60"
        >
          {searching ? t("board.searching") : t("board.searchButton")}
        </button>
      </form>
      {notice && <p className="mt-1 text-xs text-ink-text-muted">{notice}</p>}
    </div>
  );
}

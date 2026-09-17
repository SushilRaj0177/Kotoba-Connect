"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import { useLocale } from "@/components/i18n/LocaleProvider";

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

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      onClear();
      setNotice(null);
      return;
    }

    setSearching(true);
    setNotice(null);
    try {
      const res = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: trimmed }),
      });
      const data = await res.json();

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

      // Semantic search returns a limited row shape (RPC output); fetch the
      // full rows so results render with the same EntryCard as the board.
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
      const votedIds = new Set((votes ?? []).map((v) => v.entry_id));
      const bookmarkedIds = new Set((saves ?? []).map((s) => s.entry_id));

      const order = new Map(ids.map((id, i) => [id, i]));
      const sorted = [...(fullEntries ?? [])]
        .sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
        .map((e) => ({ ...e, has_voted: votedIds.has(e.id), is_bookmarked: bookmarkedIds.has(e.id) }));

      onResults(sorted as ContextEntry[]);
    } catch {
      setNotice("Couldn't reach the search endpoint.");
      onClear();
    } finally {
      setSearching(false);
    }
  }

  function handleChange(value: string) {
    setQuery(value);
    if (!value.trim()) {
      onClear();
      setNotice(null);
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={t("board.searchPlaceholder")}
          className="min-w-0 flex-1 rounded-full border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-full bg-ink-bg-input px-4 py-2 text-sm font-semibold text-ink-text transition hover:bg-ink-bg-hover disabled:opacity-60"
        >
          {searching ? t("board.searching") : t("board.searchButton")}
        </button>
      </form>
      {notice && <p className="mt-1 text-xs text-ink-text-muted">{notice}</p>}
    </div>
  );
}

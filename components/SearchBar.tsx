"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";

export default function SearchBar({
  onResults,
  onClear,
}: {
  onResults: (entries: ContextEntry[]) => void;
  onClear: () => void;
}) {
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
      const { data: fullEntries } = await supabase
        .from("context_entries")
        .select("*, profiles(username, avatar_url)")
        .in("id", ids);

      const order = new Map(ids.map((id, i) => [id, i]));
      const sorted = [...(fullEntries ?? [])].sort(
        (a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0)
      );

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
          placeholder="Search by meaning — e.g. 'polite way to refuse'"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        <button
          type="submit"
          disabled={searching}
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:opacity-60"
        >
          {searching ? "Searching…" : "Search"}
        </button>
      </form>
      {notice && <p className="mt-1 text-xs text-slate-muted">{notice}</p>}
    </div>
  );
}

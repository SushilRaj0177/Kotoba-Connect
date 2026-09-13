"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ContextEntry } from "@/types/database";
import EntryForm from "@/components/EntryForm";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import SearchBar from "@/components/SearchBar";
import { EntryListSkeleton } from "@/components/Skeletons";

export default function EntryBoard({ userId }: { userId: string | null }) {
  const [entries, setEntries] = useState<ContextEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<ContextEntry[] | null>(null);

  const loadEntries = useCallback(async () => {
    setError(null);
    const supabase = createClient();

    const { data, error: fetchError } = await supabase
      .from("context_entries")
      .select("*, profiles(username, avatar_url)")
      .order("created_at", { ascending: false })
      .limit(50);

    if (fetchError) {
      setError("Couldn't load entries. Check your connection and try again.");
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
    <div className="space-y-6">
      {userId ? (
        <EntryForm userId={userId} onCreated={loadEntries} />
      ) : (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-center text-sm text-slate-muted">
          <a href="/login" className="font-semibold text-accent hover:underline">
            Sign in
          </a>{" "}
          to post a sentence, vote, or add nuance notes.
        </div>
      )}

      <SearchBar onResults={setSearchResults} onClear={() => setSearchResults(null)} />

      {loading ? (
        <EntryListSkeleton />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            type="button"
            onClick={loadEntries}
            className="mt-2 text-sm font-semibold text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      ) : searchResults !== null ? (
        searchResults.length === 0 ? (
          <EmptyState
            title="No matches"
            description="Nothing close in meaning yet — try a different phrase, or post it yourself."
          />
        ) : (
          <div className="space-y-4">
            {searchResults.map((entry) => (
              <EntryCard key={entry.id} entry={entry} currentUserId={userId} />
            ))}
          </div>
        )
      ) : entries.length === 0 ? (
        <EmptyState
          title="No entries yet"
          description="Be the first to post a Japanese sentence with its pragmatic context."
        />
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

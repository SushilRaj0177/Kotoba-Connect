"use client";

import { useEffect, useState } from "react";
import { voteStore, bookmarkStore, type VoteState } from "@/lib/entry-interaction-store";

// Shared by LikeButton and BookmarkButton so every rendered copy of the
// same entry (board, search results, entry detail, profile, bookmarks —
// wherever it shows up) stays in sync with the others, including copies
// that mount later via client-side navigation. See
// lib/entry-interaction-store.ts for why a plain per-component useState
// wasn't enough, and why votes/bookmarks are two independent stores.
function useEntryStateStore<T>(
  store: { prime: (id: string, initial: T) => T; set: (id: string, fallback: T, patch: T | ((c: T) => T)) => T; subscribe: (id: string, listener: (state: T) => void) => () => void },
  entryId: string,
  initial: T
) {
  const [state, setState] = useState(() => store.prime(entryId, initial));

  useEffect(() => {
    // Re-sync on mount: another already-mounted copy (or an action taken
    // before this component existed, e.g. on a previous page) may have
    // changed this entry's state since `initial` was captured server-side.
    setState(store.prime(entryId, initial));
    return store.subscribe(entryId, setState);
    // Only entryId should re-run this — `initial` intentionally isn't a
    // dependency, it's a one-time seed for whenever this entry is first
    // seen this session, not something later re-renders should re-apply.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entryId]);

  const update = (patch: T | ((current: T) => T)) => store.set(entryId, initial, patch);

  return [state, update] as const;
}

export function useVoteState(entryId: string, initial: VoteState) {
  return useEntryStateStore(voteStore, entryId, initial);
}

export function useBookmarkState(entryId: string, initial: boolean) {
  return useEntryStateStore(bookmarkStore, entryId, initial);
}

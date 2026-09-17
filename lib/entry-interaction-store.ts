// LikeButton/BookmarkButton used to be plain useState seeded once from
// whatever that page's own server/client fetch happened to return. Two
// mounted copies of the same entry (the same post shown on the board and
// in search results) had no way to hear about each other, so liking it in
// one place left every other copy showing the old state — and since
// Next.js's client-side router keeps page modules alive across
// navigations, even *visiting* another page later didn't help unless that
// page's own fetch happened to re-run after the like.
//
// This is a tiny per-entry pub/sub cache living in module scope (not
// React state), so it survives client-side navigation between routes —
// module-level JS state isn't tied to any one component's lifecycle.
//
// Votes and bookmarks each get their own independent store rather than one
// combined record: LikeButton and BookmarkButton mount independently and
// each only knows its own slice (a LikeButton has no idea whether its
// entry is bookmarked, and vice versa), so a shared record would have
// whichever one mounts first "seed" a placeholder value into the other's
// field, silently stomping on it once the sibling mounts with its own
// real value.
function createEntryStateStore<T>() {
  const store = new Map<string, T>();
  const listeners = new Map<string, Set<(state: T) => void>>();

  // Seeds the store the first time a given entry is seen; later mounts of
  // the same entry intentionally do NOT overwrite it with their own
  // (possibly stale) initial props — the store, once primed, is the
  // source of truth for the rest of the session.
  function prime(id: string, initial: T): T {
    const existing = store.get(id);
    if (existing !== undefined) return existing;
    store.set(id, initial);
    return initial;
  }

  function get(id: string): T | undefined {
    return store.get(id);
  }

  // `patch` can be a plain value or an updater function, same as React's
  // functional setState — callers doing math relative to the current
  // value (e.g. a vote count +/- 1) should always use the function form
  // so they read the live shared value at write time, not whatever was
  // captured in their own closure when the toggle started (which could be
  // stale if another mounted copy of the same entry changed it meanwhile).
  function set(id: string, fallback: T, patch: T | ((current: T) => T)): T {
    const current = store.get(id) ?? fallback;
    const next = typeof patch === "function" ? (patch as (current: T) => T)(current) : patch;
    store.set(id, next);
    listeners.get(id)?.forEach((listener) => listener(next));
    return next;
  }

  function subscribe(id: string, listener: (state: T) => void): () => void {
    let set = listeners.get(id);
    if (!set) {
      set = new Set();
      listeners.set(id, set);
    }
    set.add(listener);
    return () => {
      set!.delete(listener);
      if (set!.size === 0) listeners.delete(id);
    };
  }

  return { prime, get, set, subscribe };
}

export type VoteState = { hasVoted: boolean; count: number };
export const voteStore = createEntryStateStore<VoteState>();

export const bookmarkStore = createEntryStateStore<boolean>();

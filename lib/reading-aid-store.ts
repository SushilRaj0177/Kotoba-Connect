// A viewer-level display preference for how Japanese entries render:
// plain text, with furigana above kanji, or transliterated to romaji.
// Same shape as entry-interaction-store.ts — a module-scope pub/sub, not
// React state, so it survives client-side navigation and every mounted
// JapaneseText/TokenizedText instance updates the moment the setting
// changes, with no page reload. Persisted to localStorage rather than a
// cookie: this only ever affects client-rendered text (nothing here
// needs to be correct in the initial server-rendered HTML the way theme
// does), so there's no SSR-mismatch concern to design around.
export type ReadingAidMode = "none" | "furigana" | "romaji";

const STORAGE_KEY = "kotoba-reading-aid";
const listeners = new Set<(mode: ReadingAidMode) => void>();
let current: ReadingAidMode | null = null;

function isValid(value: unknown): value is ReadingAidMode {
  return value === "none" || value === "furigana" || value === "romaji";
}

export function getReadingAid(): ReadingAidMode {
  if (current) return current;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    current = isValid(stored) ? stored : "none";
  } catch {
    current = "none";
  }
  return current;
}

export function setReadingAid(mode: ReadingAidMode) {
  current = mode;
  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch {
    // Private browsing/storage disabled — the preference just won't
    // survive a reload, which is a harmless degradation here.
  }
  listeners.forEach((listener) => listener(mode));
}

export function subscribeReadingAid(listener: (mode: ReadingAidMode) => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

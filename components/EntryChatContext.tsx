"use client";

import { createContext, useContext, useState } from "react";

export interface EntryChatContextValue {
  raw_japanese: string;
  primary_translation: string;
  nuance_summary?: string | null;
}

interface Ctx {
  entry: EntryChatContextValue | null;
  setEntry: (entry: EntryChatContextValue | null) => void;
}

const EntryChatCtx = createContext<Ctx>({ entry: null, setEntry: () => {} });

// MascotChat lives once in the root layout, far above any single entry
// page. This lets EntryDetail (a deep child) hand it "the entry currently
// being viewed" without prop-drilling through the whole shell — EntryDetail
// sets it on mount and clears it on unmount (see its useEffect), and
// MascotChat reads it to ground the bot's answers in that specific
// sentence instead of only general Japanese questions.
export function EntryChatProvider({ children }: { children: React.ReactNode }) {
  const [entry, setEntry] = useState<EntryChatContextValue | null>(null);
  return <EntryChatCtx.Provider value={{ entry, setEntry }}>{children}</EntryChatCtx.Provider>;
}

export function useEntryChatContext() {
  return useContext(EntryChatCtx);
}

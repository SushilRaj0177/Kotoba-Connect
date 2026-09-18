"use client";

import { useEffect, useState } from "react";
import { getReadingAid, setReadingAid, subscribeReadingAid, type ReadingAidMode } from "@/lib/reading-aid-store";

export function useReadingAid() {
  // "none" on first render (server and client, matching — localStorage
  // isn't available during SSR) and correct on the client a tick later;
  // the actual stored preference is applied via the effect below.
  const [mode, setMode] = useState<ReadingAidMode>("none");

  useEffect(() => {
    setMode(getReadingAid());
    return subscribeReadingAid(setMode);
  }, []);

  return [mode, setReadingAid] as const;
}

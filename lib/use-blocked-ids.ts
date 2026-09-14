"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Blocking is enforced client-side by filtering fetched rows, not by RLS —
// a blocked user's posts/comments still exist and are publicly readable to
// everyone else, this just keeps them out of the blocker's own view.
export function useBlockedIds(userId: string | null): Set<string> {
  const [blockedIds, setBlockedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!userId) {
      setBlockedIds(new Set());
      return;
    }
    const supabase = createClient();
    supabase
      .from("user_blocks")
      .select("blocked_id")
      .eq("blocker_id", userId)
      .then(({ data }) => {
        setBlockedIds(new Set((data ?? []).map((r) => r.blocked_id)));
      });
  }, [userId]);

  return blockedIds;
}

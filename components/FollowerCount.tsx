"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

// Subscribes directly to user_follows changes for this profile rather
// than coordinating with FollowButton's local state — that way the count
// is correct and live for every viewer on the page (including the
// profile owner, and anyone who follows/unfollows from a different tab
// or device), not just reactive to the current viewer's own click.
// Requires user_follows to be in the supabase_realtime publication (see
// 0018_follows_realtime.sql) — without that, this silently never
// receives events and just shows the initial count forever.
export default function FollowerCount({ profileId, initialCount, label }: { profileId: string; initialCount: number; label: string }) {
  const [count, setCount] = useState(initialCount);

  useEffect(() => {
    setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`follower_count_${profileId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_follows", filter: `following_id=eq.${profileId}` },
        () => setCount((c) => c + 1)
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "user_follows", filter: `following_id=eq.${profileId}` },
        () => setCount((c) => Math.max(0, c - 1))
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [profileId]);

  return (
    <div className="rounded-xl bg-ink-bg-input p-2.5 text-center">
      <p className="font-display text-base font-extrabold text-ink-text-header">{count}</p>
      <p className="text-xs text-ink-text-muted">{label}</p>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import UserHandle from "@/components/UserHandle";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/Toast";

interface BlockedUser {
  blocked_id: string;
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null;
}

export default function BlockedUsersManager({ userId }: { userId: string }) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [blocked, setBlocked] = useState<BlockedUser[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase
      .from("user_blocks")
      .select("blocked_id, profiles!user_blocks_blocked_id_fkey(username, display_name, avatar_url)")
      .eq("blocker_id", userId)
      .order("created_at", { ascending: false });
    setBlocked((data ?? []) as unknown as BlockedUser[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  async function unblock(blockedId: string) {
    const supabase = createClient();
    const { error } = await supabase.from("user_blocks").delete().eq("blocker_id", userId).eq("blocked_id", blockedId);
    if (error) {
      showToast(t("profile.actionError"), "error");
      return;
    }
    setBlocked((prev) => prev.filter((b) => b.blocked_id !== blockedId));
  }

  if (loading) return null;

  return (
    <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="mb-3 font-display text-base font-bold text-ink-text-header">{t("settings.blockedUsers")}</h2>
      {blocked.length === 0 ? (
        <p className="text-sm text-ink-text-muted">{t("settings.blockedUsersEmpty")}</p>
      ) : (
        <ul className="space-y-2">
          {blocked.map((b) => (
            <li key={b.blocked_id} className="flex items-center justify-between">
              <UserHandle
                username={b.profiles?.username ?? "unknown"}
                displayName={b.profiles?.display_name}
                avatarUrl={b.profiles?.avatar_url}
                href={`/u/${b.profiles?.username ?? ""}`}
                size="sm"
              />
              <button
                type="button"
                onClick={() => unblock(b.blocked_id)}
                className="rounded-full bg-ink-bg-input px-3 py-1 text-xs font-semibold text-ink-text transition active:scale-95 hover:bg-ink-bg-hover"
              >
                {t("profile.unblock")}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

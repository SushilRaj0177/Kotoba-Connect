"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import type { AppNotification } from "@/types/database";
import Avatar from "@/components/Avatar";
import Mascot from "@/components/Mascot";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function NotificationBell({ userId }: { userId: string }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url)")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(30);
    setNotifications((data ?? []) as unknown as AppNotification[]);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`notifications_${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  async function markAllRead() {
    const supabase = createClient();
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={t("nav.notifications")}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-text"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 8a6 6 0 0 1 12 0c0 4.5 1.5 6 2 7H4c.5-1 2-2.5 2-7Z" />
          <path d="M9.5 19a2.5 2.5 0 0 0 5 0" />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute right-0.5 top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-ink-accent px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-20 mt-2 max-h-96 w-80 overflow-y-auto rounded-2xl bg-ink-bg-secondary border border-ink-border/70 shadow-xl">
            <div className="flex items-center justify-between border-b border-ink-border p-3">
              <span className="text-sm font-semibold text-ink-text-header">{t("notif.title")}</span>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllRead}
                  className="text-xs font-medium text-ink-text-link hover:underline"
                >
                  {t("notif.markAllRead")}
                </button>
              )}
            </div>
            {loading ? (
              <p className="p-4 text-center text-sm text-ink-text-muted">…</p>
            ) : notifications.length === 0 ? (
              <p className="p-4 text-center text-sm text-ink-text-muted">{t("notif.empty")}</p>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <Link
                      href={
                        n.type === "follow"
                          ? n.actor?.username
                            ? `/u/${n.actor.username}`
                            : "#"
                          : n.entry_id
                            ? `/entries/${n.entry_id}`
                            : "#"
                      }
                      onClick={() => setOpen(false)}
                      className={`flex items-start gap-2.5 border-b border-ink-border p-3 text-sm transition hover:bg-ink-bg-hover ${
                        n.read ? "opacity-60" : ""
                      }`}
                    >
                      {n.type === "system" ? (
                        <Mascot size={28} mood="happy" />
                      ) : (
                        <Avatar username={n.actor?.username ?? "?"} avatarUrl={n.actor?.avatar_url} size={28} />
                      )}
                      <span className="min-w-0 flex-1 text-ink-text">
                        {n.type === "system" ? (
                          <>
                            <strong className="font-display text-ink-text-header">Kotoba Bot</strong> {n.message}
                          </>
                        ) : (
                          <>
                            <strong className="font-display text-ink-text-header">
                              {n.actor?.display_name?.trim() || `@${n.actor?.username ?? "someone"}`}
                            </strong>{" "}
                            {n.type === "upvote"
                              ? t("notif.upvoted")
                              : n.type === "annotation"
                                ? t("notif.annotated")
                                : n.type === "comment"
                                  ? t("notif.commented")
                                  : t("notif.followed")}
                          </>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}

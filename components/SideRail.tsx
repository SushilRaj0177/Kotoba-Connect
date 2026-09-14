"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import RailIcon from "@/components/RailIcon";
import Mascot from "@/components/Mascot";
import { useLocale } from "@/components/i18n/LocaleProvider";

// A persistent left navigation rail. Fetches auth state client-side
// (with an onAuthStateChange subscription) rather than relying on a
// server-rendered check baked into the root layout — that server check
// was going stale after sign-in/out because the root layout segment
// persists across client-side navigations in the App Router and doesn't
// always re-run, so Bookmarks/Settings could silently disappear even
// while signed in. This is always correct regardless of navigation/cache
// timing, matching how NotificationBell/AccountMenu already behave.
export default function SideRail() {
  const { t } = useLocale();
  const [userId, setUserId] = useState<string | null | undefined>(undefined);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    async function loadProfile(uid: string | null) {
      setUserId(uid);
      if (!uid) {
        setIsAdmin(false);
        return;
      }
      const { data } = await supabase.from("profiles").select("is_admin").eq("id", uid).single();
      setIsAdmin(!!data?.is_admin);
    }

    supabase.auth.getUser().then(({ data }) => loadProfile(data.user?.id ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      loadProfile(session?.user?.id ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const user = !!userId;

  return (
    <nav className="sticky top-0 hidden h-screen w-[72px] flex-none flex-col items-center gap-3 bg-ink-bg-secondary py-6 shadow-[1px_0_0_0_rgb(var(--c-border)/0.6)] md:flex">
      <Link
        href="/"
        title={t("app.name")}
        className="mb-2 flex h-12 w-12 flex-none items-center justify-center rounded-2xl bg-ink-accent transition hover:scale-105"
      >
        <Mascot size={30} />
      </Link>

      <RailIcon href="/" title={t("nav.home")}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      </RailIcon>

      <RailIcon href="/leaderboard" title={t("nav.leaderboard")}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" />
        </svg>
      </RailIcon>

      {user && (
        <RailIcon href="/bookmarks" title={t("nav.bookmarks")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>
        </RailIcon>
      )}

      {(user || isAdmin) && <span className="h-px w-8 flex-none bg-ink-border" aria-hidden="true" />}

      {user && (
        <RailIcon href="/settings" title={t("nav.settings")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </RailIcon>
      )}

      {isAdmin && (
        <RailIcon href="/admin" title={t("nav.moderation")}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3 4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-3z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </RailIcon>
      )}
    </nav>
  );
}

"use client";

import Link from "next/link";
import RailIcon from "@/components/RailIcon";
import MascotLogo from "@/components/MascotLogo";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useClientAuth } from "@/components/auth/ClientAuthProvider";

// A persistent left navigation rail. Reads auth state from
// ClientAuthProvider (a shared onAuthStateChange subscription) rather than
// relying on a server-rendered check baked into the root layout — that
// server check was going stale after sign-in/out because the root layout
// segment persists across client-side navigations in the App Router and
// doesn't always re-run, so Bookmarks/Settings could silently disappear
// even while signed in. This is always correct regardless of
// navigation/cache timing, matching how NotificationBell/AccountMenu
// already behave.
export default function SideRail() {
  const { t } = useLocale();
  const { userId, isAdmin } = useClientAuth();

  const user = !!userId;
  // Signed out, "/" is the marketing landing page rather than the board —
  // send Home to "/board" instead so navigating away and back (e.g. while
  // browsing without an account) doesn't bounce back to the pitch.
  const homeHref = user ? "/" : "/board";

  return (
    <nav className="fixed inset-y-0 left-0 z-30 hidden w-[72px] flex-none flex-col items-center gap-3 overflow-y-auto bg-ink-bg-secondary py-6 shadow-[1px_0_0_0_rgb(var(--c-border)/0.6)] md:flex">
      <Link
        href={homeHref}
        title={t("app.name")}
        className="mb-2 flex h-12 w-12 flex-none items-center justify-center rounded-2xl transition hover:scale-105 hover:bg-ink-bg-hover"
      >
        <MascotLogo size={40} />
      </Link>

      <RailIcon href={homeHref} title={t("nav.home")}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      </RailIcon>

      <RailIcon href="/search" title={t("nav.search")}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <g strokeLinecap="round" strokeLinejoin="round">
            <circle cx="10.5" cy="10.5" r="6.5" />
            <path d="m20 20-3.8-3.8" />
            <path
              d="M17 3.5c0 .9-.7 1.6-1.6 1.6.9 0 1.6.7 1.6 1.6 0-.9.7-1.6 1.6-1.6-.9 0-1.6-.7-1.6-1.6Z"
              fill="currentColor"
              stroke="none"
            />
          </g>
        </svg>
      </RailIcon>

      <RailIcon href="/leaderboard" title={t("nav.leaderboard")}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 3h10v5a5 5 0 0 1-10 0V3Z" />
          <path d="M7 4H4.5a2 2 0 0 0 0 4c.5 1.5 1.6 2.7 3 3.3" />
          <path d="M17 4h2.5a2 2 0 0 1 0 4c-.5 1.5-1.6 2.7-3 3.3" />
          <path d="M12 15.5V19" />
          <path d="M8.5 21h7" />
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
          {/* A proper gear silhouette (rounded teeth, one continuous
             outline) instead of the old ring-plus-eight-spikes mark, which
             read more like a sun/asterisk than a settings cog at 22px. */}
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path
              d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="3" />
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

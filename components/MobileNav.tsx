"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useClientAuth } from "@/components/auth/ClientAuthProvider";

// A bottom tab bar for phone widths — SideRail is `hidden md:flex`, so
// without this there was no way to reach Leaderboard/Bookmarks/Settings
// at all on a phone (only Home, via the wordmark). Mirrors the same
// links as SideRail and shares its ClientAuthProvider subscription (not a
// server-rendered check) so it can't go stale after sign-in either.
export default function MobileNav() {
  const { t } = useLocale();
  const pathname = usePathname();
  const { userId } = useClientAuth();

  // "/" already renders the board for a signed-in user and the marketing
  // landing page for a signed-out one (see app/page.tsx), so this doubles
  // as the one universal way back to the landing page from any other page
  // (settings, an entry, /leaderboard, ...) while signed out.
  const homeHref = "/";

  const items = [
    {
      href: homeHref,
      label: t("nav.home"),
      show: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      ),
    },
    {
      href: "/search",
      label: t("nav.search"),
      show: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
      ),
    },
    {
      href: "/leaderboard",
      label: t("nav.leaderboard"),
      show: true,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M7 3h10v5a5 5 0 0 1-10 0V3Z" />
          <path d="M7 4H4.5a2 2 0 0 0 0 4c.5 1.5 1.6 2.7 3 3.3" />
          <path d="M17 4h2.5a2 2 0 0 1 0 4c-.5 1.5-1.6 2.7-3 3.3" />
          <path d="M12 15.5V19" />
          <path d="M8.5 21h7" />
        </svg>
      ),
    },
    {
      href: "/bookmarks",
      label: t("nav.bookmarks"),
      show: !!userId,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: t("nav.settings"),
      show: !!userId,
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path
            d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
            strokeLinejoin="round"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
  ].filter((item) => item.show);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex items-stretch justify-around bg-ink-bg-secondary shadow-[0_-1px_0_0_rgb(var(--c-border)/0.6)] md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map((item) => {
        const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-1 flex-col items-center gap-1 py-3.5 text-[11px] font-semibold transition active:scale-90 active:opacity-70 ${
              active ? "text-ink-accent" : "text-ink-text-muted"
            }`}
          >
            {item.icon}
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

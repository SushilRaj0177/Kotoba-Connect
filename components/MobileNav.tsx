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

  // Signed out, "/" is the marketing landing page rather than the board —
  // send Home to "/board" instead so navigating away and back (e.g. while
  // browsing without an account) doesn't bounce back to the pitch.
  const homeHref = userId ? "/" : "/board";

  const items = [
    {
      href: homeHref,
      label: t("nav.home"),
      show: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      ),
    },
    {
      href: "/leaderboard",
      label: t("nav.leaderboard"),
      show: true,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
        </svg>
      ),
    },
    {
      href: "/settings",
      label: t("nav.settings"),
      show: !!userId,
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3.2" />
          <circle cx="12" cy="12" r="7.3" />
          <path d="M12 1.5v3M12 19.5v3M22.5 12h-3M4.5 12h-3M19.6 4.4l-2.1 2.1M6.5 17.5l-2.1 2.1M19.6 19.6l-2.1-2.1M6.5 6.5 4.4 4.4" />
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
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition ${
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

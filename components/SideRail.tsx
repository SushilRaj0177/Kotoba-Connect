import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

// A persistent left navigation rail — this is the single biggest signal
// that distinguishes "an application" from "a page": every reference app
// (Reddit, Discord, Duolingo, X, Deepstash) keeps one on screen at all
// times, regardless of visual style. Hidden on mobile; the top bar (see
// Navbar.tsx) still carries auth/settings there.
export default async function SideRail() {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single();
    isAdmin = !!profile?.is_admin;
  }

  return (
    <nav className="sticky top-0 hidden h-screen w-16 flex-none flex-col items-center gap-1 border-r-2 border-ink-border bg-ink-bg-secondary py-4 md:flex">
      <Link
        href="/"
        title={t("app.name")}
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-ink-accent font-display text-lg font-black text-white"
      >
        言
      </Link>

      <RailIcon href="/" title={t("nav.home")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      </RailIcon>

      <RailIcon href="/leaderboard" title={t("nav.leaderboard")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 21h8M12 17v4M7 4h10v4a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H4a3 3 0 0 0 3 5M17 6h3a3 3 0 0 1-3 5" />
        </svg>
      </RailIcon>

      {user && (
        <RailIcon href="/bookmarks" title={t("nav.bookmarks")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
          </svg>
        </RailIcon>
      )}

      {user && (
        <RailIcon href="/settings" title={t("nav.settings")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </RailIcon>
      )}

      {isAdmin && (
        <RailIcon href="/admin" title={t("nav.moderation")}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 3 4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-3z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </RailIcon>
      )}
    </nav>
  );
}

function RailIcon({ href, title, children }: { href: string; title: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      title={title}
      className="flex h-11 w-11 items-center justify-center rounded-2xl text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-accent"
    >
      {children}
    </Link>
  );
}

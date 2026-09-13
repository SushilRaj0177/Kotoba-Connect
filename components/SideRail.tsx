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
        className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-ink-accent to-ink-accent-2 font-jp text-lg font-black text-white"
      >
        言
      </Link>

      <RailIcon href="/" title={t("nav.home")}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 11.5 12 4l9 7.5" />
          <path d="M5 10v9a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1v-9" />
        </svg>
      </RailIcon>

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

import Link from "next/link";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";
import AccountMenu from "@/components/AccountMenu";
import NotificationBell from "@/components/NotificationBell";
import Mascot from "@/components/Mascot";

export default async function Navbar({ title }: { title?: string } = {}) {
  const { t } = getServerTranslator();
  // getCurrentProfile() internally awaits the same cached getCurrentUser()
  // call and returns null itself when signed out — no need to gate it on
  // `user` here first, which just serialized two round trips on every
  // single page (Navbar renders on all of them).
  const [user, profile] = await Promise.all([getCurrentUser(), getCurrentProfile()]);
  const username = profile?.username ?? null;
  const isAdmin = !!profile?.is_admin;

  return (
    <header className="sticky top-0 z-10 bg-ink-bg/90 shadow-[0_1px_0_0_rgb(var(--c-border)/0.6)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        {/* "/" already renders the board for a signed-in user and the
           marketing landing page for a signed-out one (see app/page.tsx) —
           so this is also the one universal way back to the landing page
           from any other page (settings, an entry, /leaderboard, ...)
           while signed out, where nothing else in the app links there. */}
        <Link href="/" className="flex-none md:hidden">
          <span className="font-display text-2xl font-black text-ink-accent">言葉</span>
        </Link>

        {/* Every page needs exactly one real <h1> for accessibility/SEO —
           this used to be a plain <span>, hidden below the md breakpoint
           entirely, which meant most pages (board, search, leaderboard,
           settings, an entry...) had no heading of any kind on mobile.
           sr-only keeps it present and announced to screen readers/crawlers
           at every width; md:not-sr-only only changes how it's *displayed*
           once there's room for the mascot + label treatment, it doesn't
           add a second element. Balances the toggles/auth cluster on the
           right — every reference app anchors something on both sides of
           its header. */}
        <h1 className="sr-only md:not-sr-only md:flex md:items-center md:gap-2">
          <Mascot size={26} className="hidden md:block" />
          <span className="truncate font-display text-lg font-extrabold text-ink-text-header">
            {title ?? t("nav.home")}
          </span>
        </h1>

        {/* Tightened from a flat gap-2.5: at the narrowest phone widths this
           row's own content (logo + 4 controls) was already right at the
           edge of what 100% scale fits — see the min-w-0 note in
           app/layout.tsx for what happens once a row like this can't
           shrink any further. */}
        <div className="ml-auto flex min-w-0 items-center gap-1.5 sm:gap-2.5">
          <ThemeToggle />
          <LanguageToggle />
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <NotificationBell userId={user.id} />
              <AccountMenu
                username={username ?? "user"}
                displayName={profile?.display_name}
                avatarUrl={profile?.avatar_url}
                isAdmin={isAdmin}
              />
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-chunky rounded-xl bg-ink-accent px-4 py-1.5 text-sm font-bold text-[rgb(var(--c-on-accent))]"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

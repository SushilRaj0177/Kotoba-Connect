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
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const username = profile?.username ?? null;
  const isAdmin = !!profile?.is_admin;

  return (
    <header className="sticky top-0 z-10 bg-ink-bg/90 shadow-[0_1px_0_0_rgb(var(--c-border)/0.6)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex-none md:hidden">
          <span className="font-display text-2xl font-black text-ink-accent">言葉</span>
        </Link>

        {/* Balances the toggles/auth cluster on the right — every reference
            app anchors something on both sides of its header. The mascot
            next to the label is what keeps this from reading as a bare
            document title. */}
        <span className="hidden items-center gap-2 md:flex">
          <Mascot size={26} />
          <span className="truncate font-display text-lg font-extrabold text-ink-text-header">
            {title ?? t("nav.home")}
          </span>
        </span>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageToggle />
          {user ? (
            <div className="flex items-center gap-2.5">
              <NotificationBell userId={user.id} />
              <AccountMenu username={username ?? "user"} isAdmin={isAdmin} />
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-chunky rounded-xl bg-ink-accent px-4 py-1.5 text-sm font-bold text-white"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

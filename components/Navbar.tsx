import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";
import AccountMenu from "@/components/AccountMenu";
import NotificationBell from "@/components/NotificationBell";

export default async function Navbar({ title }: { title?: string } = {}) {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  let isAdmin = false;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username, is_admin")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
    isAdmin = !!profile?.is_admin;
  }

  return (
    <header className="sticky top-0 z-10 bg-ink-bg/90 shadow-[0_1px_0_0_rgb(var(--c-border)/0.6)] backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link href="/" className="flex-none md:hidden">
          <span className="font-display text-2xl font-black text-ink-accent">言葉</span>
        </Link>

        {/* Balances the toggles/auth cluster on the right — every reference
            app anchors something on both sides of its header. */}
        <span className="hidden truncate font-display text-lg font-extrabold text-ink-text-header md:block">
          {title ?? t("nav.home")}
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

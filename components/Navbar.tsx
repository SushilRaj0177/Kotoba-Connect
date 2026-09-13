import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { getServerTranslator } from "@/lib/i18n/server";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Avatar from "@/components/Avatar";

export default async function Navbar() {
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
    <header className="sticky top-0 z-10 bg-ink-bg/90 border-b-2 border-ink-border">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2.5">
          <span className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-ink-accent font-jp text-base font-bold text-white">
            言
          </span>
          <span className="truncate font-display text-lg font-extrabold text-ink-text-header">
            {t("app.name")}
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden text-sm font-medium text-ink-text-muted transition hover:text-ink-text sm:inline"
            >
              {t("nav.moderation")}
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 sm:flex">
                <Avatar username={username ?? "user"} size={24} />
                <span className="text-sm text-ink-text-muted">@{username ?? "user"}</span>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full bg-ink-bg-input px-3 py-1.5 text-sm font-medium text-ink-text transition hover:bg-ink-bg-hover"
                >
                  {t("nav.signOut")}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="btn-chunky rounded-xl bg-ink-accent px-4 py-1.5 text-sm font-extrabold uppercase tracking-wide text-white"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

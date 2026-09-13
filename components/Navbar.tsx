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
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link href="/" className="flex-none md:hidden">
          <span className="bg-gradient-to-br from-ink-accent to-ink-accent-2 bg-clip-text font-jp text-2xl font-black text-transparent">
            言葉
          </span>
        </Link>

        <div className="ml-auto flex items-center gap-2.5">
          <ThemeToggle />
          <LanguageToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden text-sm font-medium text-ink-text-muted transition hover:text-ink-text sm:inline md:hidden"
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

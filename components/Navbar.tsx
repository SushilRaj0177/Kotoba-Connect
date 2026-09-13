import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";
import { getServerTranslator } from "@/lib/i18n/server";
import LanguageToggle from "@/components/i18n/LanguageToggle";
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
    <header className="sticky top-0 z-10 border-b border-discord-border bg-discord-bg-secondary">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex min-w-0 items-center gap-2">
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-2xl bg-discord-blurple font-jp text-sm font-bold text-white transition hover:rounded-xl">
            言
          </span>
          <span className="truncate text-sm font-semibold text-discord-text-header">
            # pragmatics-board
          </span>
        </Link>

        <div className="flex items-center gap-3">
          <LanguageToggle />
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden text-sm font-medium text-discord-text-muted transition hover:text-discord-text sm:inline"
            >
              {t("nav.moderation")}
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden items-center gap-1.5 sm:flex">
                <Avatar username={username ?? "user"} size={22} />
                <span className="text-sm text-discord-text-muted">@{username ?? "user"}</span>
              </div>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-discord-border px-3 py-1.5 text-sm font-medium text-discord-text transition hover:bg-discord-bg-hover"
                >
                  {t("nav.signOut")}
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-discord-blurple px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-discord-blurple-hover"
            >
              {t("nav.signIn")}
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

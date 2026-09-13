import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/auth/actions";

export default async function Navbar() {
  const supabase = createClient();
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
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="font-jp text-lg font-bold text-ink">
          言葉 <span className="text-sm font-sans font-medium text-slate-muted">Kotoba Engine</span>
        </Link>
        {user ? (
          <div className="flex items-center gap-3 text-sm">
            {isAdmin && (
              <Link href="/admin" className="font-medium text-accent hover:underline">
                Moderation
              </Link>
            )}
            <span className="hidden text-slate-muted sm:inline">@{username ?? "user"}</span>
            <form action={signOut}>
              <button
                type="submit"
                className="rounded-md border border-slate-200 px-3 py-1.5 font-medium text-ink transition hover:bg-slate-50"
              >
                Sign out
              </button>
            </form>
          </div>
        ) : (
          <Link
            href="/login"
            className="rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}

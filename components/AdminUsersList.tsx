import Link from "next/link";
import Avatar from "@/components/Avatar";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types/database";

// Admin-only user directory — every profile, newest first, with just
// enough signal (post count, admin/bot flags, join date) to spot who's
// actually active versus a dormant signup, without pulling email/auth
// data that doesn't need to leave the auth.users table for this.
export default async function AdminUsersList() {
  const supabase = createClient();

  const [{ data: profiles, count }, { data: entryRows }] = await Promise.all([
    supabase
      .from("profiles")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false }),
    supabase.from("context_entries").select("user_id"),
  ]);

  const entryCounts = new Map<string, number>();
  (entryRows ?? []).forEach((e) => {
    entryCounts.set(e.user_id, (entryCounts.get(e.user_id) ?? 0) + 1);
  });

  return (
    <div className="mb-6 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-text-header">
        All users ({count ?? profiles?.length ?? 0})
      </h2>
      <p className="mt-1 text-sm text-ink-text-muted">Every account, newest first.</p>

      <div className="mt-3 max-h-[28rem] space-y-1 overflow-y-auto">
        {(profiles as Profile[] | null)?.map((p) => (
          <Link
            key={p.id}
            href={`/u/${p.username}`}
            className="flex items-center gap-2.5 rounded-xl px-2 py-1.5 transition hover:bg-ink-bg-hover"
          >
            <Avatar username={p.username} avatarUrl={p.avatar_url} size={28} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="truncate text-sm font-semibold text-ink-text-header">
                  {p.display_name?.trim() || `@${p.username}`}
                </span>
                {p.is_admin && (
                  <span className="flex-none rounded-full bg-ink-accent/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-accent">
                    Admin
                  </span>
                )}
                {p.is_bot && (
                  <span className="flex-none rounded-full bg-ink-bg-input px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-text-muted">
                    Bot
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-ink-text-muted">
                @{p.username} · joined {new Date(p.created_at).toLocaleDateString()}
              </p>
            </div>
            <span className="flex-none text-xs text-ink-text-muted">
              {entryCounts.get(p.id) ?? 0} {entryCounts.get(p.id) === 1 ? "entry" : "entries"}
            </span>
          </Link>
        ))}
        {!profiles?.length && <p className="py-4 text-center text-sm text-ink-text-muted">No users yet.</p>}
      </div>
    </div>
  );
}

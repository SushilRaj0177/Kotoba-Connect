import Link from "next/link";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { t } = getServerTranslator();

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, reputation_score")
    .order("reputation_score", { ascending: false })
    .limit(50);

  const { data: entryCounts } = await supabase.from("context_entries").select("user_id");
  const counts = new Map<string, number>();
  (entryCounts ?? []).forEach((e) => counts.set(e.user_id, (counts.get(e.user_id) ?? 0) + 1));

  const RANK_COLORS = ["text-yellow-400", "text-gray-300", "text-amber-600"];

  return (
    <>
      <Navbar title={t("leaderboard.title")} />
      <main className="mx-auto max-w-2xl px-4 py-6 sm:px-6">
        <h1 className="mb-1 font-display text-xl font-bold text-ink-text-header">
          {t("leaderboard.title")}
        </h1>
        <p className="mb-6 text-sm text-ink-text-muted">{t("leaderboard.subtitle")}</p>

        {!profiles?.length ? (
          <EmptyState title={t("leaderboard.empty")} description="" />
        ) : (
          <ol className="space-y-2.5">
            {profiles.map((p, i) => (
              <li key={p.id}>
                <Link
                  href={`/u/${p.username}`}
                  className="flex items-center gap-3 rounded-2xl bg-ink-bg-secondary p-3.5 border-2 border-ink-border transition hover:border-ink-accent/40"
                >
                  <span
                    className={`w-7 flex-none text-center font-display text-base font-extrabold ${
                      RANK_COLORS[i] ?? "text-ink-text-muted"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Avatar username={p.username} size={40} />
                  <span className="min-w-0 flex-1 truncate font-display text-base font-bold text-ink-text-header">
                    @{p.username}
                  </span>
                  <span className="flex-none text-xs text-ink-text-muted">
                    {counts.get(p.id) ?? 0} {t("leaderboard.entries")}
                  </span>
                  <span className="flex-none text-sm font-bold text-ink-accent">
                    {p.reputation_score} {t("leaderboard.rep")}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  );
}

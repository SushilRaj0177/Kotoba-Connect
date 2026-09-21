import Link from "next/link";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import type { TopContributor } from "@/types/database";

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { t } = getServerTranslator();

  // Ranking comes from get_top_contributors (0019_engagement_score.sql) —
  // a weighted, time-decayed engagement score across every action type
  // (posting, annotating, commenting, voting, being followed), not just
  // reputation_score (a plain running count of upvotes received, which
  // let someone who posted twice, got lucky, and vanished outrank someone
  // actively annotating and commenting every day). The RPC already
  // excludes the bot, requires at least one scored action, and returns
  // rows pre-sorted by score — see the migration for the exact weights
  // and the 21-day half-life. reputation_score is still fetched for
  // display (a real, legible "likes earned" number) — it just no longer
  // decides the order.
  const [{ data: ranked }, { data: entryCounts }] = await Promise.all([
    supabase.rpc("get_top_contributors", { p_limit: 50 }) as unknown as PromiseLike<{ data: TopContributor[] | null }>,
    supabase.from("context_entries").select("user_id"),
  ]);

  const counts = new Map<string, number>();
  (entryCounts ?? []).forEach((e) => counts.set(e.user_id, (counts.get(e.user_id) ?? 0) + 1));

  const RANK_RING = ["ring-yellow-400/60 bg-yellow-400/5", "ring-gray-300/60 bg-gray-300/5", "ring-amber-600/60 bg-amber-600/5"];
  const RANK_TEXT = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const RANK_MEDAL = ["🥇", "🥈", "🥉"];

  const top3 = ranked?.slice(0, 3) ?? [];
  const rest = ranked?.slice(3) ?? [];

  return (
    <>
      <Navbar title={t("leaderboard.title")} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <p className="mb-6 text-sm text-ink-text-muted">{t("leaderboard.subtitle")}</p>

        {!ranked?.length ? (
          <EmptyState title={t("leaderboard.empty")} description="" />
        ) : (
          <>
            <div className="mb-4 grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {top3.map((p, i) => (
                <Link
                  key={p.id}
                  href={`/u/${p.username}`}
                  className={`flex items-center gap-3 rounded-2xl p-3.5 border shadow-sm ring-1 transition hover:-translate-y-0.5 ${RANK_RING[i]} border-ink-border/70`}
                >
                  <span className="flex-none text-lg">{RANK_MEDAL[i]}</span>
                  <Avatar username={p.username} avatarUrl={p.avatar_url} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block break-words font-display text-sm font-bold text-ink-text-header">
                      {p.display_name?.trim() || `@${p.username}`}
                    </span>
                    <span className="block text-xs text-ink-text-muted">
                      {counts.get(p.id) ?? 0} {t("leaderboard.entries")}
                    </span>
                  </span>
                  <span className={`flex-none text-sm font-extrabold ${RANK_TEXT[i]}`}>
                    {p.reputation_score} <span className="text-[10px] font-semibold">{t("leaderboard.rep")}</span>
                  </span>
                </Link>
              ))}
            </div>

            {!!rest.length && (
              <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {rest.map((p, i) => (
                  <li key={p.id}>
                    <Link
                      href={`/u/${p.username}`}
                      className="flex items-center gap-3 rounded-2xl bg-ink-bg-secondary p-3.5 border border-ink-border/70 shadow-sm transition hover:border-ink-accent/40"
                    >
                      <span className="w-7 flex-none text-center font-display text-base font-extrabold text-ink-text-muted">
                        {i + 4}
                      </span>
                      <Avatar username={p.username} avatarUrl={p.avatar_url} size={40} />
                      <span className="min-w-0 flex-1 break-words font-display text-base font-bold text-ink-text-header">
                        {p.display_name?.trim() || `@${p.username}`}
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
          </>
        )}
      </main>
    </>
  );
}

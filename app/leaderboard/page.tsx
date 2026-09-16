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
    .select("id, username, display_name, avatar_url, reputation_score")
    .order("reputation_score", { ascending: false })
    .limit(50);

  const { data: entryCounts } = await supabase.from("context_entries").select("user_id");
  const counts = new Map<string, number>();
  (entryCounts ?? []).forEach((e) => counts.set(e.user_id, (counts.get(e.user_id) ?? 0) + 1));

  const RANK_RING = ["ring-yellow-400/60 bg-yellow-400/5", "ring-gray-300/60 bg-gray-300/5", "ring-amber-600/60 bg-amber-600/5"];
  const RANK_TEXT = ["text-yellow-400", "text-gray-300", "text-amber-600"];
  const RANK_MEDAL = ["🥇", "🥈", "🥉"];

  const top3 = profiles?.slice(0, 3) ?? [];
  const rest = profiles?.slice(3) ?? [];

  return (
    <>
      <Navbar title={t("leaderboard.title")} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6">
        <p className="mb-6 text-sm text-ink-text-muted">{t("leaderboard.subtitle")}</p>

        {!profiles?.length ? (
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
                    <span className="block truncate font-display text-sm font-bold text-ink-text-header">
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
                      <span className="min-w-0 flex-1 truncate font-display text-base font-bold text-ink-text-header">
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

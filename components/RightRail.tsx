import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import UserHandle from "@/components/UserHandle";
import { Obake } from "@/components/mascots/candidates";
import type { TopContributor } from "@/types/database";

// Real supplementary content, not decoration — every reference app keeps
// this column populated (stats, trending, promos) so the page never reads
// as a lone empty form even before there's much user-generated content yet.
export default async function RightRail() {
  const supabase = createClient();
  const { t } = getServerTranslator();

  const [{ count: entryCount }, { count: userCount }, { data: topProfiles }, { data: recentEntries }] =
    await Promise.all([
      supabase.from("context_entries").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      // A weighted, time-decayed engagement score (posting, annotating,
      // commenting, voting, being followed) rather than a raw ordering by
      // reputation_score — see 0019_engagement_score.sql. Sorting only by
      // upvotes received let someone who posted twice and vanished
      // outrank someone actively engaging every day.
      supabase.rpc("get_top_contributors", { p_limit: 3 }),
      supabase.from("context_entries").select("tags").order("created_at", { ascending: false }).limit(200),
    ]);

  const tagCounts = new Map<string, number>();
  (recentEntries ?? []).forEach((e) => {
    (e.tags ?? []).forEach((tag: string) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
  });
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <aside className="hidden w-72 flex-none space-y-5 lg:block">
      <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
        <h2 className="mb-3 font-display text-base font-bold text-ink-text-header">{t("rail.communityTitle")}</h2>
        <dl className="space-y-2">
          <div className="flex items-center justify-between">
            <dt className="text-sm text-ink-text-muted">{t("rail.entries")}</dt>
            <dd className="font-display text-lg font-bold text-ink-accent">{entryCount ?? 0}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-sm text-ink-text-muted">{t("rail.members")}</dt>
            <dd className="font-display text-lg font-bold text-ink-link">{userCount ?? 0}</dd>
          </div>
        </dl>
      </div>

      {!!topProfiles?.length && (
        <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-ink-text-header">{t("rail.topContributorsTitle")}</h2>
            <Link href="/leaderboard" className="text-xs font-semibold text-ink-text-link hover:underline">
              {t("rail.viewAll")}
            </Link>
          </div>
          <ul className="space-y-2">
            {(topProfiles as TopContributor[]).map((p) => (
              <li key={p.username}>
                <UserHandle
                  username={p.username}
                  displayName={p.display_name}
                  avatarUrl={p.avatar_url}
                  href={`/u/${p.username}`}
                  size="sm"
                  className="w-full"
                />
              </li>
            ))}
          </ul>
        </div>
      )}

      {!!topTags.length && (
        <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
          <h2 className="mb-3 font-display text-base font-bold text-ink-text-header">{t("rail.trendingTagsTitle")}</h2>
          <div className="flex flex-wrap gap-1.5">
            {topTags.map(([tag, count]) => (
              <Link
                key={tag}
                href={`/tags/${encodeURIComponent(tag)}`}
                className="rounded-full bg-ink-bg-input px-2.5 py-1 text-xs text-ink-text-muted transition hover:text-ink-accent"
              >
                #{tag} <span className="text-ink-text-muted/70">{count}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
        <h2 className="mb-2 font-display text-base font-bold text-ink-text-header">{t("rail.aboutTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-text-muted">{t("rail.aboutBody")}</p>
      </div>

      {/* bg-ink-accent turns much lighter in dark/edge (a mid-contrast
         matcha green there, not the deep one light mode uses), so white
         text on it stops being readable — --c-on-accent is the text color
         each theme itself declares as correct for its own accent fill,
         rather than a value hardcoded here for one specific theme. */}
      <div className="bg-seigaiha relative overflow-hidden rounded-2xl bg-ink-accent p-4 text-[rgb(var(--c-on-accent))]">
        <Obake size={44} className="float-right ml-3 mb-1" />
        <h2 className="mb-1 font-display text-base font-bold">{t("rail.tipTitle")}</h2>
        <p className="text-sm leading-relaxed text-[rgb(var(--c-on-accent)/0.85)]">{t("rail.tipBody")}</p>
      </div>
    </aside>
  );
}

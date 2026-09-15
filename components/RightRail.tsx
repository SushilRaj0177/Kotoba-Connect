import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import UserHandle from "@/components/UserHandle";
import { Obake } from "@/components/mascots/candidates";

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
      supabase
        .from("profiles")
        .select("username, display_name, avatar_url, reputation_score")
        .order("reputation_score", { ascending: false })
        .limit(3),
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
            {topProfiles.map((p) => (
              <li key={p.username}>
                <UserHandle
                  username={p.username}
                  displayName={p.display_name}
                  avatarUrl={p.avatar_url}
                  href={`/u/${p.username}`}
                  size="sm"
                  className="w-full"
                  trailing={
                    <span className="ml-auto flex-none text-xs font-bold text-ink-accent">
                      {p.reputation_score}
                    </span>
                  }
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

      <div className="bg-seigaiha relative overflow-hidden rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
        <div className="float-right ml-3 mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-ink-accent/12">
          <Obake size={32} />
        </div>
        <h2 className="mb-1 font-display text-base font-bold text-ink-accent">{t("rail.tipTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-text-muted">{t("rail.tipBody")}</p>
      </div>
    </aside>
  );
}

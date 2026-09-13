import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

// Real supplementary content, not decoration — every reference app keeps
// this column populated (stats, trending, promos) so the page never reads
// as a lone empty form even before there's much user-generated content yet.
export default async function RightRail() {
  const supabase = createClient();
  const { t } = getServerTranslator();

  const [{ count: entryCount }, { count: userCount }] = await Promise.all([
    supabase.from("context_entries").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  return (
    <aside className="hidden w-72 flex-none space-y-4 lg:block">
      <div className="rounded-2xl bg-ink-bg-secondary p-4 border-2 border-ink-border">
        <h2 className="mb-3 text-sm font-extrabold text-ink-text-header">{t("rail.communityTitle")}</h2>
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

      <div className="rounded-2xl bg-ink-bg-secondary p-4 border-2 border-ink-border">
        <h2 className="mb-2 text-sm font-extrabold text-ink-text-header">{t("rail.aboutTitle")}</h2>
        <p className="text-sm leading-relaxed text-ink-text-muted">{t("rail.aboutBody")}</p>
      </div>

      <div className="rounded-2xl bg-gradient-to-br from-ink-accent to-ink-accent-2 p-4 text-white">
        <h2 className="mb-1 text-sm font-extrabold">{t("rail.tipTitle")}</h2>
        <p className="text-sm leading-relaxed text-white/90">{t("rail.tipBody")}</p>
      </div>
    </aside>
  );
}

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Mascot from "@/components/Mascot";
import { Obake } from "@/components/mascots/candidates";
import UserHandle from "@/components/UserHandle";
import FormalityBadge from "@/components/FormalityBadge";
import TokenizedText from "@/components/TokenizedText";
import AiNuanceCallout from "@/components/AiNuanceCallout";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import type { KuromojiToken, TopContributor } from "@/types/database";

// A static, illustrative example entry — not live data — so a first-time
// visitor sees exactly what posting and annotating looks like before
// being asked to sign in. The abstract "word-by-word nuance" feature
// blurb doesn't land nearly as well as actually seeing it.
const EARLY_STAGE_THRESHOLD = 25;

const EXAMPLE_TOKENS: KuromojiToken[] = [
  { word_id: 1, word_type: "KNOWN", surface_form: "お疲れ様", pos: "名詞", pos_detail_1: "*", basic_form: "お疲れ様", reading: "オツカレサマ" },
  { word_id: 2, word_type: "KNOWN", surface_form: "でした", pos: "助動詞", pos_detail_1: "*", basic_form: "です", reading: "デシタ" },
];

// The site has exactly two mascots, Kokeshi and Obake — introducing more
// characters (there used to be a fox and a cat here) reads as a bigger,
// inconsistent cast than actually exists anywhere else in the app. The
// features that aren't "about" one of the two get a plain icon tile
// instead, sized to match so the grid still reads as one family.
function FeatureIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-14 w-14 flex-none items-center justify-center rounded-2xl bg-ink-accent/10 text-ink-accent">
      {children}
    </div>
  );
}

// The marketing front door for signed-out visitors — previously "/" just
// showed the live board with a two-line heading above it, which meant a
// first-time visitor landed straight in an app UI with no explanation of
// what the product even is before being asked to sign in. Signed-in
// visitors never see this (app/page.tsx renders BoardView for them
// instead); this is reachable only when signed out.
export default async function LandingPage() {
  const { t } = getServerTranslator();
  const supabase = createClient();
  const [{ count: entryCount }, { count: userCount }, { data: topProfiles }, { data: recentEntries }] =
    await Promise.all([
      supabase.from("context_entries").select("id", { count: "exact", head: true }),
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      // Weighted, time-decayed engagement score rather than a raw
      // reputation_score ordering — see 0019_engagement_score.sql.
      supabase.rpc("get_top_contributors", { p_limit: 3 }),
      supabase.from("context_entries").select("tags").order("created_at", { ascending: false }).limit(200),
    ]);

  const tagCounts = new Map<string, number>();
  (recentEntries ?? []).forEach((e) => {
    (e.tags ?? []).forEach((tag: string) => tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1));
  });
  const topTags = [...tagCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);

  const steps = [
    { title: t("landing.step1Title"), body: t("landing.step1Body") },
    { title: t("landing.step2Title"), body: t("landing.step2Body") },
    { title: t("landing.step3Title"), body: t("landing.step3Body") },
  ];

  const features = [
    {
      mascot: <Mascot size={56} mood="happy" />,
      title: t("landing.feature1Title"),
      body: t("landing.feature1Body"),
    },
    {
      mascot: <Obake size={56} />,
      title: t("landing.feature2Title"),
      body: t("landing.feature2Body"),
    },
    {
      mascot: (
        <FeatureIcon>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M7 3h10v5a5 5 0 0 1-10 0V3Z" />
            <path d="M7 4H4.5a2 2 0 0 0 0 4c.5 1.5 1.6 2.7 3 3.3" />
            <path d="M17 4h2.5a2 2 0 0 1 0 4c-.5 1.5-1.6 2.7-3 3.3" />
            <path d="M12 15.5V19" />
            <path d="M8.5 21h7" />
          </svg>
        </FeatureIcon>
      ),
      title: t("landing.feature3Title"),
      body: t("landing.feature3Body"),
    },
    {
      mascot: (
        <FeatureIcon>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="9" />
            <path d="M3 12h18M12 3a13.5 13.5 0 0 1 0 18 13.5 13.5 0 0 1 0-18Z" />
          </svg>
        </FeatureIcon>
      ),
      title: t("landing.feature4Title"),
      body: t("landing.feature4Body"),
    },
  ];

  return (
    <>
      <Navbar title={t("app.name")} />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
        {/* Hero */}
        <section className="flex flex-col items-center gap-5 text-center">
          <div className="flex items-center gap-2">
            <Mascot size={72} mood="excited" />
            <Obake size={72} />
          </div>
          <h1 className="max-w-2xl font-display text-4xl font-black leading-tight text-ink-text-header sm:text-5xl">
            {t("landing.heroTitle")}
          </h1>
          <p className="max-w-xl text-base text-ink-text-muted sm:text-lg">{t("landing.heroSubtitle")}</p>
          <p className="max-w-xl text-sm text-ink-text-muted/90">{t("landing.audienceLine")}</p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/login"
              className="btn-chunky rounded-2xl px-6 py-3 text-sm font-bold text-white sm:text-base"
            >
              {t("landing.ctaSignIn")}
            </Link>
            <Link
              href="/board"
              className="rounded-2xl border border-ink-border px-6 py-3 text-sm font-bold text-ink-text transition hover:bg-ink-bg-hover sm:text-base"
            >
              {t("landing.ctaBrowse")}
            </Link>
          </div>
          {/* A raw "3 entries · 2 members" reads as a dead site, not an
             early one — the exact opposite of the intended trust signal.
             Below a credibility threshold, lean into the "early and
             growing" framing (which the About page also uses) instead of
             showing numbers small enough to undercut themselves. */}
          {(entryCount ?? 0) >= EARLY_STAGE_THRESHOLD && (userCount ?? 0) >= EARLY_STAGE_THRESHOLD ? (
            <div className="mt-1 flex items-center gap-6 text-sm text-ink-text-muted">
              <span>
                <strong className="font-display text-ink-text-header">{entryCount ?? 0}</strong>{" "}
                {t("landing.statsEntries")}
              </span>
              <span aria-hidden="true">·</span>
              <span>
                <strong className="font-display text-ink-text-header">{userCount ?? 0}</strong>{" "}
                {t("landing.statsMembers")}
              </span>
            </div>
          ) : (
            <p className="mt-1 max-w-sm rounded-full bg-ink-accent/10 px-4 py-1.5 text-xs font-semibold text-ink-accent">
              {t("landing.earlyBadge")}
            </p>
          )}
        </section>

        {/* Concrete example — a static illustration of what a real entry
           looks like, since "word-by-word nuance" as a phrase doesn't land
           nearly as well as actually seeing one. */}
        <section className="mx-auto mt-16 max-w-xl sm:mt-20">
          <p className="text-center text-xs font-bold uppercase tracking-wide text-ink-text-muted">
            {t("landing.exampleLabel")}
          </p>
          <div className="mt-3 rounded-2xl bg-ink-bg-secondary p-5 border border-ink-border/70 shadow-sm">
            <div className="mb-2 flex items-center gap-2">
              <UserHandle username="sushil" displayName="Sushil" size="sm" />
              <FormalityBadge level="Teineigo" />
            </div>
            <TokenizedText tokens={EXAMPLE_TOKENS} activeIndex={0} />
            <p className="mt-1 text-sm text-ink-text-muted">{t("landing.exampleTranslation")}</p>
            <AiNuanceCallout summary={t("landing.exampleAiRead")} formalitySuggestion={null} />
            <div className="mt-3 rounded-xl bg-ink-bg-input p-3">
              <p className="text-xs font-bold text-ink-text-header">
                {t("landing.exampleNoteLabel")} “{EXAMPLE_TOKENS[0].surface_form}”
              </p>
              <p className="mt-1 text-sm text-ink-text-muted">{t("landing.exampleNoteBody")}</p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-center font-display text-2xl font-black text-ink-text-header">
            {t("landing.featuresTitle")}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {features.map((f) => (
              <div
                key={f.title}
                className="flex gap-4 rounded-2xl bg-ink-bg-secondary p-5 border border-ink-border/70 shadow-sm"
              >
                <div className="flex-none">{f.mascot}</div>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-bold text-ink-text-header">{f.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-text-muted">{f.body}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-16 sm:mt-20">
          <h2 className="text-center font-display text-2xl font-black text-ink-text-header">
            {t("landing.howItWorksTitle")}
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div
                key={s.title}
                className="rounded-2xl bg-ink-bg-secondary p-5 border border-ink-border/70 shadow-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-ink-accent font-display text-sm font-black text-white">
                  {i + 1}
                </div>
                <h3 className="mt-3 font-display text-base font-bold text-ink-text-header">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-ink-text-muted">{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Live community activity — real data, not marketing copy, so a
           visitor can see the board actually has people on it before
           signing up. */}
        {(!!topProfiles?.length || !!topTags.length) && (
          <section className="mt-16 grid grid-cols-1 gap-4 sm:mt-20 sm:grid-cols-2">
            {!!topProfiles?.length && (
              <div className="rounded-2xl bg-ink-bg-secondary p-5 border border-ink-border/70 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-display text-base font-bold text-ink-text-header">
                    {t("rail.topContributorsTitle")}
                  </h2>
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
                        trailing={
                          <span className="ml-auto flex-none rounded-full bg-ink-accent/15 px-2 py-0.5 text-[11px] font-bold text-ink-accent">
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
              <div className="rounded-2xl bg-ink-bg-secondary p-5 border border-ink-border/70 shadow-sm">
                <h2 className="mb-3 font-display text-base font-bold text-ink-text-header">
                  {t("rail.trendingTagsTitle")}
                </h2>
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
          </section>
        )}

        {/* Closing CTA — text-[rgb(var(--c-on-accent))], not a hardcoded
           text-white: bg-ink-accent is a much lighter fill in dark/edge
           (needed for contrast against their dark page background), which
           flips white text on it to nearly unreadable. --c-on-accent is
           the text color each theme itself declares as correct for its
           own accent fill (near-black in dark/edge, white in light) —
           same fix already applied to RightRail's tip box. */}
        <section className="bg-seigaiha mt-16 rounded-2xl bg-ink-accent p-8 text-center text-[rgb(var(--c-on-accent))] sm:mt-20">
          <h2 className="font-display text-xl font-black sm:text-2xl">{t("landing.closingTitle")}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-[rgb(var(--c-on-accent)/0.85)] sm:text-base">{t("landing.closingBody")}</p>
          <Link
            href="/login"
            className="mt-5 inline-block rounded-2xl bg-white px-6 py-3 text-sm font-bold text-ink-accent shadow-md transition hover:scale-[1.03] sm:text-base"
          >
            {t("landing.ctaSignIn")}
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}

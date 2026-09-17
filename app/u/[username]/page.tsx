import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import FollowButton from "@/components/FollowButton";
import BlockButton from "@/components/BlockButton";
import ProfileBadges from "@/components/ProfileBadges";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import type { ContextEntry, Profile } from "@/types/database";

// Force this route to render fresh on every request instead of being
// eligible for Next.js's static/ISR caching. A profile page cached as
// static HTML can end up referencing a CSS chunk hash from whatever build
// produced that cached copy — if a later deploy replaces that chunk, the
// cached HTML keeps pointing at a file that no longer exists, and the
// browser falls back to unstyled defaults for this page's own styling
// (while shared component styles used elsewhere stay fine, since those
// chunks are still actively referenced). Follow state, entry counts, and
// streaks are all live data anyway, so this page was never a good caching
// candidate to begin with.
export const dynamic = "force-dynamic";

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("username", params.username)
    .single();

  if (!profile) notFound();

  const { data: entries } = await supabase
    .from("context_entries")
    .select("*, profiles!context_entries_user_id_fkey(username, display_name, avatar_url)")
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(50);

  let bookmarkedIds = new Set<string>();
  if (user && entries?.length) {
    const { data: saves } = await supabase
      .from("bookmarks")
      .select("entry_id")
      .eq("user_id", user.id)
      .in(
        "entry_id",
        entries.map((e) => e.id)
      );
    bookmarkedIds = new Set((saves ?? []).map((s) => s.entry_id));
  }

  const [{ count: followerCount }, { count: followingCount }, { data: viewerFollow }, { data: viewerBlock }] =
    await Promise.all([
      supabase.from("user_follows").select("follower_id", { count: "exact", head: true }).eq("following_id", profile.id),
      supabase.from("user_follows").select("following_id", { count: "exact", head: true }).eq("follower_id", profile.id),
      user
        ? supabase
            .from("user_follows")
            .select("follower_id")
            .eq("follower_id", user.id)
            .eq("following_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("user_blocks")
            .select("blocker_id")
            .eq("blocker_id", user.id)
            .eq("blocked_id", profile.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

  const joined = new Date((profile as Profile).created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  // current_streak only recomputes on the next post, so a lapsed streak
  // would otherwise keep showing its old count forever — fall back to 0
  // once more than a day has passed since the last post.
  const typedProfile = profile as Profile;
  const daysSinceLastPost = typedProfile.last_post_date
    ? Math.floor((Date.now() - new Date(`${typedProfile.last_post_date}T00:00:00Z`).getTime()) / 86400000)
    : Infinity;
  const effectiveStreak = daysSinceLastPost <= 1 ? typedProfile.current_streak : 0;

  return (
    <>
      <Navbar title={profile.display_name?.trim() || `@${profile.username}`} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
        <div className="mb-6 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
          <div className="flex items-start gap-3">
            <Avatar username={profile.username} avatarUrl={profile.avatar_url} size={56} />
            <div className="min-w-0 flex-1 pt-0.5">
              <h1 className="truncate font-display text-lg font-bold text-ink-text-header sm:text-xl">
                {profile.display_name?.trim() || `@${profile.username}`}
              </h1>
              {profile.display_name?.trim() && (
                <p className="truncate text-sm text-ink-text-muted">@{profile.username}</p>
              )}
            </div>
            <div className="flex-none">
              {user?.id === profile.id ? (
                <a
                  href="/settings"
                  className="rounded-full bg-ink-bg-input px-3 py-1.5 text-xs font-semibold text-ink-text transition hover:bg-ink-bg-hover"
                >
                  {t("profile.editProfile")}
                </a>
              ) : (
                <div className="flex items-center gap-1.5">
                  <FollowButton
                    profileId={profile.id}
                    currentUserId={user?.id ?? null}
                    initialFollowing={!!viewerFollow}
                  />
                  <BlockButton
                    profileId={profile.id}
                    currentUserId={user?.id ?? null}
                    initialBlocked={!!viewerBlock}
                  />
                </div>
              )}
            </div>
          </div>

          {(profile.bio || profile.website) && (
            <div className="mt-3 space-y-1">
              {profile.bio && <p className="text-sm leading-relaxed text-ink-text">{profile.bio}</p>}
              {profile.website && (
                <a
                  href={profile.website}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block text-sm text-ink-text-link hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, "")}
                </a>
              )}
            </div>
          )}

          <div
            className={`mt-4 grid grid-cols-2 gap-2 border-t border-ink-border pt-4 sm:grid-cols-4 ${
              effectiveStreak > 0 ? "sm:grid-cols-5" : ""
            }`}
          >
            <div className="rounded-xl bg-ink-bg-input p-2.5 text-center">
              <p className="font-display text-base font-extrabold text-ink-text-header">{entries?.length ?? 0}</p>
              <p className="text-xs text-ink-text-muted">{t("profile.entriesPosted")}</p>
            </div>
            <div className="rounded-xl bg-ink-bg-input p-2.5 text-center">
              <p className="font-display text-base font-extrabold text-ink-accent">{profile.reputation_score}</p>
              <p className="text-xs text-ink-text-muted">{t("profile.reputation")}</p>
            </div>
            <div className="rounded-xl bg-ink-bg-input p-2.5 text-center">
              <p className="font-display text-base font-extrabold text-ink-text-header">{followerCount ?? 0}</p>
              <p className="text-xs text-ink-text-muted">{t("profile.followers")}</p>
            </div>
            <div className="rounded-xl bg-ink-bg-input p-2.5 text-center">
              <p className="font-display text-base font-extrabold text-ink-text-header">{followingCount ?? 0}</p>
              <p className="text-xs text-ink-text-muted">{t("profile.following")}</p>
            </div>
            {effectiveStreak > 0 && (
              <div
                className="rounded-xl bg-ink-bg-input p-2.5 text-center"
                title={`${t("profile.longestStreak")}: ${typedProfile.longest_streak}`}
              >
                <p className="font-display text-base font-extrabold text-ink-text-header">🔥 {effectiveStreak}</p>
                <p className="text-xs text-ink-text-muted">{t("profile.streak")}</p>
              </div>
            )}
          </div>
          <p className="mt-3 text-xs text-ink-text-muted">
            {t("profile.memberSince")} {joined}
          </p>

          <ProfileBadges
            entryCount={entries?.length ?? 0}
            reputation={profile.reputation_score}
            longestStreak={typedProfile.longest_streak}
            followerCount={followerCount ?? 0}
          />
        </div>

        {!entries?.length ? (
          <EmptyState
            title={t("profile.noEntriesTitle")}
            description={t("profile.noEntriesDescription")}
          />
        ) : (
          <div className="columns-1 gap-4 lg:columns-2">
            {entries.map((entry) => (
              <div key={entry.id} className="mb-4 break-inside-avoid">
                <EntryCard
                  entry={entry as ContextEntry}
                  currentUserId={user?.id ?? null}
                  bookmarked={bookmarkedIds.has(entry.id)}
                />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

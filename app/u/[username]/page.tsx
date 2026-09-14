import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import FollowButton from "@/components/FollowButton";
import BlockButton from "@/components/BlockButton";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import type { ContextEntry, Profile } from "@/types/database";

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
    .select("*, profiles!context_entries_user_id_fkey(username, avatar_url)")
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
      <Navbar title={`@${profile.username}`} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-6 flex items-start gap-4 rounded-2xl bg-ink-bg-secondary p-5 border border-ink-border/70 shadow-sm">
          <Avatar username={profile.username} size={72} />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-ink-text-header">
                @{profile.username}
              </h1>
              {user?.id === profile.id ? (
                <a
                  href="/settings"
                  className="rounded-full bg-ink-bg-input px-3 py-1 text-xs font-semibold text-ink-text transition hover:bg-ink-bg-hover"
                >
                  {t("profile.editProfile")}
                </a>
              ) : (
                <>
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
                </>
              )}
            </div>
            {profile.bio && <p className="mt-1.5 text-sm text-ink-text">{profile.bio}</p>}
            {profile.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noreferrer"
                className="mt-1 inline-block text-sm text-ink-text-link hover:underline"
              >
                {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-ink-text-muted">
              <span>
                <strong className="text-ink-text-header">{entries?.length ?? 0}</strong>{" "}
                {t("profile.entriesPosted")}
              </span>
              <span>
                <strong className="text-ink-text-header">{profile.reputation_score}</strong>{" "}
                {t("profile.reputation")}
              </span>
              <span>
                <strong className="text-ink-text-header">{followerCount ?? 0}</strong>{" "}
                {t("profile.followers")}
              </span>
              <span>
                <strong className="text-ink-text-header">{followingCount ?? 0}</strong>{" "}
                {t("profile.following")}
              </span>
              {effectiveStreak > 0 && (
                <span title={`${t("profile.longestStreak")}: ${typedProfile.longest_streak}`}>
                  🔥 <strong className="text-ink-text-header">{effectiveStreak}</strong>{" "}
                  {t("profile.streak")}
                </span>
              )}
              <span>
                {t("profile.memberSince")} {joined}
              </span>
            </div>
          </div>
        </div>

        {!entries?.length ? (
          <EmptyState
            title={t("profile.noEntriesTitle")}
            description={t("profile.noEntriesDescription")}
          />
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry as ContextEntry}
                currentUserId={user?.id ?? null}
                bookmarked={bookmarkedIds.has(entry.id)}
              />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

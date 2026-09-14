import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Avatar from "@/components/Avatar";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
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

  const joined = new Date((profile as Profile).created_at).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

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
              {user?.id === profile.id && (
                <a
                  href="/settings"
                  className="rounded-full bg-ink-bg-input px-3 py-1 text-xs font-semibold text-ink-text transition hover:bg-ink-bg-hover"
                >
                  {t("profile.editProfile")}
                </a>
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

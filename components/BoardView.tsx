import Navbar from "@/components/Navbar";
import EntryBoard from "@/components/EntryBoard";
import RightRail from "@/components/RightRail";
import { createClient, getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { ENTRY_WITH_PROFILE_COLUMNS } from "@/lib/entry-columns";
import type { ContextEntry } from "@/types/database";

// The board itself — shared by "/" (shown directly to signed-in visitors)
// and "/board" (reachable by anyone, including signed-out visitors who
// want to browse without an account instead of stopping at the landing
// page). Keeping this in one place means both routes fetch and render it
// identically instead of drifting apart.
export default async function BoardView() {
  const { t } = getServerTranslator();
  const supabase = createClient();

  // None of these three depend on each other's result (getCurrentProfile
  // internally awaits the same cached getCurrentUser() call rather than
  // needing it passed in, and returns null itself when signed out) — all
  // three go out together instead of paying for round trips back to back.
  const [user, profile, { data: initialData }] = await Promise.all([
    getCurrentUser(),
    getCurrentProfile(),
    supabase
      .from("context_entries")
      .select(ENTRY_WITH_PROFILE_COLUMNS)
      .order("created_at", { ascending: false })
      .range(0, 29), // matches EntryBoard's PAGE_SIZE (30) so "load more" continues seamlessly
  ]);
  const username = profile?.username ?? null;
  const avatarUrl = profile?.avatar_url ?? null;

  // Server-render the board's default view (newest, unfiltered) so the feed
  // paints immediately instead of every visit showing a skeleton while
  // EntryBoard's client-side fetch runs after hydration. Any other
  // sort/filter/search the user picks still goes through the normal client
  // fetch — this only covers the page's very first paint.

  let initialVotedIds = new Set<string>();
  let initialBookmarkedIds = new Set<string>();
  const initialCommentCounts: Record<string, number> = {};
  if (initialData?.length) {
    const ids = initialData.map((e) => e.id);
    const [{ data: votes }, { data: saves }, { data: commentRows }] = await Promise.all([
      user
        ? supabase.from("entry_upvotes").select("entry_id").eq("user_id", user.id).in("entry_id", ids)
        : Promise.resolve({ data: [] as { entry_id: string }[] }),
      user
        ? supabase.from("bookmarks").select("entry_id").eq("user_id", user.id).in("entry_id", ids)
        : Promise.resolve({ data: [] as { entry_id: string }[] }),
      supabase.from("entry_comments").select("entry_id").in("entry_id", ids),
    ]);
    initialVotedIds = new Set((votes ?? []).map((v) => v.entry_id));
    initialBookmarkedIds = new Set((saves ?? []).map((s) => s.entry_id));
    (commentRows ?? []).forEach((c) => {
      initialCommentCounts[c.entry_id] = (initialCommentCounts[c.entry_id] ?? 0) + 1;
    });
  }
  const initialEntries = (initialData ?? []).map(
    (e) =>
      ({
        ...e,
        has_voted: initialVotedIds.has(e.id),
        is_bookmarked: initialBookmarkedIds.has(e.id),
      }) as unknown as ContextEntry
  );

  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-5xl gap-6 px-4 py-6 sm:px-6">
        <div className="min-w-0 flex-1">
          {/* Only shown to signed-out visitors — a returning member already
             knows what this app is (it's also in the sidebar's "What is
             this?" card), so skip straight to the compose trigger and feed
             instead of repeating an intro on every single visit. */}
          {!user && (
            <div className="mb-7">
              <h1 className="font-display text-3xl font-black text-ink-text-header">{t("home.title")}</h1>
              <p className="mt-1 text-base text-ink-text-muted">{t("home.subtitle")}</p>
            </div>
          )}
          <EntryBoard
            userId={user?.id ?? null}
            username={username}
            avatarUrl={avatarUrl}
            initialEntries={initialEntries}
            initialCommentCounts={initialCommentCounts}
          />
        </div>
        <RightRail />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { ENTRY_WITH_PROFILE_COLUMNS } from "@/lib/entry-columns";
import type { ContextEntry } from "@/types/database";

export const metadata: Metadata = { title: "Bookmarks", robots: { index: false, follow: false } };
// Experiment: Vercel's default Node.js serverless functions have real
// cold-start overhead (spinning up a fresh container before your code even
// starts) — Edge Runtime functions don't, which is a large part of why
// "instant"-feeling apps feel that way. Everything this page touches
// (@supabase/ssr, next/headers) is edge-compatible. Testing on this one
// page first, since it's the one specifically reported as slow, before
// rolling it out further.
export const runtime = "edge";

export default async function BookmarksPage() {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select(`entry_id, context_entries(${ENTRY_WITH_PROFILE_COLUMNS})`)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const entries = (bookmarks ?? [])
    .map((b) => b.context_entries as unknown as ContextEntry)
    .filter(Boolean);

  return (
    <>
      <Navbar title={t("bookmarks.title")} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
        {!entries.length ? (
          <EmptyState
            title={t("bookmarks.emptyTitle")}
            description={t("bookmarks.emptyDescription")}
            variant="obake"
          />
        ) : (
          <div className="columns-1 gap-4 lg:columns-2">
            {entries.map((entry) => (
              <div key={entry.id} className="mb-4 break-inside-avoid">
                <EntryCard entry={entry} currentUserId={user.id} bookmarked />
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

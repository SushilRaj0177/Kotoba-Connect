import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import type { ContextEntry } from "@/types/database";

export default async function BookmarksPage() {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const { data: bookmarks } = await supabase
    .from("bookmarks")
    .select("entry_id, context_entries(*, profiles!context_entries_user_id_fkey(username, avatar_url))")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const entries = (bookmarks ?? [])
    .map((b) => b.context_entries as unknown as ContextEntry)
    .filter(Boolean);

  return (
    <>
      <Navbar title={t("bookmarks.title")} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {!entries.length ? (
          <EmptyState
            title={t("bookmarks.emptyTitle")}
            description={t("bookmarks.emptyDescription")}
          />
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <EntryCard key={entry.id} entry={entry} currentUserId={user.id} bookmarked />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

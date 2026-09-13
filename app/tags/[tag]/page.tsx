import Navbar from "@/components/Navbar";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import type { ContextEntry } from "@/types/database";

export default async function TagPage({ params }: { params: { tag: string } }) {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const tag = decodeURIComponent(params.tag);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entries } = await supabase
    .from("context_entries")
    .select("*, profiles!context_entries_user_id_fkey(username, avatar_url)")
    .contains("tags", [tag])
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

  return (
    <>
      <Navbar title={`#${tag}`} />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-4 font-display text-xl font-bold text-ink-text-header">
          {t("tags.heading")} <span className="text-ink-accent">#{tag}</span>
        </h1>

        {!entries?.length ? (
          <EmptyState title={t("tags.empty")} description="" />
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

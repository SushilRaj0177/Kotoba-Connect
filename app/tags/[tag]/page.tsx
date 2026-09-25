import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import EntryCard from "@/components/EntryCard";
import EmptyState from "@/components/EmptyState";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";
import { ENTRY_WITH_PROFILE_COLUMNS } from "@/lib/entry-columns";
import type { ContextEntry } from "@/types/database";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export function generateMetadata({ params }: { params: { tag: string } }): Metadata {
  const tag = decodeURIComponent(params.tag);
  return {
    title: `#${tag}`,
    description: `Japanese sentences tagged #${tag} on Kotoba Engine.`,
    alternates: { canonical: `/tags/${encodeURIComponent(tag)}` },
  };
}

export default async function TagPage({ params }: { params: { tag: string } }) {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const tag = decodeURIComponent(params.tag);

  // Independent of each other — the tag query doesn't need to know who's
  // viewing, so don't make it wait behind the auth check.
  const [user, { data: entries }] = await Promise.all([
    getCurrentUser(),
    supabase
      .from("context_entries")
      .select(ENTRY_WITH_PROFILE_COLUMNS)
      .contains("tags", [tag])
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

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
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:max-w-5xl">
        {/* h2, not h1 — Navbar already renders the page's one h1 (the tag, via its title prop above) */}
        <h2 className="mb-4 font-display text-xl font-bold text-ink-text-header">
          {t("tags.heading")} <span className="text-ink-accent">#{tag}</span>
        </h2>

        {!entries?.length ? (
          <EmptyState title={t("tags.empty")} description="" variant="obake" />
        ) : (
          <div className="columns-1 gap-4 lg:columns-2">
            {entries.map((entry) => (
              <div key={entry.id} className="mb-4 break-inside-avoid">
                <EntryCard
                  entry={entry as unknown as ContextEntry}
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

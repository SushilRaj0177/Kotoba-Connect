import { cache } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import EntryDetail from "@/components/EntryDetail";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import { ENTRY_WITH_PROFILE_COLUMNS } from "@/lib/entry-columns";
import type { ContextEntry } from "@/types/database";
import { getServerTranslator } from "@/lib/i18n/server";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

// Shared by generateMetadata and the page body below — without cache(),
// the same context_entries row was fetched twice per request (once for
// the title/description, once for the actual page content).
const getEntryById = cache(async (id: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from("context_entries")
    .select(ENTRY_WITH_PROFILE_COLUMNS)
    .eq("id", id)
    .single();
  return data;
});

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const entry = await getEntryById(params.id);

  if (!entry) return { title: "Entry not found" };

  const title = entry.raw_japanese;
  const description = entry.primary_translation;

  return {
    title,
    description,
    alternates: { canonical: `/entries/${params.id}` },
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EntryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { t } = getServerTranslator();

  // Independent of each other — fetching the entry doesn't need to know
  // who's viewing, so don't make it wait behind the auth check.
  // getEntryById is cache()'d, so this reuses generateMetadata's fetch
  // above instead of hitting the DB a second time for the same row.
  const [user, entry] = await Promise.all([getCurrentUser(), getEntryById(params.id)]);

  if (!entry) notFound();

  let bookmarked = false;
  if (user) {
    const { data: save } = await supabase
      .from("bookmarks")
      .select("entry_id")
      .eq("user_id", user.id)
      .eq("entry_id", params.id)
      .maybeSingle();
    bookmarked = !!save;
  }

  return (
    <>
      <Navbar title={entry.raw_japanese} />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:max-w-5xl">
        <Link
          href={user ? "/" : "/board"}
          className="mb-4 inline-block text-sm font-medium text-ink-text-link hover:underline"
        >
          {t("detail.back")}
        </Link>
        <EntryDetail entry={entry as unknown as ContextEntry} userId={user?.id ?? null} bookmarked={bookmarked} />
      </main>
    </>
  );
}

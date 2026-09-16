import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import EntryDetail from "@/components/EntryDetail";
import { createClient, getCurrentUser } from "@/lib/supabase/server";
import type { ContextEntry } from "@/types/database";
import { getServerTranslator } from "@/lib/i18n/server";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const { data: entry } = await supabase
    .from("context_entries")
    .select("raw_japanese, primary_translation")
    .eq("id", params.id)
    .single();

  if (!entry) return { title: "Entry not found" };

  const title = entry.raw_japanese;
  const description = entry.primary_translation;

  return {
    title,
    description,
    openGraph: { title, description, type: "article" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function EntryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  const { data: entry } = await supabase
    .from("context_entries")
    .select("*, profiles!context_entries_user_id_fkey(username, display_name, avatar_url, is_bot)")
    .eq("id", params.id)
    .single();

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
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:max-w-5xl">
        <Link
          href={user ? "/" : "/board"}
          className="mb-4 inline-block text-sm font-medium text-ink-text-link hover:underline"
        >
          {t("detail.back")}
        </Link>
        <EntryDetail entry={entry as ContextEntry} userId={user?.id ?? null} bookmarked={bookmarked} />
      </main>
    </>
  );
}

import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import EntryDetail from "@/components/EntryDetail";
import { createClient } from "@/lib/supabase/server";
import type { ContextEntry } from "@/types/database";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function EntryPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: entry } = await supabase
    .from("context_entries")
    .select("*, profiles!context_entries_user_id_fkey(username, avatar_url)")
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
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <Link
          href="/"
          className="mb-4 inline-block text-sm font-medium text-ink-text-link hover:underline"
        >
          {t("detail.back")}
        </Link>
        <EntryDetail entry={entry as ContextEntry} userId={user?.id ?? null} bookmarked={bookmarked} />
      </main>
    </>
  );
}

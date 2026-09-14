import Navbar from "@/components/Navbar";
import EntryBoard from "@/components/EntryBoard";
import RightRail from "@/components/RightRail";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function HomePage() {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let username: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("username")
      .eq("id", user.id)
      .single();
    username = profile?.username ?? null;
  }

  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-5xl gap-6 px-4 py-6 sm:px-6">
        <div className="min-w-0 flex-1">
          <div className="mb-7">
            <h1 className="font-display text-3xl font-black text-ink-text-header">{t("home.title")}</h1>
            <p className="mt-1 text-base text-ink-text-muted">{t("home.subtitle")}</p>
          </div>
          <EntryBoard userId={user?.id ?? null} username={username} />
        </div>
        <RightRail />
      </main>
    </>
  );
}

import Navbar from "@/components/Navbar";
import EntryBoard from "@/components/EntryBoard";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function HomePage() {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink-text-header">{t("home.title")}</h1>
          <p className="text-sm text-ink-text-muted">{t("home.subtitle")}</p>
        </div>
        <EntryBoard userId={user?.id ?? null} />
      </main>
    </>
  );
}

import Navbar from "@/components/Navbar";
import RightRail from "@/components/RightRail";
import SearchView from "@/components/SearchView";
import { getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function SearchPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  return (
    <>
      <Navbar title={t("nav.search")} />
      <main className="mx-auto flex max-w-5xl gap-6 px-4 py-6 sm:px-6">
        <div className="min-w-0 flex-1">
          <SearchView userId={user?.id ?? null} />
        </div>
        <RightRail />
      </main>
    </>
  );
}

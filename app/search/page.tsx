import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import RightRail from "@/components/RightRail";
import SearchView from "@/components/SearchView";
import { getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Search",
  description: "Search Japanese sentences by meaning, not just keyword.",
};

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

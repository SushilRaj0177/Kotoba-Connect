import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ReadingAidSettings from "@/components/settings/ReadingAidSettings";
import SettingsSubpageHeader from "@/components/settings/SettingsSubpageHeader";
import { getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export const metadata: Metadata = { title: "Reading aid settings", robots: { index: false, follow: false } };

export default async function ReadingAidSettingsPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.rows.readingAid")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <SettingsSubpageHeader backLabel={t("settings.backToSettings")} title={t("settings.rows.readingAid")} />
        <ReadingAidSettings />
      </main>
    </>
  );
}

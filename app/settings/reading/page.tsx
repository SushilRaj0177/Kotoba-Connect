import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ReadingAidSettings from "@/components/settings/ReadingAidSettings";
import SettingsSubpageHeader from "@/components/settings/SettingsSubpageHeader";
import { getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

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

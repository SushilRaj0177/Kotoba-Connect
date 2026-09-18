import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import NotificationSettings from "@/components/settings/NotificationSettings";
import SettingsSubpageHeader from "@/components/settings/SettingsSubpageHeader";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function NotificationSettingsPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.rows.notifications")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <SettingsSubpageHeader backLabel={t("settings.backToSettings")} title={t("settings.rows.notifications")} />
        <NotificationSettings profile={profile} />
      </main>
    </>
  );
}

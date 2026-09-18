import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ProfileSummaryCard from "@/components/settings/ProfileSummaryCard";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";
import SettingsSubpageHeader from "@/components/settings/SettingsSubpageHeader";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ProfileSettingsPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.tabs.profile")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <SettingsSubpageHeader backLabel={t("settings.backToSettings")} title={t("settings.tabs.profile")} />
        <ProfileSummaryCard profile={profile} email={user.email ?? null} />
        <ProfileSettingsForm profile={profile} />
      </main>
    </>
  );
}

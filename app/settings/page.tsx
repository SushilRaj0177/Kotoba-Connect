import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import BlockedUsersManager from "@/components/BlockedUsersManager";
import ThemeSettings from "@/components/settings/ThemeSettings";
import ProfileSummaryCard from "@/components/settings/ProfileSummaryCard";
import ProfileSettingsForm from "@/components/settings/ProfileSettingsForm";
import AccountSettings from "@/components/settings/AccountSettings";
import SettingsTabs from "@/components/settings/SettingsTabs";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = await getCurrentProfile();

  if (!profile) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.title")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <ProfileSummaryCard profile={profile} email={user.email ?? null} />
        <SettingsTabs
          profile={<ProfileSettingsForm profile={profile} />}
          account={<AccountSettings />}
          privacy={<BlockedUsersManager userId={user.id} />}
          appearance={<ThemeSettings />}
        />
      </main>
    </>
  );
}

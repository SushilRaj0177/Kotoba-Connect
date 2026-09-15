import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SettingsForm from "@/components/SettingsForm";
import BlockedUsersManager from "@/components/BlockedUsersManager";
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
        <SettingsForm profile={profile} email={user.email ?? null} />
        <BlockedUsersManager userId={user.id} />
      </main>
    </>
  );
}

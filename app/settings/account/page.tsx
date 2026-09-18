import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AccountSettings from "@/components/settings/AccountSettings";
import SettingsSubpageHeader from "@/components/settings/SettingsSubpageHeader";
import { getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function AccountSettingsPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.tabs.account")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <SettingsSubpageHeader backLabel={t("settings.backToSettings")} title={t("settings.tabs.account")} />
        <AccountSettings email={user.email ?? null} />
      </main>
    </>
  );
}

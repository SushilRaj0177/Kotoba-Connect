import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import BlockedUsersManager from "@/components/BlockedUsersManager";
import SettingsSubpageHeader from "@/components/settings/SettingsSubpageHeader";
import { getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Privacy settings", robots: { index: false, follow: false } };

export default async function PrivacySettingsPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.tabs.privacy")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <SettingsSubpageHeader backLabel={t("settings.backToSettings")} title={t("settings.tabs.privacy")} />
        <BlockedUsersManager userId={user.id} />
      </main>
    </>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import ThemeSettings from "@/components/settings/ThemeSettings";
import DensitySettings from "@/components/settings/DensitySettings";
import SettingsSubpageHeader from "@/components/settings/SettingsSubpageHeader";
import { getCurrentUser } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Appearance settings", robots: { index: false, follow: false } };

export default async function AppearanceSettingsPage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.tabs.appearance")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6 lg:max-w-3xl">
        <SettingsSubpageHeader backLabel={t("settings.backToSettings")} title={t("settings.tabs.appearance")} />
        <ThemeSettings />
        <DensitySettings />
      </main>
    </>
  );
}

import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsRow from "@/components/settings/SettingsRow";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

// Settings used to be one long page (then, briefly, one page split into
// tabs) — this instead makes it a short landing list of grouped rows,
// each drilling into its own dedicated page (see the profile/account/
// privacy/appearance subdirectories). Nothing here needs any of the
// profile/account data itself, just confirmation that someone's signed
// in — the actual settings forms fetch what they need on their own page.
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
        <SettingsGroup title={t("settings.section.account")}>
          <SettingsRow
            href="/settings/profile"
            label={t("settings.tabs.profile")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4.4 3.6-7 8-7s8 2.6 8 7" />
              </svg>
            }
          />
          <SettingsRow
            href="/settings/account"
            label={t("settings.tabs.account")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            }
          />
          <SettingsRow
            href="/settings/privacy"
            label={t("settings.tabs.privacy")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 4 6v6c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V6l-8-3z" />
              </svg>
            }
          />
        </SettingsGroup>

        <SettingsGroup title={t("settings.section.appearance")}>
          <SettingsRow
            href="/settings/appearance"
            label={t("settings.tabs.appearance")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            }
          />
        </SettingsGroup>
      </main>
    </>
  );
}

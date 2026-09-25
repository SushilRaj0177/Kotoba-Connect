import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SettingsGroup from "@/components/settings/SettingsGroup";
import SettingsRow from "@/components/settings/SettingsRow";
import SignOutRow from "@/components/settings/SignOutRow";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

// robots: noindex — an account's own settings pages have nothing worth
// surfacing in search results, and shouldn't be linkable/discoverable
export const metadata: Metadata = { title: "Settings", robots: { index: false, follow: false } };

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
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            }
          />
          <SettingsRow
            href="/settings/notifications"
            label={t("settings.rows.notifications")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
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
          <SettingsRow
            href="/settings/reading"
            label={t("settings.rows.readingAid")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5v-17Z" />
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              </svg>
            }
          />
        </SettingsGroup>

        <SettingsGroup title={t("settings.section.legal")}>
          <SettingsRow
            href="/terms"
            label={t("settings.rows.terms")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
                <path d="M14 3v5h5" />
                <path d="M9 13h6M9 17h6" />
              </svg>
            }
          />
          <SettingsRow
            href="/privacy"
            label={t("settings.rows.privacy")}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            }
          />
        </SettingsGroup>

        <div className="mb-6 overflow-hidden rounded-2xl border border-ink-red/40 bg-ink-red/5">
          <SignOutRow label={t("nav.signOut")} />
        </div>
      </main>
    </>
  );
}

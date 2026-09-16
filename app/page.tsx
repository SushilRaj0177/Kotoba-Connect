import Navbar from "@/components/Navbar";
import EntryBoard from "@/components/EntryBoard";
import RightRail from "@/components/RightRail";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function HomePage() {
  const { t } = getServerTranslator();
  const user = await getCurrentUser();
  const profile = user ? await getCurrentProfile() : null;
  const username = profile?.username ?? null;
  const avatarUrl = profile?.avatar_url ?? null;

  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-5xl gap-6 px-4 py-6 sm:px-6">
        <div className="min-w-0 flex-1">
          {/* Only shown to signed-out visitors — a returning member already
             knows what this app is (it's also in the sidebar's "What is
             this?" card), so skip straight to the compose trigger and feed
             instead of repeating an intro on every single visit. */}
          {!user && (
            <div className="mb-7">
              <h1 className="font-display text-3xl font-black text-ink-text-header">{t("home.title")}</h1>
              <p className="mt-1 text-base text-ink-text-muted">{t("home.subtitle")}</p>
            </div>
          )}
          <EntryBoard userId={user?.id ?? null} username={username} avatarUrl={avatarUrl} />
        </div>
        <RightRail />
      </main>
    </>
  );
}

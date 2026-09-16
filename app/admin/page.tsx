import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminQueue from "@/components/AdminQueue";
import BotSeedPanel from "@/components/BotSeedPanel";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = await getCurrentProfile();

  if (!profile?.is_admin) redirect("/");

  return (
    <>
      <Navbar title="Moderation" />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <h1 className="mb-1 text-xl font-bold text-ink-text-header">Moderation queue</h1>
        <p className="mb-6 text-sm text-ink-text-muted">
          Reports filed by the community. Dismiss false positives, or delete content that
          breaks the rules.
        </p>
        <BotSeedPanel />
        <AdminQueue />
      </main>
    </>
  );
}

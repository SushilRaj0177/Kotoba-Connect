import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminQueue from "@/components/AdminQueue";
import BotSeedPanel from "@/components/BotSeedPanel";
import BackfillEmbeddingsPanel from "@/components/BackfillEmbeddingsPanel";
import AdminUsersList from "@/components/AdminUsersList";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/server";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

// robots: noindex — admin-only, nothing here should ever surface in search results
export const metadata: Metadata = { title: "Moderation", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) redirect("/login");

  const profile = await getCurrentProfile();

  if (!profile?.is_admin) redirect("/");

  return (
    <>
      <Navbar title="Moderation" />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        {/* h2, not h1 — Navbar already renders the page's one h1 ("Moderation", via its title prop above) */}
        <h2 className="mb-1 text-xl font-bold text-ink-text-header">Moderation queue</h2>
        <p className="mb-6 text-sm text-ink-text-muted">
          Reports filed by the community. Dismiss false positives, or delete content that
          breaks the rules.
        </p>
        <BotSeedPanel />
        <BackfillEmbeddingsPanel />
        <AdminUsersList />
        <AdminQueue />
      </main>
    </>
  );
}

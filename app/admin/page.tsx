import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import AdminQueue from "@/components/AdminQueue";
import { createClient } from "@/lib/supabase/server";

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

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
        <AdminQueue />
      </main>
    </>
  );
}

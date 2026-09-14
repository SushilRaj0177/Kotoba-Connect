import { redirect } from "next/navigation";
import Navbar from "@/components/Navbar";
import SettingsForm from "@/components/SettingsForm";
import { createClient } from "@/lib/supabase/server";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function SettingsPage() {
  const supabase = createClient();
  const { t } = getServerTranslator();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login");

  return (
    <>
      <Navbar title={t("settings.title")} />
      <main className="mx-auto max-w-lg px-4 py-6 sm:px-6">
        <SettingsForm profile={profile} email={user.email ?? null} />
      </main>
    </>
  );
}

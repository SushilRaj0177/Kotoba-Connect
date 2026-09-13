import Navbar from "@/components/Navbar";
import EntryBoard from "@/components/EntryBoard";
import { createClient } from "@/lib/supabase/server";

export default async function HomePage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-ink">Pragmatics board</h1>
          <p className="text-sm text-slate-muted">
            Real Japanese sentences, decomposed into tokens and annotated with the cultural
            nuance dictionaries miss.
          </p>
        </div>
        <EntryBoard userId={user?.id ?? null} />
      </main>
    </>
  );
}

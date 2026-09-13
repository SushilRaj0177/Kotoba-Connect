import { createBrowserClient } from "@supabase/ssr";

// Not parameterized with the generated Database type: our hand-written
// types/database.ts models the app's row shapes for component props, but
// feeding it into supabase-js's generic client breaks query builder
// inference (RLS-filtered inserts, joined selects). Query results are cast
// to the app types (ContextEntry, TokenAnnotation, …) at the call site instead.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

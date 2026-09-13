import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Service-role client — server-only, never imported into client components.
// Used for operations the anon key can't do (deleting an auth.users row).
// Returns null if the service role key isn't configured so callers can
// degrade gracefully instead of crashing.
export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) return null;

  return createSupabaseClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

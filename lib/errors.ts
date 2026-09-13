// Supabase's PostgrestError is a plain object, not an Error instance, so
// `err instanceof Error` misses it (and the useful message from a DB-level
// rate limit trigger or RLS denial along with it).
export function errorMessage(err: unknown, fallback: string): string {
  if (err && typeof err === "object" && "message" in err && typeof err.message === "string") {
    return err.message;
  }
  return fallback;
}

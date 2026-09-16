import { getCurrentProfile } from "@/lib/supabase/server";

// The bot endpoints have two legitimate callers: an admin clicking a button
// in the moderation UI (session-based), and a scheduled job with no session
// at all — Vercel Cron sends "Authorization: Bearer $CRON_SECRET" when that
// env var is configured, so a matching header is trusted the same as an
// admin session. Neither path exists without one of these actually matching.
export async function isAuthorizedBotCaller(request: Request): Promise<boolean> {
  const profile = await getCurrentProfile();
  if (profile?.is_admin) return true;

  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const authHeader = request.headers.get("authorization");
  return authHeader === `Bearer ${secret}`;
}

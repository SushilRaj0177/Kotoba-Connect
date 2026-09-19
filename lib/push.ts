import webpush from "web-push";
import { createAdminClient } from "@/lib/supabase/admin";

export function pushEnabled() {
  return !!(process.env.VAPID_PRIVATE_KEY && process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY);
}

let configured = false;
function ensureConfigured() {
  if (configured || !pushEnabled()) return;
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hello@kotoba-connect.example",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

// Sends a push payload to every device a user has subscribed on, and
// prunes subscriptions the push service reports as gone (410/404 — the
// user uninstalled, cleared site data, or revoked permission) so the
// table doesn't accumulate dead endpoints forever.
export async function sendPushToUser(
  userId: string,
  payload: { title: string; body: string; url?: string }
) {
  if (!pushEnabled()) return { sent: 0, skipped: "not_configured" as const };
  ensureConfigured();

  const admin = createAdminClient();
  if (!admin) return { sent: 0, skipped: "no_admin_client" as const };

  const { data: subs } = await admin
    .from("push_subscriptions")
    .select("id, endpoint, p256dh, auth")
    .eq("user_id", userId);

  if (!subs?.length) return { sent: 0, skipped: "no_subscriptions" as const };

  let sent = 0;
  const dead: string[] = [];

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload)
        );
        sent += 1;
      } catch (err) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) dead.push(sub.id);
      }
    })
  );

  if (dead.length) {
    await admin.from("push_subscriptions").delete().in("id", dead);
  }

  return { sent, pruned: dead.length };
}

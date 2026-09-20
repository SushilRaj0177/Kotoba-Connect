import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendPushToUser, pushEnabled } from "@/lib/push";

// Receiver for a Supabase Database Webhook on public.notifications
// (insert). The trigger functions in 0005/0007/0008/0015 already gate
// whether a row gets inserted at all on the recipient's notification_prefs
// (and 'system' rows always insert) — by the time a row lands here, it's
// already been decided that this user wants to hear about it, so this
// route's only job is turning that row into a push payload and sending it.
// Not wired up automatically because creating the webhook itself is a
// Supabase Dashboard action this repo can't express in a migration — see
// README for the one-time setup.
export async function POST(request: Request) {
  const secret = request.headers.get("x-webhook-secret");
  if (!process.env.SUPABASE_WEBHOOK_SECRET || secret !== process.env.SUPABASE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  if (!pushEnabled()) {
    return NextResponse.json({ skipped: "push_not_configured" });
  }

  const body = await request.json().catch(() => null);
  const row = body?.record;
  if (!row?.user_id || !row?.type) {
    return NextResponse.json({ error: "Malformed payload." }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Service role not configured." }, { status: 500 });
  }

  const [{ data: actor }, { data: entry }] = await Promise.all([
    row.actor_id
      ? admin.from("profiles").select("display_name, username").eq("id", row.actor_id).maybeSingle()
      : Promise.resolve({ data: null }),
    row.entry_id
      ? admin.from("context_entries").select("raw_japanese").eq("id", row.entry_id).maybeSingle()
      : Promise.resolve({ data: null }),
  ]);

  const who = actor?.display_name || (actor?.username ? `@${actor.username}` : "Someone");
  const sentence = entry?.raw_japanese ? ` "${entry.raw_japanese}"` : "";

  const messages: Record<string, { title: string; body: string }> = {
    upvote: { title: "New like", body: `${who} liked your entry${sentence}.` },
    annotation: { title: "New annotation", body: `${who} added a note to your entry${sentence}.` },
    comment: { title: "New comment", body: `${who} commented on your entry${sentence}.` },
    follow: { title: "New follower", body: `${who} started following you.` },
    system: { title: "言葉 Kotoba Engine", body: "You have a new notification." },
  };

  const message = messages[row.type] || messages.system;
  const url = row.entry_id ? `/entries/${row.entry_id}` : "/";

  const result = await sendPushToUser(row.user_id, { ...message, url });
  return NextResponse.json(result);
}

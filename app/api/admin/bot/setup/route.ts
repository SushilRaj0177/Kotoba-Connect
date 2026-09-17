import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedBotCaller } from "@/lib/bot-auth";

export const runtime = "nodejs";

const BOT_EMAIL = "bot@kotoba-engine.local";
const BOT_USERNAME = "kotoba_bot";
const BOT_DISPLAY_NAME = "Kotoba Bot";
const BOT_AVATAR_TOKEN = "bot-mascot";

// One-time (idempotent) setup: creates the official bot's real auth.users
// row via the admin API — profiles.id is a foreign key into auth.users, so
// there's no way to have a bot-authored entry without a genuine account
// behind it. Safe to call again later; it just re-syncs is_bot/avatar_url
// on the existing row (picks up e.g. a new official avatar) instead of
// re-creating anything.
export async function POST(request: Request) {
  if (!(await isAuthorizedBotCaller(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY isn't configured." }, { status: 500 });
  }

  const { data: existing } = await admin.from("profiles").select("id").eq("username", BOT_USERNAME).maybeSingle();
  if (existing) {
    await admin
      .from("profiles")
      .update({ is_bot: true, avatar_url: BOT_AVATAR_TOKEN })
      .eq("id", existing.id);
    return NextResponse.json({ botUserId: existing.id, created: false });
  }

  try {
    const { data: created, error: createError } = await admin.auth.admin.createUser({
      email: BOT_EMAIL,
      email_confirm: true,
      password: crypto.randomUUID(),
      user_metadata: { username: BOT_USERNAME, display_name: BOT_DISPLAY_NAME },
    });
    if (createError || !created.user) {
      throw createError ?? new Error("createUser returned no user.");
    }

    // handle_new_user() already inserted a profiles row from the trigger —
    // just flag it as the bot account.
    const { error: updateError } = await admin
      .from("profiles")
      .update({ is_bot: true, display_name: BOT_DISPLAY_NAME, avatar_url: BOT_AVATAR_TOKEN })
      .eq("id", created.user.id);
    if (updateError) throw updateError;

    return NextResponse.json({ botUserId: created.user.id, created: true });
  } catch (err) {
    console.error("Bot account setup failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Couldn't create the bot account." }, { status: 500 });
  }
}

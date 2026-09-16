import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedBotCaller } from "@/lib/bot-auth";
import { tokenizeJapanese } from "@/lib/tokenizer";
import { analyzePragmatics, groqEnabled } from "@/lib/groq";
import { embedText, embeddingsEnabled } from "@/lib/embeddings";
import { BOT_ENTRY_SEEDS } from "@/lib/bot-entries";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_BATCH = 5;
const MAX_BATCH = 15;

// Posts starter entries as the bot account, using the exact same enrichment
// pipeline organic posts get (tokenize -> insert -> AI nuance + embedding)
// so bot entries are indistinguishable in quality from a real post. Skips
// anything already posted (matched by raw_japanese) so repeated calls —
// e.g. a daily cron hitting this route — don't duplicate the bank.
// GET exists because Vercel Cron Jobs only send GET requests; the admin
// panel calls POST with an explicit count instead.
export async function GET(request: Request) {
  return handleSeed(request);
}

export async function POST(request: Request) {
  return handleSeed(request);
}

async function handleSeed(request: Request) {
  if (!(await isAuthorizedBotCaller(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY isn't configured." }, { status: 500 });
  }

  const { data: bot } = await admin.from("profiles").select("id").eq("is_bot", true).maybeSingle();
  if (!bot) {
    return NextResponse.json(
      { error: "No bot account yet — call POST /api/admin/bot/setup first." },
      { status: 400 }
    );
  }

  let requestedCount = DEFAULT_BATCH;
  try {
    const body = await request.json();
    if (typeof body?.count === "number") requestedCount = body.count;
  } catch {
    // No/invalid JSON body — use the default batch size.
  }
  const count = Math.max(1, Math.min(MAX_BATCH, Math.floor(requestedCount)));

  const { data: alreadyPosted } = await admin
    .from("context_entries")
    .select("raw_japanese")
    .eq("user_id", bot.id);
  const postedSet = new Set((alreadyPosted ?? []).map((e) => e.raw_japanese));

  const toPost = BOT_ENTRY_SEEDS.filter((seed) => !postedSet.has(seed.japanese)).slice(0, count);
  if (!toPost.length) {
    return NextResponse.json({ posted: 0, remaining: 0, message: "Entry bank exhausted — nothing new to post." });
  }

  let posted = 0;
  const errors: string[] = [];

  for (const seed of toPost) {
    try {
      const tokens = await tokenizeJapanese(seed.japanese);
      const { data: inserted, error: insertError } = await admin
        .from("context_entries")
        .insert({
          user_id: bot.id,
          raw_japanese: seed.japanese,
          primary_translation: seed.translation,
          formality_level: seed.formality,
          furigana_parsed: tokens,
          tags: seed.tags,
        })
        .select("id")
        .single();
      if (insertError || !inserted) throw insertError ?? new Error("Insert returned no row.");

      if (groqEnabled()) {
        const analysis = await analyzePragmatics(seed.japanese, seed.translation);
        if (analysis) {
          await admin
            .from("context_entries")
            .update({
              ai_formality_suggestion: analysis.formality_suggestion,
              ai_nuance_summary: analysis.nuance_summary,
              ai_processed: true,
            })
            .eq("id", inserted.id);
        }
      }

      if (embeddingsEnabled()) {
        const embedding = await embedText(`${seed.japanese} ${seed.translation}`);
        if (embedding) {
          await admin.from("context_entries").update({ embedding }).eq("id", inserted.id);
        }
      }

      posted += 1;
    } catch (err) {
      console.error("Bot entry post failed", seed.japanese, err);
      Sentry.captureException(err);
      errors.push(seed.japanese);
    }
  }

  return NextResponse.json({
    posted,
    remaining: BOT_ENTRY_SEEDS.length - postedSet.size - posted,
    failed: errors,
  });
}

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createAdminClient } from "@/lib/supabase/admin";
import { isAuthorizedBotCaller } from "@/lib/bot-auth";
import { embedText, embeddingsEnabled } from "@/lib/embeddings";

export const runtime = "nodejs";
export const maxDuration = 60;

const DEFAULT_BATCH = 20;
const MAX_BATCH = 50;

// One-off (and re-runnable) catch-up for entries whose embedding is still
// null — every entry posted before GEMINI_API_KEY (or, before that,
// OPENAI_API_KEY) was actually configured, since /api/entries/[id]/embed
// is per-entry and owner-only and was never called for them. Safe to call
// repeatedly: each run only picks up rows still missing an embedding, so
// it naturally stops finding work once the backlog is cleared.
export async function POST(request: Request) {
  if (!(await isAuthorizedBotCaller(request))) {
    return NextResponse.json({ error: "Not authorized." }, { status: 403 });
  }

  if (!embeddingsEnabled()) {
    return NextResponse.json({ error: "GEMINI_API_KEY isn't configured." }, { status: 500 });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY isn't configured." }, { status: 500 });
  }

  let requestedBatch = DEFAULT_BATCH;
  try {
    const body = await request.json();
    if (typeof body?.batch === "number") requestedBatch = body.batch;
  } catch {
    // No/invalid JSON body — use the default batch size.
  }
  const batch = Math.max(1, Math.min(MAX_BATCH, Math.floor(requestedBatch)));

  const { data: pending, error: fetchError } = await admin
    .from("context_entries")
    .select("id, raw_japanese, primary_translation")
    .is("embedding", null)
    .limit(batch);

  if (fetchError) {
    Sentry.captureException(fetchError);
    return NextResponse.json({ error: "Couldn't read pending entries." }, { status: 500 });
  }

  if (!pending?.length) {
    return NextResponse.json({ embedded: 0, remaining: 0, message: "Nothing left to backfill." });
  }

  let embedded = 0;
  const failed: string[] = [];

  for (const entry of pending) {
    try {
      const embedding = await embedText(`${entry.raw_japanese} ${entry.primary_translation}`, "RETRIEVAL_DOCUMENT");
      if (!embedding) {
        failed.push(entry.id);
        continue;
      }
      const { error: updateError } = await admin
        .from("context_entries")
        .update({ embedding })
        .eq("id", entry.id);
      if (updateError) throw updateError;
      embedded += 1;
    } catch (err) {
      console.error("Backfill embedding failed", entry.id, err);
      Sentry.captureException(err);
      failed.push(entry.id);
    }
  }

  const { count: remaining } = await admin
    .from("context_entries")
    .select("id", { count: "exact", head: true })
    .is("embedding", null);

  return NextResponse.json({ embedded, failed, remaining: remaining ?? 0 });
}

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { suggestEntryAssist, groqEnabled } from "@/lib/groq";
import { embedText, embeddingsEnabled } from "@/lib/embeddings";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Compose-time assist, called once when the user blurs the Japanese
// textarea (same trigger as tokenization) — combines three independent
// AI-assist features behind one round trip:
//   - suggested tags (Groq)
//   - a translation draft, only when the user hasn't written one yet (Groq)
//   - a "similar entries already exist" nudge (OpenAI embeddings + the
//     same match_entries RPC semantic search already uses)
// Each half degrades independently: missing GROQ_API_KEY just skips tags/
// translation, missing OPENAI_API_KEY just skips the duplicate check.
export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "entry-assist");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const rawJapanese = body?.rawJapanese;
  const hasTranslation = !!body?.hasTranslation;
  if (typeof rawJapanese !== "string" || !rawJapanese.trim()) {
    return NextResponse.json({ error: "`rawJapanese` is required." }, { status: 400 });
  }
  if (rawJapanese.length > 500) {
    return NextResponse.json({ error: "Text is too long." }, { status: 400 });
  }

  const text = rawJapanese.trim();

  try {
    const [assist, duplicates] = await Promise.all([
      groqEnabled() ? suggestEntryAssist(text, hasTranslation) : Promise.resolve(null),
      embeddingsEnabled() ? findSimilarEntries(supabase, text) : Promise.resolve([]),
    ]);

    return NextResponse.json({
      suggestedTags: assist?.suggested_tags ?? [],
      translationDraft: assist?.translation_draft ?? null,
      duplicates,
    });
  } catch (err) {
    console.error("Entry assist failed", err);
    Sentry.captureException(err);
    // Best-effort feature — fail soft so a blur handler never surfaces an
    // error to the user over something this optional.
    return NextResponse.json({ suggestedTags: [], translationDraft: null, duplicates: [] });
  }
}

async function findSimilarEntries(supabase: ReturnType<typeof createClient>, text: string) {
  const embedding = await embedText(text);
  if (!embedding) return [];

  const { data, error } = await supabase.rpc("match_entries", {
    query_embedding: embedding,
    match_threshold: 0.85,
    match_count: 3,
  });

  if (error) {
    console.error("Duplicate-check RPC failed", error);
    return [];
  }
  return data ?? [];
}

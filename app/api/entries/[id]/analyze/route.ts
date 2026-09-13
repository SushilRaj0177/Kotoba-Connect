import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { analyzePragmatics, groqEnabled } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Fire-and-forget: called by the client right after it inserts an entry.
// Silently no-ops if GROQ_API_KEY isn't configured — this is a Phase 2
// enhancement, not something the core flow depends on.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!groqEnabled()) {
    return NextResponse.json({ skipped: true });
  }

  const rateLimit = await checkRateLimit(request, "analyze");
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

  const { data: entry, error: fetchError } = await supabase
    .from("context_entries")
    .select("id, user_id, raw_japanese, primary_translation")
    .eq("id", params.id)
    .single();

  if (fetchError || !entry) {
    return NextResponse.json({ error: "Entry not found." }, { status: 404 });
  }
  // Only the author can trigger analysis for their own entry — RLS on the
  // update below would block a mismatch anyway, this just fails faster.
  if (entry.user_id !== user.id) {
    return NextResponse.json({ error: "Not your entry." }, { status: 403 });
  }

  try {
    const analysis = await analyzePragmatics(entry.raw_japanese, entry.primary_translation);
    if (!analysis) {
      await supabase.from("context_entries").update({ ai_processed: true }).eq("id", entry.id);
      return NextResponse.json({ skipped: true });
    }

    await supabase
      .from("context_entries")
      .update({
        ai_formality_suggestion: analysis.formality_suggestion,
        ai_nuance_summary: analysis.nuance_summary,
        ai_processed: true,
      })
      .eq("id", entry.id);

    return NextResponse.json({ analysis });
  } catch (err) {
    console.error("Entry analysis failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}

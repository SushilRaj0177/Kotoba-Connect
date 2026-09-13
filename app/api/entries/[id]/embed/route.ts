import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { embedText, embeddingsEnabled } from "@/lib/embeddings";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Fire-and-forget, same pattern as /analyze: computes and stores the entry's
// embedding for semantic search. No-ops without OPENAI_API_KEY.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!embeddingsEnabled()) {
    return NextResponse.json({ skipped: true });
  }

  const rateLimit = await checkRateLimit(request, "embed");
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
  if (entry.user_id !== user.id) {
    return NextResponse.json({ error: "Not your entry." }, { status: 403 });
  }

  try {
    const embedding = await embedText(`${entry.raw_japanese} ${entry.primary_translation}`);
    if (!embedding) {
      return NextResponse.json({ skipped: true });
    }

    await supabase.from("context_entries").update({ embedding }).eq("id", entry.id);
    return NextResponse.json({ embedded: true });
  } catch (err) {
    console.error("Entry embedding failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Embedding failed." }, { status: 500 });
  }
}

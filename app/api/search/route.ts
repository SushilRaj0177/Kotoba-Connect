import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { embedText, embeddingsEnabled } from "@/lib/embeddings";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!embeddingsEnabled()) {
    return NextResponse.json(
      { error: "Semantic search isn't configured on this deployment yet." },
      { status: 503 }
    );
  }

  const rateLimit = await checkRateLimit(request, "search");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many searches. Slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const query = (body as { query?: unknown })?.query;
  if (typeof query !== "string" || !query.trim()) {
    return NextResponse.json({ error: "`query` is required." }, { status: 400 });
  }
  if (query.length > 200) {
    return NextResponse.json({ error: "Query must be 200 characters or fewer." }, { status: 400 });
  }

  try {
    const embedding = await embedText(query.trim(), "RETRIEVAL_QUERY");
    if (!embedding) {
      return NextResponse.json({ error: "Could not process that search query." }, { status: 500 });
    }

    const supabase = createClient();
    // 0.4 was tuned for OpenAI's embedding space; Gemini's clusters
    // same-register Japanese phrases (politeness level, business/social
    // topic) close enough together that 0.4 let through a lot of results
    // that share a register with the query but aren't actually about the
    // same thing. Raised until only genuinely close matches pass.
    const { data, error } = await supabase.rpc("match_entries", {
      query_embedding: embedding,
      match_threshold: 0.6,
      match_count: 12,
    });

    if (error) throw error;

    return NextResponse.json({ results: data ?? [] });
  } catch (err) {
    console.error("Semantic search failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Search failed on the server." }, { status: 500 });
  }
}

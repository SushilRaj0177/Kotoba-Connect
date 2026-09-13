import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { tokenizeJapanese } from "@/lib/tokenizer";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "tokenize");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const text = (body as { text?: unknown })?.text;
  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "`text` is required." }, { status: 400 });
  }
  if (text.length > 500) {
    return NextResponse.json({ error: "Text must be 500 characters or fewer." }, { status: 400 });
  }

  try {
    const tokens = await tokenizeJapanese(text);
    return NextResponse.json({ tokens });
  } catch (err) {
    console.error("Tokenization failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Tokenization failed on the server." }, { status: 500 });
  }
}

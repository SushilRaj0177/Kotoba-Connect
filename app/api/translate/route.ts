import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { translateText, groqEnabled } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!groqEnabled()) {
    return NextResponse.json({ error: "Translation isn't configured on this deployment yet." }, { status: 503 });
  }

  const rateLimit = await checkRateLimit(request, "translate");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many translations. Slow down and try again shortly." },
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
  const targetLang = (body as { targetLang?: unknown })?.targetLang;

  if (typeof text !== "string" || !text.trim()) {
    return NextResponse.json({ error: "`text` is required." }, { status: 400 });
  }
  if (text.length > 2000) {
    return NextResponse.json({ error: "Text must be 2000 characters or fewer." }, { status: 400 });
  }
  if (targetLang !== "en" && targetLang !== "ja") {
    return NextResponse.json({ error: "`targetLang` must be \"en\" or \"ja\"." }, { status: 400 });
  }

  try {
    const translation = await translateText(text.trim(), targetLang);
    if (!translation) {
      return NextResponse.json({ error: "Could not translate that text." }, { status: 500 });
    }
    return NextResponse.json({ translation });
  } catch (err) {
    console.error("Translation failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Translation failed on the server." }, { status: 500 });
  }
}

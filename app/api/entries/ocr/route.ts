import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { extractTextFromImage, groqEnabled } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// A max ~4MB base64 data URL keeps requests well under typical serverless
// body-size limits without needing a storage upload step — the image is
// never persisted, just sent once for transcription.
const MAX_DATA_URL_LENGTH = 6_000_000;

export async function POST(request: Request) {
  if (!groqEnabled()) {
    return NextResponse.json({ error: "Photo transcription isn't configured on this deployment yet." }, { status: 503 });
  }

  const rateLimit = await checkRateLimit(request, "ocr");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many photo transcriptions. Slow down and try again shortly." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const image = body?.image;
  if (typeof image !== "string" || !image.startsWith("data:image/")) {
    return NextResponse.json({ error: "A valid image data URL is required." }, { status: 400 });
  }
  if (image.length > MAX_DATA_URL_LENGTH) {
    return NextResponse.json({ error: "Image is too large. Try a smaller photo." }, { status: 413 });
  }

  try {
    const text = await extractTextFromImage(image);
    if (!text) {
      return NextResponse.json({ error: "Couldn't find any Japanese text in that photo." }, { status: 422 });
    }
    return NextResponse.json({ text });
  } catch (err) {
    console.error("OCR failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Transcription failed on the server." }, { status: 500 });
  }
}

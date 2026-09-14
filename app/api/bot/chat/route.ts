import { NextResponse } from "next/server";
import { chatWithBot, groqEnabled } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const rateLimit = await checkRateLimit(request, "bot-chat");
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many messages — slow down a bit." },
      { status: 429, headers: { "Retry-After": String(rateLimit.retryAfterSeconds) } }
    );
  }

  if (!groqEnabled()) {
    return NextResponse.json(
      { error: "Kotoba Bot isn't configured on this deployment yet." },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const messages = body?.messages;
  if (!Array.isArray(messages) || !messages.length) {
    return NextResponse.json({ error: "No message provided." }, { status: 400 });
  }

  const cleaned = messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1000) }));

  const reply = await chatWithBot(cleaned);
  if (!reply) {
    return NextResponse.json({ error: "Kotoba Bot couldn't come up with a reply. Try again." }, { status: 502 });
  }

  return NextResponse.json({ reply });
}

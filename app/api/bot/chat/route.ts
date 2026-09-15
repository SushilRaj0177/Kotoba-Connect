import { NextResponse } from "next/server";
import { chatWithBot, groqEnabled, type RetrievedEntry } from "@/lib/groq";
import { embedText, embeddingsEnabled } from "@/lib/embeddings";
import { createClient } from "@/lib/supabase/server";
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

  const rawContext = body?.entryContext;
  const entryContext =
    rawContext && typeof rawContext.raw_japanese === "string" && typeof rawContext.primary_translation === "string"
      ? {
          raw_japanese: rawContext.raw_japanese.slice(0, 500),
          primary_translation: rawContext.primary_translation.slice(0, 300),
          nuance_summary: typeof rawContext.nuance_summary === "string" ? rawContext.nuance_summary.slice(0, 500) : null,
        }
      : null;

  // The agent step: semantic search over the board's own entries, grounded
  // on the user's latest message, so the bot can cite real community
  // examples instead of only general knowledge. Best-effort — a failed
  // embed/search just means the bot answers without citations, same as
  // before this existed.
  let retrieved: RetrievedEntry[] = [];
  const lastUserMessage = [...cleaned].reverse().find((m) => m.role === "user")?.content;
  if (embeddingsEnabled() && lastUserMessage) {
    try {
      const embedding = await embedText(lastUserMessage);
      if (embedding) {
        const supabase = createClient();
        const { data } = await supabase.rpc("match_entries", {
          query_embedding: embedding,
          match_threshold: 0.35,
          match_count: 4,
        });
        retrieved = (data ?? []) as RetrievedEntry[];
      }
    } catch (err) {
      console.error("Bot retrieval step failed", err);
    }
  }

  const reply = await chatWithBot(cleaned, entryContext, retrieved);
  if (!reply) {
    return NextResponse.json({ error: "Kotoba Bot couldn't come up with a reply. Try again." }, { status: 502 });
  }

  return NextResponse.json({ reply, retrieved });
}

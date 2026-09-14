// Groq's API is OpenAI-compatible, so a plain fetch is enough — no SDK needed.
// gpt-oss-120b is Groq's flagship open-weight reasoning model — far more
// capable than the small "instant" models for judgment calls like
// classifying Japanese formality registers and explaining cultural nuance,
// while still running on Groq's LPU inference for low latency.
// reasoning_effort: "low" keeps it fast/concise for these latency-sensitive,
// short-answer use cases rather than producing long reasoning traces.
const GROQ_MODEL = "openai/gpt-oss-120b";
const REASONING_EFFORT = "low";

export interface PragmaticAnalysis {
  formality_suggestion: string;
  nuance_summary: string;
}

export interface EntryAssist {
  suggested_tags: string[];
  translation_draft: string | null;
}

export function groqEnabled(): boolean {
  return !!process.env.GROQ_API_KEY;
}

// Compose-time assist: suggests a few tags and, when the user hasn't
// written a translation yet, a draft one — reusing the same call pattern
// as analyzePragmatics (one JSON-mode request) rather than two separate
// round-trips. The user always reviews/edits before posting; this only
// removes blank-page friction, it never posts anything itself.
export async function suggestEntryAssist(
  rawJapanese: string,
  hasTranslation: boolean
): Promise<EntryAssist | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are helping someone post a Japanese sentence to a community board about
pragmatics/cultural nuance. Given the Japanese sentence below, suggest up to 4 short, lowercase
topic tags (e.g. "anime", "workplace", "family", "internet-slang") that describe its context —
not its formality register, that's tracked separately.${
    hasTranslation
      ? ""
      : ` Also draft a natural English translation.`
  }

Respond with ONLY a JSON object: {"suggested_tags": string[], "translation_draft": ${
    hasTranslation ? "null" : "a natural English translation string"
  }}.

Japanese: ${rawJapanese}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        reasoning_effort: REASONING_EFFORT,
        temperature: 0.4,
        max_tokens: 250,
      }),
    });

    if (!res.ok) {
      console.error("Groq entry-assist error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    const tags = Array.isArray(parsed.suggested_tags)
      ? parsed.suggested_tags.filter((t: unknown) => typeof t === "string").slice(0, 4)
      : [];
    const draft = typeof parsed.translation_draft === "string" ? parsed.translation_draft : null;

    return { suggested_tags: tags, translation_draft: draft };
  } catch (err) {
    console.error("Groq entry-assist failed", err);
    return null;
  }
}

export async function analyzePragmatics(
  rawJapanese: string,
  translation: string
): Promise<PragmaticAnalysis | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = `You are a Japanese linguistics expert. Given a Japanese sentence and its
translation, classify its formality register and explain the pragmatic/cultural nuance a
dictionary definition would miss (implicit social meaning, politeness level, who would say
this to whom). Respond with ONLY a JSON object: {"formality_suggestion": one of
["Sonkeigo","Kenjougo","Teineigo","Casual","Slang","Dialect"], "nuance_summary": a 1-2 sentence
explanation}.

Japanese: ${rawJapanese}
Translation: ${translation}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        reasoning_effort: REASONING_EFFORT,
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!res.ok) {
      console.error("Groq API error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (typeof parsed.formality_suggestion !== "string" || typeof parsed.nuance_summary !== "string") {
      return null;
    }
    return {
      formality_suggestion: parsed.formality_suggestion,
      nuance_summary: parsed.nuance_summary,
    };
  } catch (err) {
    console.error("Groq pragmatic analysis failed", err);
    return null;
  }
}

export interface ReportTriage {
  severity: "low" | "medium" | "high";
  reasoning: string;
}

// Pre-screens a report so the admin queue can surface likely-serious
// violations first instead of a flat FIFO list. Deliberately NOT a
// profanity filter — this app catalogs rude/slang Japanese as linguistic
// data on purpose (see README), so the prompt is explicit that rude
// *content* alone isn't a violation. It's scoring how credible the report
// itself looks (spam/harassment/hate speech/clearly-not-Japanese), which
// is exactly what a human moderator already has to judge — this just
// orders the queue, a human still makes every actual call.
export async function triageReport(contentPreview: string, reportReason: string): Promise<ReportTriage | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  const prompt = `You triage user reports for a community board about Japanese language
pragmatics, where rude/slang/informal Japanese is expected content, not a violation — this app
intentionally does NOT filter profanity or slang; annotating rude registers is the product. Only
flag things a human moderator would actually act on: spam/advertising, harassment or hate speech
targeting a person, content that isn't Japanese/is low-effort junk, or a clearly false/misleading
translation claimed as fact. Rudeness or crude language in the Japanese sentence itself is NOT
grounds for a high severity score.

Given the reported content and the reason it was reported, rate how likely this needs urgent
admin attention. Respond with ONLY a JSON object: {"severity": one of ["low","medium","high"],
"reasoning": a 1-sentence explanation}.

Reported content: ${contentPreview}
Report reason: ${reportReason}`;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
        reasoning_effort: REASONING_EFFORT,
        temperature: 0.2,
        max_tokens: 150,
      }),
    });

    if (!res.ok) {
      console.error("Groq report-triage error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content);
    if (!["low", "medium", "high"].includes(parsed.severity) || typeof parsed.reasoning !== "string") {
      return null;
    }
    return { severity: parsed.severity, reasoning: parsed.reasoning };
  } catch (err) {
    console.error("Groq report triage failed", err);
    return null;
  }
}

const BOT_SYSTEM_PROMPT = `You are Kotoba Bot, the friendly mascot of Kotoba Engine (言葉) — a
community board where people post real Japanese sentences (from anime, manga, overheard
conversation, anywhere) along with a translation and formality register (Sonkeigo, Kenjougo,
Teineigo, Casual, Slang, Dialect), and the community adds token-level "nuance notes" explaining
cultural/pragmatic meaning a dictionary definition would miss.

Features you can explain: posting a sentence (the compose box on the board), clicking a word in
a posted sentence to add or read a nuance note, upvoting entries, bookmarking entries to /bookmarks,
searching by meaning (semantic search, not just keyword), browsing tags at /tags/[tag], the
leaderboard at /leaderboard (ranked by reputation earned from upvotes), user profiles at
/u/[username], and account settings at /settings.

Answer questions about how the app works, Japanese formality registers, or general Japanese
pragmatics/language questions. Keep answers short — 2-4 sentences, casual and warm, never a wall
of text. You cannot take actions in the app yourself (you can't post, delete, or edit anything) —
if asked to do something, explain how the person can do it themselves.`;

export interface BotEntryContext {
  raw_japanese: string;
  primary_translation: string;
  nuance_summary?: string | null;
}

export async function chatWithBot(
  messages: { role: "user" | "assistant"; content: string }[],
  entryContext?: BotEntryContext | null
): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  // When opened from an entry's detail page, the bot gets that entry as
  // grounding context (its own system message, kept separate from the
  // general instructions) so it can answer "what does THIS sentence
  // actually imply" instead of only general Japanese questions.
  const contextMessage = entryContext
    ? [
        {
          role: "system" as const,
          content: `The user is currently viewing this posted entry — answer with it in mind when relevant:
Japanese: ${entryContext.raw_japanese}
Translation: ${entryContext.primary_translation}${
            entryContext.nuance_summary ? `\nExisting AI nuance note: ${entryContext.nuance_summary}` : ""
          }`,
        },
      ]
    : [];

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: BOT_SYSTEM_PROMPT },
          ...contextMessage,
          ...messages.slice(-10),
        ],
        reasoning_effort: REASONING_EFFORT,
        temperature: 0.6,
        max_tokens: 220,
      }),
    });

    if (!res.ok) {
      console.error("Groq bot chat error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content ?? null;
  } catch (err) {
    console.error("Groq bot chat failed", err);
    return null;
  }
}

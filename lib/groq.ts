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

export async function chatWithBot(messages: { role: "user" | "assistant"; content: string }[]): Promise<
  string | null
> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: "system", content: BOT_SYSTEM_PROMPT }, ...messages.slice(-10)],
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

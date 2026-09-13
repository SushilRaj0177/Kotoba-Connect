// Groq's API is OpenAI-compatible, so a plain fetch is enough — no SDK needed.
const GROQ_MODEL = "llama-3.1-8b-instant";

export interface PragmaticAnalysis {
  formality_suggestion: string;
  nuance_summary: string;
}

export function groqEnabled(): boolean {
  return !!process.env.GROQ_API_KEY;
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

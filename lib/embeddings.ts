// Gemini's embedding model, not OpenAI's — Google's free tier for this
// is ongoing (not a one-time trial credit) and explicitly allowed in
// production, unlike Cohere's trial keys. Get a key at
// https://aistudio.google.com/ (no card required) and set it as
// GEMINI_API_KEY.
const EMBEDDING_MODEL = "gemini-embedding-001";

// gemini-embedding-001 defaults to 3072 dimensions but supports Matryoshka
// truncation down to smaller sizes via outputDimensionality — requested at
// 1536 here to match the vector(1536) column and match_entries() function
// already in the schema (supabase/migrations/0004_vector_search.sql),
// so switching providers needed no migration.
const OUTPUT_DIMENSIONALITY = 1536;

export function embeddingsEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function l2Normalize(vector: number[]): number[] {
  const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
  return magnitude > 0 ? vector.map((v) => v / magnitude) : vector;
}

// taskType steers the embedding toward the right use case — Google's docs
// call out that quality suffers if a query and the documents it's matched
// against aren't embedded with the appropriate (and different) taskType.
// "RETRIEVAL_DOCUMENT" for entries being stored/indexed, "RETRIEVAL_QUERY"
// for text being searched against them.
export async function embedText(
  text: string,
  taskType: "RETRIEVAL_DOCUMENT" | "RETRIEVAL_QUERY" = "RETRIEVAL_DOCUMENT"
): Promise<number[] | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${EMBEDDING_MODEL}:embedContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          content: { parts: [{ text }] },
          taskType,
          outputDimensionality: OUTPUT_DIMENSIONALITY,
        }),
      }
    );

    if (!res.ok) {
      console.error("Embeddings API error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const values = data.embedding?.values;
    if (!Array.isArray(values)) return null;

    // Truncated (non-3072) outputs aren't unit-length by default — cosine
    // similarity against them is unreliable until normalized. See
    // https://ai.google.dev/gemini-api/docs/embeddings
    return l2Normalize(values);
  } catch (err) {
    console.error("Embedding request failed", err);
    return null;
  }
}

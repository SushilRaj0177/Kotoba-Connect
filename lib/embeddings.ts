const EMBEDDING_MODEL = "text-embedding-3-small"; // 1536 dimensions

export function embeddingsEnabled(): boolean {
  return !!process.env.OPENAI_API_KEY;
}

export async function embedText(text: string): Promise<number[] | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({ model: EMBEDDING_MODEL, input: text }),
    });

    if (!res.ok) {
      console.error("Embeddings API error", res.status, await res.text());
      return null;
    }

    const data = await res.json();
    const embedding = data.data?.[0]?.embedding;
    return Array.isArray(embedding) ? embedding : null;
  } catch (err) {
    console.error("Embedding request failed", err);
    return null;
  }
}

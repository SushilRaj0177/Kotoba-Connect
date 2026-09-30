import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { embedText, embeddingsEnabled } from "@/lib/embeddings";

function mockGemini(values: unknown, ok = true) {
  const fetchMock = vi.fn().mockResolvedValue({
    ok,
    status: ok ? 200 : 500,
    text: async () => "error",
    json: async () => ({ embedding: { values } }),
  });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

describe("embeddings (Gemini)", () => {
  beforeEach(() => {
    vi.stubEnv("GEMINI_API_KEY", "test-key");
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("is disabled and returns null without an API key, without calling out", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    const fetchMock = mockGemini([1, 0]);
    expect(embeddingsEnabled()).toBe(false);
    expect(await embedText("hi")).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("L2-normalizes the truncated vector so cosine similarity stays valid", async () => {
    mockGemini([3, 4]);
    const vec = await embedText("hi");
    expect(vec).toEqual([0.6, 0.8]);
    expect(Math.hypot(...vec!)).toBeCloseTo(1);
  });

  it("requests 1536 dims with the given task type, key in a header not the URL", async () => {
    const fetchMock = mockGemini([1]);
    await embedText("query", "RETRIEVAL_QUERY");
    const [url, init] = fetchMock.mock.calls[0];
    const body = JSON.parse(init.body);
    expect(url).not.toContain("test-key");
    expect(init.headers["x-goog-api-key"]).toBe("test-key");
    expect(body.taskType).toBe("RETRIEVAL_QUERY");
    expect(body.outputDimensionality).toBe(1536);
  });

  it("defaults to RETRIEVAL_DOCUMENT for stored entries", async () => {
    const fetchMock = mockGemini([1]);
    await embedText("doc");
    expect(JSON.parse(fetchMock.mock.calls[0][1].body).taskType).toBe("RETRIEVAL_DOCUMENT");
  });

  it("returns null instead of throwing on an API error or malformed response", async () => {
    mockGemini([1], false);
    expect(await embedText("hi")).toBeNull();
    mockGemini("not-an-array");
    expect(await embedText("hi")).toBeNull();
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    expect(await embedText("hi")).toBeNull();
  });
});

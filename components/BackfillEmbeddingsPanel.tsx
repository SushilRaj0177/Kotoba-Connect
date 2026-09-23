"use client";

import { useState } from "react";
import { useToast } from "@/components/Toast";

// Entries posted before GEMINI_API_KEY was actually configured never got
// an embedding (the per-entry endpoint that generates one is owner-only
// and was never called for them), so they're invisible to semantic
// search no matter how good the query is. This calls the same backfill
// route repeatedly until nothing's left, since each call only handles one
// batch (kept small to stay under the route's timeout).
export default function BackfillEmbeddingsPanel() {
  const { showToast } = useToast();
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  async function handleRun() {
    setRunning(true);
    setStatus(null);
    let totalEmbedded = 0;

    try {
      // eslint-disable-next-line no-constant-condition
      while (true) {
        const res = await fetch("/api/admin/backfill-embeddings", { method: "POST" });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Backfill failed.");

        totalEmbedded += data.embedded ?? 0;
        setStatus(`Embedded ${totalEmbedded} so far — ${data.remaining} left…`);

        if (!data.embedded || data.remaining === 0) {
          setStatus(`Done — embedded ${totalEmbedded} entr${totalEmbedded === 1 ? "y" : "ies"}. ${data.remaining} left.`);
          break;
        }
      }
      showToast(`Backfill complete — embedded ${totalEmbedded} entries.`);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Backfill failed.", "error");
    }
    setRunning(false);
  }

  return (
    <div className="mb-6 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-text-header">Backfill search embeddings</h2>
      <p className="mt-1 text-sm text-ink-text-muted">
        Entries posted before the embeddings key was configured have no embedding and don&apos;t show up in
        semantic search. Run this once to catch them up — safe to re-run any time.
      </p>
      <button
        type="button"
        onClick={handleRun}
        disabled={running}
        className="btn-chunky mt-3 rounded-2xl bg-ink-accent px-4 py-1.5 text-xs font-bold text-white disabled:opacity-60"
      >
        {running ? "Backfilling…" : "Run backfill"}
      </button>
      {status && <p className="mt-2 text-xs text-ink-text-muted">{status}</p>}
    </div>
  );
}

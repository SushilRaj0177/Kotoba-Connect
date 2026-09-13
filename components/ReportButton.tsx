"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REPORT_REASONS } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";

export default function ReportButton({
  targetType,
  targetId,
  userId,
}: {
  targetType: "entry" | "annotation";
  targetId: string;
  userId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [detail, setDetail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!userId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { error: insertError } = await supabase.from("report_flags").insert({
      reporter_id: userId,
      target_type: targetType,
      target_id: targetId,
      reason: detail.trim() ? `${reason}: ${detail.trim()}` : reason,
    });

    if (insertError) {
      setError(errorMessage(insertError, "Couldn't submit the report. Try again."));
    } else {
      setDone(true);
    }
    setSubmitting(false);
  }

  if (done) {
    return <span className="text-xs text-slate-muted">Reported — thanks for flagging this.</span>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-xs text-slate-muted hover:text-red-600 hover:underline"
      >
        Report
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
      >
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <input
        value={detail}
        onChange={(e) => setDetail(e.target.value)}
        maxLength={200}
        placeholder="Optional details"
        className="w-full rounded-md border border-slate-200 px-2 py-1 text-xs"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-60"
        >
          {submitting ? "Sending…" : "Submit report"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md px-2 py-1 text-xs text-slate-muted hover:bg-slate-100"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

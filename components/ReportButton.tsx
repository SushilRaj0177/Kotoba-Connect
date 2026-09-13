"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REPORT_REASONS } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function ReportButton({
  targetType,
  targetId,
  userId,
}: {
  targetType: "entry" | "annotation";
  targetId: string;
  userId: string | null;
}) {
  const { t } = useLocale();
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
    return <span className="px-2 text-xs text-ink-text-muted">{t("card.reported")}</span>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="rounded px-2 py-1 text-xs font-semibold text-ink-text-muted transition hover:text-ink-red"
      >
        {t("card.report")}
      </button>

      {open && (
        <form
          onSubmit={handleSubmit}
          className="absolute right-0 top-full z-20 mt-2 w-56 space-y-2 rounded-2xl bg-ink-bg-secondary p-3 border-2 border-ink-border"
        >
          <select
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full rounded-lg border-none bg-ink-bg-input px-2 py-1.5 text-xs text-ink-text"
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
            className="w-full rounded-lg border-none bg-ink-bg-input px-2 py-1.5 text-xs text-ink-text placeholder:text-ink-text-muted"
          />
          {error && <p className="text-xs text-ink-red">{error}</p>}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-full bg-ink-red px-3 py-1 text-xs font-semibold text-white hover:bg-ink-red-hover disabled:opacity-60"
            >
              {submitting ? "Sending…" : "Submit report"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full px-3 py-1 text-xs text-ink-text-muted hover:bg-ink-bg-hover"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { REPORT_REASONS } from "@/lib/moderation";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { usePopoverClamp } from "@/lib/use-popover-clamp";

export default function ReportButton({
  targetType,
  targetId,
  userId,
}: {
  targetType: "entry" | "annotation" | "comment";
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
  const formRef = useRef<HTMLFormElement>(null);
  const shift = usePopoverClamp(open, formRef);

  if (!userId) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();
    const { data: inserted, error: insertError } = await supabase
      .from("report_flags")
      .insert({
        reporter_id: userId,
        target_type: targetType,
        target_id: targetId,
        reason: detail.trim() ? `${reason}: ${detail.trim()}` : reason,
      })
      .select("id")
      .single();

    if (insertError) {
      setError(errorMessage(insertError, "Couldn't submit the report. Try again."));
    } else {
      setDone(true);
      // Best-effort AI triage so the admin queue can surface likely-serious
      // reports first — never blocks the report from succeeding.
      if (inserted?.id) {
        fetch(`/api/reports/${inserted.id}/triage`, { method: "POST" }).catch(() => {});
      }
    }
    setSubmitting(false);
  }

  if (done) {
    return (
      <span
        title={t("card.reported")}
        className="flex h-10 w-10 items-center justify-center text-ink-text-muted"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        title={t("card.report")}
        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-red active:scale-90"
      >
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1Z" />
          <path d="M4 22v-7" />
        </svg>
      </button>

      {open && (
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          style={{ transform: shift ? `translateX(${shift}px)` : undefined }}
          className="absolute right-0 top-full z-20 mt-2 w-56 space-y-2 rounded-2xl bg-ink-bg-secondary p-3 border border-ink-border/70 shadow-sm"
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

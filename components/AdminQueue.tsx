"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReportFlag } from "@/types/database";
import EmptyState from "@/components/EmptyState";
import { useToast } from "@/components/Toast";

interface ReportWithPreview extends ReportFlag {
  preview: string | null;
}

export default function AdminQueue() {
  const { showToast } = useToast();
  const [reports, setReports] = useState<ReportWithPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [actingOn, setActingOn] = useState<string | null>(null);

  const load = useCallback(async () => {
    const supabase = createClient();
    const { data: flags } = await supabase
      .from("report_flags")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    const entryIds = (flags ?? []).filter((f) => f.target_type === "entry").map((f) => f.target_id);
    const annotationIds = (flags ?? [])
      .filter((f) => f.target_type === "annotation")
      .map((f) => f.target_id);
    const commentIds = (flags ?? []).filter((f) => f.target_type === "comment").map((f) => f.target_id);

    const [{ data: entries }, { data: annotations }, { data: comments }] = await Promise.all([
      entryIds.length
        ? supabase.from("context_entries").select("id, raw_japanese, primary_translation").in("id", entryIds)
        : Promise.resolve({ data: [] }),
      annotationIds.length
        ? supabase.from("token_annotations").select("id, nuance_note").in("id", annotationIds)
        : Promise.resolve({ data: [] }),
      commentIds.length
        ? supabase.from("entry_comments").select("id, body").in("id", commentIds)
        : Promise.resolve({ data: [] }),
    ]);

    const entryMap = new Map((entries ?? []).map((e: any) => [e.id, `${e.raw_japanese} — ${e.primary_translation}`]));
    const annotationMap = new Map((annotations ?? []).map((a: any) => [a.id, a.nuance_note]));
    const commentMap = new Map((comments ?? []).map((c: any) => [c.id, c.body]));

    const SEVERITY_RANK: Record<string, number> = { high: 0, medium: 1, low: 2 };
    const withPreviews = (flags ?? []).map((f) => ({
      ...f,
      preview:
        f.target_type === "entry"
          ? entryMap.get(f.target_id) ?? "(entry deleted)"
          : f.target_type === "annotation"
            ? annotationMap.get(f.target_id) ?? "(annotation deleted)"
            : commentMap.get(f.target_id) ?? "(comment deleted)",
    }));
    // AI-triaged severity sorts first (worst first); un-triaged reports
    // (ai_severity still null — no GROQ_API_KEY, or the triage call hasn't
    // landed yet) fall back to newest-first, same as before this existed.
    withPreviews.sort((a, b) => {
      const rankA = a.ai_severity ? SEVERITY_RANK[a.ai_severity] : 3;
      const rankB = b.ai_severity ? SEVERITY_RANK[b.ai_severity] : 3;
      if (rankA !== rankB) return rankA - rankB;
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    setReports(withPreviews);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const supabase = createClient();
    const channel = supabase
      .channel("admin_report_flags")
      .on("postgres_changes", { event: "*", schema: "public", table: "report_flags" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [load]);

  async function dismiss(report: ReportWithPreview) {
    setActingOn(report.id);
    const supabase = createClient();
    const { error } = await supabase
      .from("report_flags")
      .update({ status: "dismissed", reviewed_at: new Date().toISOString() })
      .eq("id", report.id);

    if (error) {
      showToast("Couldn't dismiss that report — try again.", "error");
      setActingOn(null);
      return;
    }

    // Best-effort — the report itself is already dismissed either way, so
    // a failure notifying the reporter isn't worth blocking or reporting
    // as an error for.
    await supabase.from("notifications").insert({
      user_id: report.reporter_id,
      actor_id: null,
      type: "system",
      message: "A moderator reviewed your report — no rule violation was found, so the content stays up.",
    });
    setActingOn(null);
  }

  async function deleteAndResolve(report: ReportWithPreview) {
    setActingOn(report.id);
    const supabase = createClient();
    const table =
      report.target_type === "entry"
        ? "context_entries"
        : report.target_type === "annotation"
          ? "token_annotations"
          : "entry_comments";

    const { data: content } = await supabase.from(table).select("user_id").eq("id", report.target_id).single();

    const { error: deleteError } = await supabase.from(table).delete().eq("id", report.target_id);
    if (deleteError) {
      showToast("Couldn't delete that content — try again.", "error");
      setActingOn(null);
      return;
    }

    await supabase
      .from("report_flags")
      .update({ status: "resolved", reviewed_at: new Date().toISOString() })
      .eq("id", report.id);

    if (content?.user_id) {
      await supabase.from("notifications").insert({
        user_id: content.user_id,
        actor_id: null,
        type: "system",
        message: `Your ${
          report.target_type === "entry" ? "post" : report.target_type === "annotation" ? "annotation" : "comment"
        } was removed for violating community guidelines. Check the Terms page if you have questions.`,
      });
    }
    setActingOn(null);
  }

  if (loading) return <p className="text-sm text-ink-text-muted">Loading reports…</p>;

  if (reports.length === 0) {
    return <EmptyState title="Queue is clear" description="No pending reports right now." />;
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
          <div className="mb-2 flex items-center justify-between text-xs text-ink-text-muted">
            <div className="flex items-center gap-1.5">
              <span className="rounded-full bg-ink-bg-input px-2 py-0.5 font-medium uppercase">
                {report.target_type}
              </span>
              {report.ai_severity && (
                <span
                  title={report.ai_reasoning ?? undefined}
                  className={`rounded-full px-2 py-0.5 font-semibold uppercase text-white ${
                    report.ai_severity === "high"
                      ? "bg-ink-red"
                      : report.ai_severity === "medium"
                        ? "bg-amber-500"
                        : "bg-ink-text-muted"
                  }`}
                >
                  AI: {report.ai_severity}
                </span>
              )}
            </div>
            <span>{new Date(report.created_at).toLocaleString()}</span>
          </div>
          <p className="mb-2 text-sm text-ink-text">{report.preview}</p>
          <p className="mb-1 text-xs text-ink-text-muted">Reason: {report.reason}</p>
          {report.ai_reasoning && (
            <p className="mb-3 text-xs italic text-ink-text-muted">AI note: {report.ai_reasoning}</p>
          )}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => dismiss(report)}
              disabled={actingOn === report.id}
              className="rounded-full bg-ink-bg-input px-3 py-1.5 text-xs font-semibold text-ink-text hover:bg-ink-bg-hover disabled:opacity-60"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => deleteAndResolve(report)}
              disabled={actingOn === report.id}
              className="rounded-full bg-ink-red px-3 py-1.5 text-xs font-semibold text-white hover:bg-ink-red-hover disabled:opacity-60"
            >
              Delete content & resolve
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

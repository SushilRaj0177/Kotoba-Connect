"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { ReportFlag } from "@/types/database";
import EmptyState from "@/components/EmptyState";

interface ReportWithPreview extends ReportFlag {
  preview: string | null;
}

export default function AdminQueue() {
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

    const [{ data: entries }, { data: annotations }] = await Promise.all([
      entryIds.length
        ? supabase.from("context_entries").select("id, raw_japanese, primary_translation").in("id", entryIds)
        : Promise.resolve({ data: [] }),
      annotationIds.length
        ? supabase.from("token_annotations").select("id, nuance_note").in("id", annotationIds)
        : Promise.resolve({ data: [] }),
    ]);

    const entryMap = new Map((entries ?? []).map((e: any) => [e.id, `${e.raw_japanese} — ${e.primary_translation}`]));
    const annotationMap = new Map((annotations ?? []).map((a: any) => [a.id, a.nuance_note]));

    setReports(
      (flags ?? []).map((f) => ({
        ...f,
        preview:
          f.target_type === "entry"
            ? entryMap.get(f.target_id) ?? "(entry deleted)"
            : annotationMap.get(f.target_id) ?? "(annotation deleted)",
      }))
    );
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
    await supabase
      .from("report_flags")
      .update({ status: "dismissed", reviewed_at: new Date().toISOString() })
      .eq("id", report.id);
    setActingOn(null);
  }

  async function deleteAndResolve(report: ReportWithPreview) {
    setActingOn(report.id);
    const supabase = createClient();
    const table = report.target_type === "entry" ? "context_entries" : "token_annotations";
    await supabase.from(table).delete().eq("id", report.target_id);
    await supabase
      .from("report_flags")
      .update({ status: "resolved", reviewed_at: new Date().toISOString() })
      .eq("id", report.id);
    setActingOn(null);
  }

  if (loading) return <p className="text-sm text-ink-text-muted">Loading reports…</p>;

  if (reports.length === 0) {
    return <EmptyState title="Queue is clear" description="No pending reports right now." />;
  }

  return (
    <div className="space-y-3">
      {reports.map((report) => (
        <div key={report.id} className="rounded-2xl bg-ink-bg-secondary p-4 border-2 border-ink-border">
          <div className="mb-2 flex items-center justify-between text-xs text-ink-text-muted">
            <span className="rounded-full bg-ink-bg-input px-2 py-0.5 font-medium uppercase">
              {report.target_type}
            </span>
            <span>{new Date(report.created_at).toLocaleString()}</span>
          </div>
          <p className="mb-2 text-sm text-ink-text">{report.preview}</p>
          <p className="mb-3 text-xs text-ink-text-muted">Reason: {report.reason}</p>
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

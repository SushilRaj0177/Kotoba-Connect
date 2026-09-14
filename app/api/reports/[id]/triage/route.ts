import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { triageReport, groqEnabled } from "@/lib/groq";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

// Fire-and-forget, called right after ReportButton inserts a report —
// same pattern as /api/entries/[id]/analyze. report_flags is admin-only
// to read/update (RLS), and the reporter themselves is neither, so this
// uses the service-role client for that part only, after independently
// verifying the report belongs to the requesting user. The reported
// content itself (entries/annotations/comments) is publicly readable, so
// that lookup stays on the normal session client.
export async function POST(request: Request, { params }: { params: { id: string } }) {
  if (!groqEnabled()) {
    return NextResponse.json({ skipped: true });
  }

  const admin = createAdminClient();
  if (!admin) {
    return NextResponse.json({ skipped: true });
  }

  const rateLimit = await checkRateLimit(request, "report-triage");
  if (!rateLimit.allowed) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }

  const { data: report, error: fetchError } = await admin
    .from("report_flags")
    .select("id, reporter_id, target_type, target_id, reason")
    .eq("id", params.id)
    .single();

  if (fetchError || !report) {
    return NextResponse.json({ error: "Report not found." }, { status: 404 });
  }
  if (report.reporter_id !== user.id) {
    return NextResponse.json({ error: "Not your report." }, { status: 403 });
  }

  try {
    const table =
      report.target_type === "entry"
        ? "context_entries"
        : report.target_type === "annotation"
          ? "token_annotations"
          : "entry_comments";
    const column =
      report.target_type === "entry" ? "raw_japanese" : report.target_type === "annotation" ? "nuance_note" : "body";

    const { data: target } = await supabase.from(table).select(column).eq("id", report.target_id).single();
    const preview = (target as Record<string, string> | null)?.[column] ?? "(content deleted)";

    const triage = await triageReport(preview, report.reason);
    if (!triage) {
      return NextResponse.json({ skipped: true });
    }

    await admin
      .from("report_flags")
      .update({ ai_severity: triage.severity, ai_reasoning: triage.reasoning })
      .eq("id", report.id);

    return NextResponse.json({ triage });
  } catch (err) {
    console.error("Report triage failed", err);
    Sentry.captureException(err);
    return NextResponse.json({ error: "Triage failed." }, { status: 500 });
  }
}

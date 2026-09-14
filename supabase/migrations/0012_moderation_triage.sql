-- Kotoba Engine — AI moderation triage. Run after 0001-0011 in the
-- Supabase SQL editor.

alter table public.report_flags add column if not exists ai_severity text
  check (ai_severity in ('low', 'medium', 'high'));
alter table public.report_flags add column if not exists ai_reasoning text;

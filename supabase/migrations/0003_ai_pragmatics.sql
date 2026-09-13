-- Phase 2: automatic pragmatic extraction (Groq LLM) columns.
-- Feature-flagged in the app on GROQ_API_KEY being set — these columns stay
-- null and unused if you don't configure it.

alter table public.context_entries add column if not exists ai_formality_suggestion text;
alter table public.context_entries add column if not exists ai_nuance_summary text;
alter table public.context_entries add column if not exists ai_processed boolean default false;

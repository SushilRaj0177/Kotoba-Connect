-- Official bot account infrastructure — a real auth.users + profiles row
-- (created by scripts/create-bot-account.mjs, run once with the service
-- role key) that posts starter entries via /api/admin/bot/seed so the
-- board has real content instead of reading empty. Run after 0001-0013.

alter table public.profiles add column if not exists is_bot boolean not null default false;

-- Lets the board/cards show a "Bot" badge without a second query.
comment on column public.profiles.is_bot is
  'True for the official Kotoba Engine bot account that seeds starter entries.';

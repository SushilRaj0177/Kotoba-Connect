-- Database-level rate limits on user-generated content.
--
-- Entry/annotation/upvote/report inserts go straight from the browser to
-- Supabase (protected by RLS, not by our Next.js server), so the Upstash
-- limiter in lib/rate-limit.ts (which only covers /api/tokenize) can't see
-- them. These triggers enforce a per-user ceiling inside Postgres, which no
-- client can bypass regardless of how it talks to the API.

create or replace function public.enforce_insert_rate_limit(
  p_table regclass,
  p_user_id uuid,
  p_window interval,
  p_max_count integer
) returns void as $$
declare
  v_count integer;
begin
  execute format(
    'select count(*) from %s where user_id = $1 and created_at > now() - $2',
    p_table
  ) into v_count using p_user_id, p_window;

  if v_count >= p_max_count then
    raise exception 'Rate limit exceeded: max % per %', p_max_count, p_window
      using errcode = 'P0001';
  end if;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.check_context_entries_rate_limit()
returns trigger as $$
begin
  perform public.enforce_insert_rate_limit('public.context_entries', new.user_id, interval '10 minutes', 10);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists rate_limit_context_entries on public.context_entries;
create trigger rate_limit_context_entries
  before insert on public.context_entries
  for each row execute procedure public.check_context_entries_rate_limit();

create or replace function public.check_token_annotations_rate_limit()
returns trigger as $$
begin
  perform public.enforce_insert_rate_limit('public.token_annotations', new.user_id, interval '10 minutes', 20);
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists rate_limit_token_annotations on public.token_annotations;
create trigger rate_limit_token_annotations
  before insert on public.token_annotations
  for each row execute procedure public.check_token_annotations_rate_limit();

-- report_flags uses reporter_id rather than user_id, so it can't reuse the
-- generic helper's hardcoded column name.
create or replace function public.check_report_flags_rate_limit()
returns trigger as $$
declare
  v_count integer;
begin
  select count(*) into v_count from public.report_flags
    where reporter_id = new.reporter_id and created_at > now() - interval '1 hour';

  if v_count >= 15 then
    raise exception 'Rate limit exceeded: too many reports in the last hour'
      using errcode = 'P0001';
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists rate_limit_report_flags on public.report_flags;
create trigger rate_limit_report_flags
  before insert on public.report_flags
  for each row execute procedure public.check_report_flags_rate_limit();

-- Kotoba Engine — daily posting streaks. Run after 0001-0009 in the
-- Supabase SQL editor.

alter table public.profiles add column if not exists current_streak integer default 0 not null;
alter table public.profiles add column if not exists longest_streak integer default 0 not null;
alter table public.profiles add column if not exists last_post_date date;

-- Recomputes the poster's streak whenever they post a new entry. Uses the
-- entry's own created_at date (UTC) rather than "now" so backfilled/edited
-- data can't be gamed, and is idempotent for multiple posts on the same day.
create or replace function public.handle_entry_streak()
returns trigger as $$
declare
  v_post_date date := (new.created_at at time zone 'utc')::date;
  v_last_date date;
  v_current integer;
  v_longest integer;
begin
  select last_post_date, current_streak, longest_streak
    into v_last_date, v_current, v_longest
    from public.profiles where id = new.user_id;

  if v_last_date = v_post_date then
    -- Already posted today; streak unchanged.
    return new;
  elsif v_last_date = v_post_date - 1 then
    v_current := v_current + 1;
  else
    v_current := 1;
  end if;

  v_longest := greatest(v_longest, v_current);

  update public.profiles
    set current_streak = v_current, longest_streak = v_longest, last_post_date = v_post_date
    where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_entry_streak_update on public.context_entries;
create trigger on_entry_streak_update
  after insert on public.context_entries
  for each row execute procedure public.handle_entry_streak();

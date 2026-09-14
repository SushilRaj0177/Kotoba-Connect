-- Kotoba Engine — display names + preset avatar icons. Run after
-- 0001-0010 in the Supabase SQL editor.

alter table public.profiles add column if not exists display_name text;

-- avatar_url already existed but nothing ever wrote to it — Avatar.tsx
-- always drew a deterministic colored-initial circle instead. It's reused
-- here to hold a preset token ("preset:<set>:<index>", see
-- lib/avatar-presets.ts) rather than an uploaded image URL, so no schema
-- change was needed for it, just an actual writer.

-- New signups now get a random preset icon instead of always landing on
-- the plain colored-initial fallback (still used for existing accounts
-- until they pick one in Settings). 4 sets x 10 icons, matching
-- lib/avatar-presets.ts — keep these in sync if that file's sets change.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    'preset:' || floor(random() * 4)::int || ':' || floor(random() * 10)::int
  );

  insert into public.notifications (user_id, actor_id, type, message)
  values (
    new.id,
    null,
    'system',
    'Welcome to Kotoba Engine! Post a Japanese sentence you have heard, or click any word on someone else''s post to add a nuance note.'
  );

  return new;
end;
$$ language plpgsql security definer set search_path = public;

-- Backfill: give every existing account (which predates this feature) a
-- random preset icon too, instead of leaving them on the colored-initial
-- fallback until they happen to open Settings.
update public.profiles
  set avatar_url = 'preset:' || floor(random() * 4)::int || ':' || floor(random() * 10)::int
  where avatar_url is null;

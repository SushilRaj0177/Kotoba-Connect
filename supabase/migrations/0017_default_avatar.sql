-- Default avatar: new profiles get a random preset icon instead of a
-- null avatar_url. A null avatar_url renders as a colored-initial-letter
-- circle (see the fallback in components/Avatar.tsx) — fine as a last
-- resort, but not something a real user should ever see as their
-- out-of-the-box look. Also backfills existing profiles still on that
-- fallback, so accounts created before this migration get a real avatar
-- too. Run after 0001-0016.
--
-- The random() bounds below (4 sets, 10 presets each) must stay in sync
-- with lib/avatar-presets.ts's AVATAR_SETS — if that array's shape
-- changes, update these bounds to match.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    nullif(trim(new.raw_user_meta_data->>'display_name'), ''),
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

update public.profiles
set avatar_url = 'preset:' || floor(random() * 4)::int || ':' || floor(random() * 10)::int
where avatar_url is null and is_bot = false;

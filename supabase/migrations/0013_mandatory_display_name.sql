-- Display name becomes mandatory at signup. Email/password signup now
-- collects it directly; Google OAuth signups (and any pre-existing account
-- without one) are gated to /onboarding/name by a client-side check until
-- they set one. Run after 0001-0012.

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4)),
    nullif(trim(new.raw_user_meta_data->>'display_name'), '')
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

-- Kotoba Engine — the mascot becomes an actual bot presence: it can post
-- system notifications (welcome message, moderation outcomes) alongside
-- the existing upvote/annotation notifications. Run after 0001-0005.

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('upvote', 'annotation', 'system'));

-- System notifications carry their own message instead of being derived
-- from the type + actor the way upvote/annotation ones are.
alter table public.notifications add column if not exists message text;

-- Bot-authored notifications have no human actor.
alter table public.notifications alter column actor_id drop not null;

-- Moderators trigger bot notifications directly from the admin queue (report
-- dismissed / content removed) — this is the one case where a client insert
-- into notifications is legitimate, gated to admins and system-typed rows.
create policy "Admins send system notifications" on public.notifications
  for insert with check (
    type = 'system'
    and exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Welcome message from the bot on signup.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4))
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

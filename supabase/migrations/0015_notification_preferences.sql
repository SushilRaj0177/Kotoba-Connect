-- Per-user notification preferences: lets a viewer mute individual
-- activity types (upvotes/likes, comments, annotations, follows)
-- without losing notifications entirely. 'system' notifications
-- (moderation/account messages) are deliberately not covered — those
-- stay on regardless of this preference. Run after 0001-0014.

alter table public.profiles
  add column if not exists notification_prefs jsonb not null default
    '{"upvote": true, "annotation": true, "comment": true, "follow": true}'::jsonb;

comment on column public.profiles.notification_prefs is
  'Per-type opt-out for social-activity notifications (upvote/annotation/comment/follow). Missing keys default to enabled — see the coalesce(...) checks in the trigger functions below. "system" notifications always fire regardless of this.';

-- Each notification-producing trigger function gets the same guard added:
-- look up the recipient's preference for this notification's type, and
-- skip the insert (but keep every other side effect — reputation score,
-- the underlying row itself — untouched) when it's explicitly false.
-- coalesce(..., true) means a missing/null key is treated as enabled, so
-- existing rows and any notification type added later fail open rather
-- than silently going dark.

create or replace function public.handle_entry_upvote()
returns trigger as $$
declare
  v_owner uuid;
  v_notify boolean;
begin
  select user_id into v_owner from public.context_entries where id = new.entry_id;

  update public.profiles set reputation_score = reputation_score + 1 where id = v_owner;

  if v_owner is not null and v_owner <> new.user_id then
    select coalesce((notification_prefs->>'upvote')::boolean, true) into v_notify
      from public.profiles where id = v_owner;
    if v_notify then
      insert into public.notifications (user_id, actor_id, type, entry_id)
      values (v_owner, new.user_id, 'upvote', new.entry_id);
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.handle_new_annotation()
returns trigger as $$
declare
  v_owner uuid;
  v_notify boolean;
begin
  select user_id into v_owner from public.context_entries where id = new.entry_id;

  if v_owner is not null and v_owner <> new.user_id then
    select coalesce((notification_prefs->>'annotation')::boolean, true) into v_notify
      from public.profiles where id = v_owner;
    if v_notify then
      insert into public.notifications (user_id, actor_id, type, entry_id, annotation_id)
      values (v_owner, new.user_id, 'annotation', new.entry_id, new.id);
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.handle_new_comment()
returns trigger as $$
declare
  v_owner uuid;
  v_notify boolean;
begin
  select user_id into v_owner from public.context_entries where id = new.entry_id;

  if v_owner is not null and v_owner <> new.user_id then
    select coalesce((notification_prefs->>'comment')::boolean, true) into v_notify
      from public.profiles where id = v_owner;
    if v_notify then
      insert into public.notifications (user_id, actor_id, type, entry_id)
      values (v_owner, new.user_id, 'comment', new.entry_id);
    end if;
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

create or replace function public.handle_new_follow()
returns trigger as $$
declare
  v_notify boolean;
begin
  select coalesce((notification_prefs->>'follow')::boolean, true) into v_notify
    from public.profiles where id = new.following_id;
  if v_notify then
    insert into public.notifications (user_id, actor_id, type)
    values (new.following_id, new.follower_id, 'follow');
  end if;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

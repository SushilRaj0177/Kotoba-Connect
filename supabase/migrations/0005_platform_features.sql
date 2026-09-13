-- Kotoba Engine — platform features: profiles bio/website, bookmarks,
-- notifications, reputation tracking, tag browsing index.
-- Run after 0001-0004 in the Supabase SQL editor.

alter table public.profiles add column if not exists bio text;
alter table public.profiles add column if not exists website text;

-- GIN index so "browse by tag" queries (tags @> array[...]) stay fast as
-- the entries table grows.
create index if not exists context_entries_tags_idx on public.context_entries using gin (tags);

-- 1. Bookmarks — private per-user saved-entries list.
create table if not exists public.bookmarks (
  user_id uuid references public.profiles(id) on delete cascade not null,
  entry_id uuid references public.context_entries(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (user_id, entry_id)
);

alter table public.bookmarks enable row level security;

create policy "Users manage their own bookmarks" on public.bookmarks
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- 2. Notifications — recipient gets pinged on upvotes/annotations on
-- their own content. Rows are written only by the trigger functions
-- below (security definer), never directly by users.
create table if not exists public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade,
  type text check (type in ('upvote', 'annotation')) not null,
  entry_id uuid references public.context_entries(id) on delete cascade,
  annotation_id uuid references public.token_annotations(id) on delete cascade,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.notifications enable row level security;

create policy "Users read their own notifications" on public.notifications
  for select using (auth.uid() = user_id);
create policy "Users mark their own notifications read" on public.notifications
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create index if not exists notifications_user_id_created_idx
  on public.notifications (user_id, created_at desc);

-- Notify an entry's owner when someone else upvotes it, and keep the
-- owner's reputation score in sync with total upvotes received.
create or replace function public.handle_entry_upvote()
returns trigger as $$
declare
  v_owner uuid;
begin
  select user_id into v_owner from public.context_entries where id = new.entry_id;

  update public.profiles set reputation_score = reputation_score + 1 where id = v_owner;

  if v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, entry_id)
    values (v_owner, new.user_id, 'upvote', new.entry_id);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_entry_upvote_insert on public.entry_upvotes;
create trigger on_entry_upvote_insert
  after insert on public.entry_upvotes
  for each row execute procedure public.handle_entry_upvote();

create or replace function public.handle_entry_upvote_removed()
returns trigger as $$
declare
  v_owner uuid;
begin
  select user_id into v_owner from public.context_entries where id = old.entry_id;
  update public.profiles set reputation_score = greatest(0, reputation_score - 1) where id = v_owner;
  return old;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_entry_upvote_delete on public.entry_upvotes;
create trigger on_entry_upvote_delete
  after delete on public.entry_upvotes
  for each row execute procedure public.handle_entry_upvote_removed();

-- Notify an entry's owner when someone else adds a token annotation.
create or replace function public.handle_new_annotation()
returns trigger as $$
declare
  v_owner uuid;
begin
  select user_id into v_owner from public.context_entries where id = new.entry_id;

  if v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, entry_id, annotation_id)
    values (v_owner, new.user_id, 'annotation', new.entry_id, new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_annotation_insert on public.token_annotations;
create trigger on_annotation_insert
  after insert on public.token_annotations
  for each row execute procedure public.handle_new_annotation();

alter publication supabase_realtime add table public.notifications;

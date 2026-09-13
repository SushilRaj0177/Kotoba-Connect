-- Kotoba Engine (言葉) — Phase 1 MVP schema
-- Run this in the Supabase SQL editor for a fresh project.

create extension if not exists "uuid-ossp";

-- 1. User profiles, one row per auth.users, created automatically on sign-up.
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  reputation_score integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Japanese sentence entries: raw text, tokenizer output, translation, formality.
create table if not exists public.context_entries (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  raw_japanese text not null,
  furigana_parsed jsonb not null default '[]'::jsonb, -- kuromoji token array
  media_url text,
  formality_level text check (
    formality_level in ('Sonkeigo', 'Kenjougo', 'Teineigo', 'Casual', 'Slang', 'Dialect')
  ),
  primary_translation text not null,
  tags text[] default '{}',
  upvotes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Token-level annotations: fine-grained notes pinned to a kuromoji token index.
create table if not exists public.token_annotations (
  id uuid default uuid_generate_v4() primary key,
  entry_id uuid references public.context_entries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  token_index integer not null,
  nuance_note text not null,
  cultural_context text,
  upvotes_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Atomic vote ledger — primary key prevents duplicate upvotes per user/entry.
create table if not exists public.entry_upvotes (
  user_id uuid references public.profiles(id) on delete cascade,
  entry_id uuid references public.context_entries(id) on delete cascade,
  primary key (user_id, entry_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.context_entries enable row level security;
alter table public.token_annotations enable row level security;
alter table public.entry_upvotes enable row level security;

create policy "Public read access for profiles" on public.profiles
  for select using (true);
create policy "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles
  for update using (auth.uid() = id);

create policy "Public read access for entries" on public.context_entries
  for select using (true);
create policy "Authenticated users can create entries" on public.context_entries
  for insert with check (auth.uid() = user_id);
create policy "Users can update own entries" on public.context_entries
  for update using (auth.uid() = user_id);
create policy "Users can delete own entries" on public.context_entries
  for delete using (auth.uid() = user_id);

create policy "Public read access for annotations" on public.token_annotations
  for select using (true);
create policy "Authenticated users can create annotations" on public.token_annotations
  for insert with check (auth.uid() = user_id);
create policy "Users can delete own annotations" on public.token_annotations
  for delete using (auth.uid() = user_id);

create policy "Public read access for upvotes" on public.entry_upvotes
  for select using (true);
create policy "Users can cast their own upvote" on public.entry_upvotes
  for insert with check (auth.uid() = user_id);
create policy "Users can remove their own upvote" on public.entry_upvotes
  for delete using (auth.uid() = user_id);

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 4))
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Atomic upvote toggle: inserts or removes the ledger row and keeps the
-- denormalized counter on context_entries consistent under concurrent votes.
create or replace function public.toggle_entry_upvote(p_entry_id uuid)
returns boolean as $$
declare
  v_user_id uuid := auth.uid();
  v_existing record;
  v_upvoted boolean;
begin
  if v_user_id is null then
    raise exception 'Must be authenticated to vote';
  end if;

  select * into v_existing from public.entry_upvotes
    where user_id = v_user_id and entry_id = p_entry_id;

  if found then
    delete from public.entry_upvotes where user_id = v_user_id and entry_id = p_entry_id;
    update public.context_entries set upvotes_count = greatest(0, upvotes_count - 1)
      where id = p_entry_id;
    v_upvoted := false;
  else
    insert into public.entry_upvotes (user_id, entry_id) values (v_user_id, p_entry_id);
    update public.context_entries set upvotes_count = upvotes_count + 1
      where id = p_entry_id;
    v_upvoted := true;
  end if;

  return v_upvoted;
end;
$$ language plpgsql security definer set search_path = public;

-- Realtime: broadcast row changes for live sync in the collaborative UI.
alter publication supabase_realtime add table public.context_entries;
alter publication supabase_realtime add table public.token_annotations;
alter publication supabase_realtime add table public.entry_upvotes;

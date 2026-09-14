-- Kotoba Engine — blocking/muting users. Unlike follows, block rows are
-- private to the blocker: whether you've blocked someone isn't a public
-- signal, and the blocked user is never told. Run after 0001-0008 in the
-- Supabase SQL editor.

create table if not exists public.user_blocks (
  blocker_id uuid references public.profiles(id) on delete cascade not null,
  blocked_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (blocker_id, blocked_id),
  constraint user_blocks_no_self_block check (blocker_id <> blocked_id)
);

alter table public.user_blocks enable row level security;

create policy "Users read their own block list" on public.user_blocks
  for select using (auth.uid() = blocker_id);
create policy "Users manage their own block list" on public.user_blocks
  for insert with check (auth.uid() = blocker_id);
create policy "Users remove their own blocks" on public.user_blocks
  for delete using (auth.uid() = blocker_id);

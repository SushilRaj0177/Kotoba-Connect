-- Moderation & admin roles.
-- Run this after supabase/schema.sql on an existing project. Included in
-- schema.sql already for fresh installs.

alter table public.profiles add column if not exists is_admin boolean default false;

create table if not exists public.report_flags (
  id uuid default uuid_generate_v4() primary key,
  reporter_id uuid references public.profiles(id) on delete cascade not null,
  target_type text check (target_type in ('entry', 'annotation')) not null,
  target_id uuid not null,
  reason text not null,
  status text check (status in ('pending', 'resolved', 'dismissed')) default 'pending' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  reviewed_by uuid references public.profiles(id),
  reviewed_at timestamp with time zone
);

alter table public.report_flags enable row level security;

create policy "Authenticated users can file a report" on public.report_flags
  for insert with check (auth.uid() = reporter_id);

create policy "Admins can view all reports" on public.report_flags
  for select using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can update reports" on public.report_flags
  for update using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

-- Let admins remove content that violates the rules, not just their own.
create policy "Admins can delete any entry" on public.context_entries
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

create policy "Admins can delete any annotation" on public.token_annotations
  for delete using (
    exists (select 1 from public.profiles where id = auth.uid() and is_admin = true)
  );

alter publication supabase_realtime add table public.report_flags;

-- To make your own account an admin, run this once with your user id
-- (Supabase Dashboard -> Authentication -> Users, or `select id from auth.users`):
-- update public.profiles set is_admin = true where id = '<your-user-uuid>';

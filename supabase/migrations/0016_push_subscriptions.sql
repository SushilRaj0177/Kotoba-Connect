-- Web Push subscriptions: one row per browser/device a user has opted in
-- push notifications on (a user can have several — phone + laptop). The
-- endpoint is the subscription's own unique key from the browser's push
-- service, so re-subscribing the same device upserts rather than
-- duplicating. Run after 0001-0015.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx on public.push_subscriptions(user_id);

alter table public.push_subscriptions enable row level security;

-- A user can only see/manage their own subscriptions; the actual send
-- path uses the service-role key from the server (app/api/push/*), which
-- bypasses RLS, so this only governs direct client access.
create policy "push_subscriptions_select_own" on public.push_subscriptions
  for select using (auth.uid() = user_id);

create policy "push_subscriptions_insert_own" on public.push_subscriptions
  for insert with check (auth.uid() = user_id);

create policy "push_subscriptions_delete_own" on public.push_subscriptions
  for delete using (auth.uid() = user_id);

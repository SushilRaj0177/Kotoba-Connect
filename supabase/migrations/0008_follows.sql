-- Kotoba Engine — following users. Run after 0001-0007 in the Supabase
-- SQL editor.

create table if not exists public.user_follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id),
  constraint user_follows_no_self_follow check (follower_id <> following_id)
);

alter table public.user_follows enable row level security;

-- Follower/following counts and "do I follow this person" checks need to
-- be readable by anyone, including signed-out visitors on a profile page.
create policy "Anyone can read follows" on public.user_follows
  for select using (true);
create policy "Users manage their own follows" on public.user_follows
  for insert with check (auth.uid() = follower_id);
create policy "Users remove their own follows" on public.user_follows
  for delete using (auth.uid() = follower_id);

create index if not exists user_follows_following_id_idx on public.user_follows (following_id);

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('upvote', 'annotation', 'comment', 'follow', 'system'));

-- Notify a user when someone follows them.
create or replace function public.handle_new_follow()
returns trigger as $$
begin
  insert into public.notifications (user_id, actor_id, type)
  values (new.following_id, new.follower_id, 'follow');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_follow_insert on public.user_follows;
create trigger on_follow_insert
  after insert on public.user_follows
  for each row execute procedure public.handle_new_follow();

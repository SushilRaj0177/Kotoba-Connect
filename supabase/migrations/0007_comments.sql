-- Kotoba Engine — general comment threads on entries (separate from
-- token-pinned annotations, which stay for word-level nuance notes).
-- Run after 0001-0006 in the Supabase SQL editor.

create table if not exists public.entry_comments (
  id uuid default uuid_generate_v4() primary key,
  entry_id uuid references public.context_entries(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.entry_comments enable row level security;

create policy "Anyone can read comments" on public.entry_comments
  for select using (true);
create policy "Users insert their own comments" on public.entry_comments
  for insert with check (auth.uid() = user_id);
create policy "Users delete their own comments" on public.entry_comments
  for delete using (auth.uid() = user_id);

create index if not exists entry_comments_entry_id_created_idx
  on public.entry_comments (entry_id, created_at asc);

alter publication supabase_realtime add table public.entry_comments;

-- Reports can now target a comment too.
alter table public.report_flags drop constraint if exists report_flags_target_type_check;
alter table public.report_flags add constraint report_flags_target_type_check
  check (target_type in ('entry', 'annotation', 'comment'));

-- Notify an entry's owner when someone else comments on it.
create or replace function public.handle_new_comment()
returns trigger as $$
declare
  v_owner uuid;
begin
  select user_id into v_owner from public.context_entries where id = new.entry_id;

  if v_owner is not null and v_owner <> new.user_id then
    insert into public.notifications (user_id, actor_id, type, entry_id)
    values (v_owner, new.user_id, 'comment', new.entry_id);
  end if;

  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_comment_insert on public.entry_comments;
create trigger on_comment_insert
  after insert on public.entry_comments
  for each row execute procedure public.handle_new_comment();

alter table public.notifications drop constraint if exists notifications_type_check;
alter table public.notifications add constraint notifications_type_check
  check (type in ('upvote', 'annotation', 'comment', 'system'));

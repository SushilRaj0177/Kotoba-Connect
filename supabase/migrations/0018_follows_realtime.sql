-- Adds public.user_follows to the supabase_realtime publication. Without
-- this, INSERT/DELETE on the table never reach any client-side
-- postgres_changes subscription regardless of how the frontend code is
-- written — the follower count on a profile page could only ever update
-- on a fresh page load, never live. Run after 0001-0017.
alter publication supabase_realtime add table public.user_follows;

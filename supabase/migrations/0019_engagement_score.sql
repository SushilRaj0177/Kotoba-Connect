-- Kotoba Engine — a real contributor-ranking algorithm to replace sorting
-- "Top contributors" by reputation_score (which is just a running count of
-- upvotes received — someone who posted twice, got lucky, and vanished
-- can sit above someone who annotates, comments, and votes daily). Run
-- after 0001-0018 in the Supabase SQL editor.
--
-- The model: a weighted, time-decayed engagement score, the same shape
-- community platforms actually use (Stack Overflow weights actions by
-- effort; Reddit/HN rank by an exponential recency decay) — combined here
-- into one score instead of picking just one axis:
--   score = sum over every action the user took of:
--     weight(action type) * 0.5 ^ (days since that action / 21)
-- A 21-day half-life means an action's contribution to the score halves
-- roughly every three weeks, so someone who was very active a while ago
-- and stopped naturally fades, while someone who keeps showing up in any
-- form — posting, annotating, commenting, voting — stays elevated purely
-- by staying active. Weights reflect the effort/value of each action, not
-- just its existence, so one high-effort post doesn't automatically beat
-- ten instances of real engagement, or vice versa:
--   6  posting an entry           (sourcing + translating a real sentence)
--   5  adding an annotation       (the board's actual point — see About page)
--   3  posting a comment
--   2  having an entry upvoted    (quality signal, credited to the poster)
--   2  gaining a follower         (social credibility signal)
--   1  casting an upvote          (lowest effort — a single click)
--
-- entry_upvotes has no created_at to decay by — backfills existing rows to
-- now() (a one-time cold-start approximation: old votes count at full
-- weight until they age out over the next few half-lives, which is a
-- reasonable trade against not tracking real historical vote timing at all).
alter table public.entry_upvotes add column if not exists created_at timestamp with time zone not null default timezone('utc'::text, now());

create or replace function public.get_top_contributors(p_limit int default 10)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  reputation_score integer,
  score numeric
)
language sql
stable
as $$
  with actions as (
    select user_id, created_at, 6.0 as weight from public.context_entries
    union all
    select user_id, created_at, 5.0 as weight from public.token_annotations
    union all
    select user_id, created_at, 3.0 as weight from public.entry_comments
    union all
    select user_id, created_at, 1.0 as weight from public.entry_upvotes
    union all
    select ce.user_id, eu.created_at, 2.0 as weight
      from public.entry_upvotes eu
      join public.context_entries ce on ce.id = eu.entry_id
    union all
    select following_id as user_id, created_at, 2.0 as weight from public.user_follows
  ),
  scored as (
    select
      user_id,
      sum(weight * power(0.5, extract(epoch from (now() - created_at)) / 86400.0 / 21.0)) as score
    from actions
    group by user_id
  )
  select p.id, p.username, p.display_name, p.avatar_url, p.reputation_score, s.score
  from scored s
  join public.profiles p on p.id = s.user_id
  where p.is_bot = false and s.score > 0
  order by s.score desc
  limit p_limit;
$$;

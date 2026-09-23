-- Replaces vector-only semantic search (match_entries, 0004) with hybrid
-- search: full-text keyword search (Postgres tsvector/ts_rank) fused with
-- the existing pgvector similarity search via Reciprocal Rank Fusion
-- (RRF), following Supabase's own published pattern for this exact stack
-- (https://supabase.com/docs/guides/ai/hybrid-search).
--
-- Why: a single cosine-similarity threshold can't be tuned well in
-- Gemini's embedding space — loose enough to admit a real match, it also
-- admits same-register/same-sentence-pattern noise ("I'm cooked" also
-- pulling in "I'm hungry", "I'm too sleepy" — same casual "I'm ___" shape,
-- wrong meaning). RRF sidesteps the threshold-tuning problem entirely by
-- merging RANK POSITIONS from two independent, complementary signals
-- (exact/keyword match vs. semantic similarity) instead of thresholding
-- one score — a query with a strong literal match now surfaces it via
-- full-text even when the embedding alone wasn't decisive, while vector
-- search still catches true paraphrases keyword search would miss
-- entirely. Reported to move retrieval precision from ~62% (vector-only)
-- to ~84% (hybrid + RRF) in published benchmarks.
--
-- 'simple' text search config (not 'english'): the content here is mixed
-- Japanese/English, and English-specific stemming/stopword removal isn't
-- meaningful (and could be actively wrong) applied to Japanese text.
-- 'simple' does no stemming and just lowercases + tokenizes on Postgres's
-- default parser — Postgres has no built-in CJK word segmentation, so a
-- run of Japanese with no whitespace tends to tokenize as one long token
-- rather than individual words. That means full-text mainly helps with
-- near-exact/substring Japanese matches and normal English keyword
-- matches; true cross-lingual paraphrase matching still comes from the
-- vector side, which is why this is a fusion of both rather than a
-- full-text replacement.

alter table public.context_entries
  add column if not exists fts tsvector
  generated always as (
    setweight(to_tsvector('simple', coalesce(raw_japanese, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(primary_translation, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(array_to_string(tags, ' '), '')), 'C')
  ) stored;

create index if not exists context_entries_fts_idx
  on public.context_entries using gin (fts);

create or replace function public.hybrid_search(
  query_text text,
  query_embedding vector(1536),
  match_count int default 10,
  full_text_weight float default 1,
  semantic_weight float default 1,
  rrf_k int default 50
)
returns table (
  id uuid,
  raw_japanese text,
  primary_translation text,
  formality_level text,
  score float
)
language sql stable
as $$
  with full_text as (
    select
      context_entries.id,
      row_number() over (order by ts_rank_cd(context_entries.fts, websearch_to_tsquery('simple', query_text)) desc) as rank_ix
    from public.context_entries
    where context_entries.fts @@ websearch_to_tsquery('simple', query_text)
    order by rank_ix
    limit least(match_count, 30) * 2
  ),
  semantic as (
    select
      context_entries.id,
      row_number() over (order by context_entries.embedding <=> query_embedding) as rank_ix
    from public.context_entries
    where context_entries.embedding is not null
    order by rank_ix
    limit least(match_count, 30) * 2
  )
  select
    context_entries.id,
    context_entries.raw_japanese,
    context_entries.primary_translation,
    context_entries.formality_level,
    (
      coalesce(1.0 / (rrf_k + full_text.rank_ix), 0.0) * full_text_weight +
      coalesce(1.0 / (rrf_k + semantic.rank_ix), 0.0) * semantic_weight
    ) as score
  from full_text
  full outer join semantic on full_text.id = semantic.id
  join public.context_entries on context_entries.id = coalesce(full_text.id, semantic.id)
  order by score desc
  limit least(match_count, 30);
$$;

-- match_entries (0004) is superseded by hybrid_search above but left in
-- place rather than dropped — no other code path calls it, and a stray
-- unused function costs nothing to keep versus risking a migration that
-- fails if something still references it.

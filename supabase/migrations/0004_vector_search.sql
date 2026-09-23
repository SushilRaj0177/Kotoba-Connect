-- Phase 2: pgvector semantic search.
-- Feature-flagged in the app on GEMINI_API_KEY being set (used only for
-- embeddings, via gemini-embedding-001 truncated to 1536 dimensions via
-- outputDimensionality — see lib/embeddings.ts). Entries posted before
-- this ran, or with no API key configured, simply have a null embedding
-- and are excluded from search results until re-embedded.

create extension if not exists vector;

alter table public.context_entries add column if not exists embedding vector(1536);

-- ivfflat needs an estimate of row count to size well; fine to create early
-- on a small table, Supabase will use a sequential scan until it's populated.
create index if not exists context_entries_embedding_idx
  on public.context_entries using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

create or replace function public.match_entries(
  query_embedding vector(1536),
  match_threshold float default 0.5,
  match_count int default 10
)
returns table (
  id uuid,
  raw_japanese text,
  primary_translation text,
  formality_level text,
  similarity float
)
language sql stable
as $$
  select
    context_entries.id,
    context_entries.raw_japanese,
    context_entries.primary_translation,
    context_entries.formality_level,
    1 - (context_entries.embedding <=> query_embedding) as similarity
  from public.context_entries
  where context_entries.embedding is not null
    and 1 - (context_entries.embedding <=> query_embedding) > match_threshold
  order by context_entries.embedding <=> query_embedding
  limit match_count;
$$;

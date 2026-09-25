// Every list/detail query for context_entries was using select("*"), which
// also pulls the `embedding` column — a vector(1536) added for semantic
// search (supabase/migrations/0004_vector_search.sql) that's never read by
// any renderer, just serialized to JSON and shipped to the client for
// nothing. At 1536 floats per row, that's tens of KB of dead payload per
// entry, multiplied by every row on a list page (bookmarks, board, tags,
// search, a profile) — the single biggest lever on real page-load time in
// this app. One shared explicit column list instead of "*" everywhere.
export const ENTRY_COLUMNS =
  "id, user_id, raw_japanese, furigana_parsed, media_url, formality_level, primary_translation, tags, upvotes_count, created_at, ai_formality_suggestion, ai_nuance_summary, ai_processed";

export const ENTRY_WITH_PROFILE_COLUMNS = `${ENTRY_COLUMNS}, profiles!context_entries_user_id_fkey(username, display_name, avatar_url, is_bot)`;

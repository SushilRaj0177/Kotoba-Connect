export type FormalityLevel =
  | "Sonkeigo"
  | "Kenjougo"
  | "Teineigo"
  | "Casual"
  | "Slang"
  | "Dialect";

export interface KuromojiToken {
  word_id: number;
  word_type: string;
  surface_form: string;
  pos: string;
  pos_detail_1: string;
  basic_form: string;
  reading?: string;
  pronunciation?: string;
}

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  reputation_score: number;
  created_at: string;
}

export interface ContextEntry {
  id: string;
  user_id: string;
  raw_japanese: string;
  furigana_parsed: KuromojiToken[];
  media_url: string | null;
  formality_level: FormalityLevel | null;
  primary_translation: string;
  tags: string[];
  upvotes_count: number;
  created_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url">;
  has_voted?: boolean;
}

export interface TokenAnnotation {
  id: string;
  entry_id: string;
  user_id: string;
  token_index: number;
  nuance_note: string;
  cultural_context: string | null;
  upvotes_count: number;
  created_at: string;
  profiles?: Pick<Profile, "username" | "avatar_url">;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Partial<Profile> & { id: string; username: string };
        Update: Partial<Profile>;
      };
      context_entries: {
        Row: ContextEntry;
        Insert: Partial<ContextEntry> & {
          user_id: string;
          raw_japanese: string;
          primary_translation: string;
        };
        Update: Partial<ContextEntry>;
      };
      token_annotations: {
        Row: TokenAnnotation;
        Insert: Partial<TokenAnnotation> & {
          entry_id: string;
          user_id: string;
          token_index: number;
          nuance_note: string;
        };
        Update: Partial<TokenAnnotation>;
      };
      entry_upvotes: {
        Row: { user_id: string; entry_id: string };
        Insert: { user_id: string; entry_id: string };
        Update: never;
      };
    };
    Functions: {
      toggle_entry_upvote: {
        Args: { p_entry_id: string };
        Returns: boolean;
      };
    };
  };
}

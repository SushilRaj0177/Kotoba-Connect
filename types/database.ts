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
  bio: string | null;
  website: string | null;
  reputation_score: number;
  is_admin: boolean;
  created_at: string;
}

export interface Bookmark {
  user_id: string;
  entry_id: string;
  created_at: string;
}

export type NotificationType = "upvote" | "annotation" | "comment" | "follow" | "system";

export interface AppNotification {
  id: string;
  user_id: string;
  actor_id: string | null;
  type: NotificationType;
  entry_id: string | null;
  annotation_id: string | null;
  message: string | null;
  read: boolean;
  created_at: string;
  actor?: Pick<Profile, "username" | "avatar_url"> | null;
  entry?: Pick<ContextEntry, "raw_japanese"> | null;
}

export type ReportStatus = "pending" | "resolved" | "dismissed";
export type ReportTargetType = "entry" | "annotation" | "comment";

export interface ReportFlag {
  id: string;
  reporter_id: string;
  target_type: ReportTargetType;
  target_id: string;
  reason: string;
  status: ReportStatus;
  created_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
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
  ai_formality_suggestion: string | null;
  ai_nuance_summary: string | null;
  ai_processed: boolean;
  embedding?: number[] | null;
  profiles?: Pick<Profile, "username" | "avatar_url">;
  has_voted?: boolean;
  is_bookmarked?: boolean;
  similarity?: number;
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

export interface EntryComment {
  id: string;
  entry_id: string;
  user_id: string;
  body: string;
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
      bookmarks: {
        Row: Bookmark;
        Insert: { user_id: string; entry_id: string };
        Update: never;
      };
      notifications: {
        Row: AppNotification;
        Insert: never;
        Update: Partial<Pick<AppNotification, "read">>;
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

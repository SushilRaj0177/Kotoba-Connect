"use client";

import { useState } from "react";
import Link from "next/link";
import type { ContextEntry } from "@/types/database";
import FormalityBadge from "@/components/FormalityBadge";
import ReportButton from "@/components/ReportButton";
import AiNuanceCallout from "@/components/AiNuanceCallout";
import Avatar from "@/components/Avatar";
import BookmarkButton from "@/components/BookmarkButton";
import DeleteEntryButton from "@/components/DeleteEntryButton";
import EditEntryForm from "@/components/EditEntryForm";
import ShareEntryButton from "@/components/ShareEntryButton";
import LikeButton from "@/components/LikeButton";
import EntryComments from "@/components/EntryComments";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function EntryCard({
  entry,
  currentUserId,
  bookmarked = false,
  commentCount = 0,
}: {
  entry: ContextEntry;
  currentUserId: string | null;
  bookmarked?: boolean;
  commentCount?: number;
}) {
  const { t } = useLocale();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  // Local override so a save reflects immediately on pages without a
  // realtime context_entries subscription (bookmarks, tags, profile) —
  // not just on the board.
  const [liveEntry, setLiveEntry] = useState(entry);

  const username = entry.profiles?.username ?? "unknown";
  const displayName = entry.profiles?.display_name;
  const avatarUrl = entry.profiles?.avatar_url;
  const timestamp = new Date(entry.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
      {/* Avatar sits inline on the name row instead of anchoring a full-height
         left column — at 40px it only fills the top sliver of a card that's
         several times taller, leaving the rest of that column as dead space
         running down the whole card. */}
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Avatar username={username} avatarUrl={avatarUrl} size={22} />
        <Link
          href={`/u/${username}`}
          className="font-display text-sm font-bold text-ink-text-header hover:underline"
        >
          {displayName?.trim() || `@${username}`}
        </Link>
        <span className="text-xs text-ink-text-muted">{timestamp}</span>
        <FormalityBadge level={liveEntry.formality_level} />
      </div>

      <div className="min-w-0">
        {editing ? (
          <EditEntryForm
            entry={liveEntry}
            onCancel={() => setEditing(false)}
            onSaved={(patch) => {
              setLiveEntry((prev) => ({ ...prev, ...patch }));
              setEditing(false);
            }}
          />
        ) : (
          <>
            <Link href={`/entries/${entry.id}`} className="block min-w-0">
              <p className="font-jp text-lg leading-loose text-ink-text-header">{liveEntry.raw_japanese}</p>
              <p className="mt-1 text-sm text-ink-text-muted">{liveEntry.primary_translation}</p>
            </Link>

            <AiNuanceCallout
              summary={liveEntry.ai_nuance_summary}
              formalitySuggestion={liveEntry.ai_formality_suggestion}
            />

            {!!liveEntry.tags?.length && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {liveEntry.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${encodeURIComponent(tag)}`}
                    className="rounded-full bg-ink-bg-input px-2 py-0.5 text-xs text-ink-text-muted transition hover:text-ink-accent"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}
          </>
        )}

        {!editing && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs">
            <LikeButton
              entryId={entry.id}
              currentUserId={currentUserId}
              initialCount={entry.upvotes_count}
              initialVoted={!!entry.has_voted}
            />
            <Link
              href={`/entries/${entry.id}`}
              className="font-medium text-ink-text-link hover:underline"
            >
              {t("card.annotate")}
            </Link>
            <button
              type="button"
              onClick={() => setCommentsOpen((o) => !o)}
              className={`flex items-center gap-1.5 font-bold transition ${
                commentsOpen ? "text-ink-accent" : "text-ink-text-muted hover:text-ink-text"
              }`}
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {commentCount > 0 ? `${commentCount} ${t("card.comments")}` : t("comments.title")}
            </button>
            <BookmarkButton entryId={entry.id} userId={currentUserId} initialBookmarked={bookmarked} />
            <ShareEntryButton entryId={entry.id} rawJapanese={liveEntry.raw_japanese} />
            <ReportButton targetType="entry" targetId={entry.id} userId={currentUserId} />
            {currentUserId === entry.user_id && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="rounded px-2 py-1 text-xs font-semibold text-ink-text-muted transition hover:text-ink-text"
                >
                  {t("card.edit")}
                </button>
                <DeleteEntryButton entryId={entry.id} />
              </>
            )}
          </div>
        )}

        {commentsOpen && !editing && (
          <div className="mt-3">
            <EntryComments entryId={entry.id} userId={currentUserId} embedded />
          </div>
        )}
      </div>
    </article>
  );
}

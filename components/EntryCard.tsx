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
import TranslateButton from "@/components/TranslateButton";
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
  const { t, locale } = useLocale();
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
        <Avatar username={username} avatarUrl={avatarUrl} size={28} />
        <Link
          href={`/u/${username}`}
          className="font-display text-sm font-bold text-ink-text-header hover:underline"
        >
          {displayName?.trim() || `@${username}`}
        </Link>
        {entry.profiles?.is_bot && (
          <span className="flex-none rounded-full bg-ink-accent/15 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-ink-accent">
            {t("card.bot")}
          </span>
        )}
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
            {/* Entries are always Japanese — only useful to translate when
               viewing the EN UI, otherwise it's Japanese to Japanese. */}
            {locale === "en" && <TranslateButton text={liveEntry.raw_japanese} className="mt-1" />}

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
          <div className="mt-3 flex flex-wrap items-center gap-0.5">
            <LikeButton
              entryId={entry.id}
              currentUserId={currentUserId}
              initialCount={entry.upvotes_count}
              initialVoted={!!entry.has_voted}
            />
            <Link
              href={`/entries/${entry.id}`}
              title={t("card.annotateTitle")}
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-text"
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.4 2.6a2.1 2.1 0 1 1 3 3L11 16l-4 1 1-4Z" />
              </svg>
            </Link>
            <button
              type="button"
              onClick={() => setCommentsOpen((o) => !o)}
              title={t("comments.title")}
              className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition ${
                commentsOpen ? "text-ink-accent" : "text-ink-text-muted hover:bg-ink-bg-hover hover:text-ink-text"
              }`}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              {commentCount > 0 && commentCount}
            </button>
            <BookmarkButton entryId={entry.id} userId={currentUserId} initialBookmarked={bookmarked} />
            <ShareEntryButton entryId={entry.id} rawJapanese={liveEntry.raw_japanese} />
            <ReportButton targetType="entry" targetId={entry.id} userId={currentUserId} />
            {currentUserId === entry.user_id && (
              <>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  title={t("card.edit")}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-text"
                >
                  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                  </svg>
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

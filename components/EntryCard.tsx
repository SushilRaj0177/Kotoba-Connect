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
import TranslateToggle from "@/components/TranslateToggle";
import EntryComments from "@/components/EntryComments";
import AiInsightEdge from "@/components/edge/AiInsightEdge";
import JapaneseText from "@/components/JapaneseText";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useTranslate } from "@/lib/use-translate";
import { useTheme } from "@/components/theme/ThemeProvider";
import { useDensity } from "@/components/theme/DensityProvider";

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
  const { theme } = useTheme();
  const { density } = useDensity();
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  // Local override so a save reflects immediately on pages without a
  // realtime context_entries subscription (bookmarks, tags, profile) —
  // not just on the board.
  const [liveEntry, setLiveEntry] = useState(entry);
  const rawTranslate = useTranslate(liveEntry.raw_japanese);

  const username = entry.profiles?.username ?? "unknown";
  const displayName = entry.profiles?.display_name;
  const avatarUrl = entry.profiles?.avatar_url;
  const timestamp = new Date(entry.created_at).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  // Edge isn't just a color swap — the original OLED-only pass still had
  // every card individually boxed (border + shadow + padding), five
  // things crammed onto one header line, and a permanently-open colored
  // AI box, which is the actual source of "clutter" regardless of
  // background color. This is a genuinely different layout (no card
  // shape, two-line header, collapsed AI insight, a wider-spaced action
  // row) gated entirely behind the theme, sharing this component's same
  // state/handlers — light and dark keep the exact original markup below
  // completely untouched.
  if (theme === "edge") {
    return (
      <article className="border-b border-ink-border/60 py-4 first:pt-0">
        <div className="flex items-start gap-2.5">
          <Link href={`/u/${username}`} className="flex-none">
            <Avatar username={username} avatarUrl={avatarUrl} size={28} />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <Link href={`/u/${username}`} className="font-display text-sm font-bold text-ink-text-header hover:underline">
                {displayName?.trim() || `@${username}`}
              </Link>
              {entry.profiles?.is_bot && (
                <span className="text-[10px] font-bold uppercase tracking-wide text-ink-text-muted">{t("card.bot")}</span>
              )}
            </div>
            <div className="mt-0.5 flex items-center gap-2 text-xs text-ink-text-muted">
              <span>{timestamp}</span>
              <FormalityBadge level={liveEntry.formality_level} />
            </div>
          </div>
        </div>

        <div className="mt-2 min-w-0">
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
                <p className={rawTranslate.showingTranslation && rawTranslate.translation ? "text-lg leading-relaxed text-ink-text-header" : "font-jp text-lg leading-relaxed text-ink-text-header"}>
                  {rawTranslate.showingTranslation && rawTranslate.translation ? (
                    rawTranslate.translation
                  ) : (
                    <JapaneseText text={rawTranslate.display} tokens={liveEntry.furigana_parsed} />
                  )}
                </p>
                <p className="mt-1 text-sm text-ink-text-muted">{liveEntry.primary_translation}</p>
              </Link>
              {locale === "en" && <TranslateToggle state={rawTranslate} className="mt-1" />}

              <AiInsightEdge summary={liveEntry.ai_nuance_summary} formalitySuggestion={liveEntry.ai_formality_suggestion} />

              {!!liveEntry.tags?.length && (
                <div className="mt-2.5 flex flex-wrap gap-x-2.5 gap-y-1">
                  {liveEntry.tags.map((tag) => (
                    <Link key={tag} href={`/tags/${encodeURIComponent(tag)}`} className="text-xs text-ink-text-muted hover:text-ink-accent">
                      #{tag}
                    </Link>
                  ))}
                </div>
              )}
            </>
          )}

          {!editing && (
            <div className="mt-3 flex items-center gap-4">
              <LikeButton
                entryId={entry.id}
                currentUserId={currentUserId}
                initialCount={entry.upvotes_count}
                initialVoted={!!entry.has_voted}
              />
              <Link
                href={`/entries/${entry.id}`}
                title={t("card.annotateTitle")}
                className="text-ink-text-muted transition active:scale-90 hover:text-ink-text"
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.4 2.6a2.1 2.1 0 1 1 3 3L11 16l-4 1 1-4Z" />
                </svg>
              </Link>
              <button
                type="button"
                onClick={() => setCommentsOpen((o) => !o)}
                title={t("comments.title")}
                className={`flex items-center gap-1.5 text-sm font-bold transition active:scale-90 ${commentsOpen ? "text-ink-accent" : "text-ink-text-muted hover:text-ink-text"}`}
              >
                <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
                {commentCount > 0 && commentCount}
              </button>
              <BookmarkButton entryId={entry.id} userId={currentUserId} initialBookmarked={bookmarked} />
              <ShareEntryButton entryId={entry.id} rawJapanese={liveEntry.raw_japanese} />
              <div className="ml-auto flex items-center gap-3">
                {currentUserId === entry.user_id ? (
                  <>
                    <button type="button" onClick={() => setEditing(true)} title={t("card.edit")} className="text-ink-text-muted transition active:scale-90 hover:text-ink-text">
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                    </button>
                    <DeleteEntryButton entryId={entry.id} />
                  </>
                ) : (
                  <ReportButton targetType="entry" targetId={entry.id} userId={currentUserId} />
                )}
              </div>
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

  return (
    <article className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm">
      {/* Avatar sits inline on the name row instead of anchoring a full-height
         left column — at 40px it only fills the top sliver of a card that's
         several times taller, leaving the rest of that column as dead space
         running down the whole card. */}
      <div className="mb-1 flex flex-wrap items-center gap-2">
        <Link href={`/u/${username}`} className="flex-none">
          <Avatar username={username} avatarUrl={avatarUrl} size={28} />
        </Link>
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
              <p
                className={
                  rawTranslate.showingTranslation && rawTranslate.translation
                    ? "text-lg leading-loose text-ink-text-header"
                    : "font-jp text-lg leading-loose text-ink-text-header"
                }
              >
                {rawTranslate.showingTranslation && rawTranslate.translation ? (
                  rawTranslate.translation
                ) : (
                  <JapaneseText text={rawTranslate.display} tokens={liveEntry.furigana_parsed} />
                )}
              </p>
              <p className="mt-1 text-sm text-ink-text-muted">{liveEntry.primary_translation}</p>
            </Link>
            {/* Entries are always Japanese — only useful to translate when
               viewing the EN UI, otherwise it's Japanese to Japanese. */}
            {locale === "en" && <TranslateToggle state={rawTranslate} className="mt-1" />}

            {/* Density is a separate preference from color theme (see
               Settings → Appearance) — Edge always gets the collapsed,
               click-to-expand insight regardless of this setting, but
               someone on light/dark can now opt into the same "collapsed
               by default" behavior without switching their whole color
               theme to get it. */}
            {density === "compact" ? (
              <AiInsightEdge
                summary={liveEntry.ai_nuance_summary}
                formalitySuggestion={liveEntry.ai_formality_suggestion}
              />
            ) : (
              <AiNuanceCallout
                summary={liveEntry.ai_nuance_summary}
                formalitySuggestion={liveEntry.ai_formality_suggestion}
              />
            )}

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
              className="flex h-10 w-10 items-center justify-center rounded-full text-ink-text-muted transition active:scale-90 hover:bg-ink-bg-hover hover:text-ink-text"
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
              className={`flex h-10 items-center gap-1.5 rounded-full px-3 text-sm font-bold transition active:scale-90 ${
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
            {/* Report/edit/delete pinned to the right with ml-auto instead of
               sitting in the same left-to-right run as the social actions —
               when this row wraps on a narrow phone, the wrapped line reads
               as its own deliberate right-aligned group instead of a loose
               extra row of icons. */}
            <div className="ml-auto flex items-center gap-0.5">
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

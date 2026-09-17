"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useBookmarkState } from "@/lib/use-entry-interaction";

export default function BookmarkButton({
  entryId,
  userId,
  initialBookmarked,
}: {
  entryId: string;
  userId: string | null;
  initialBookmarked: boolean;
}) {
  const { t } = useLocale();
  // Lives in a shared cross-instance store (see use-entry-interaction) so
  // saving this entry here instantly updates every other rendered copy of
  // it, including ones on a page you haven't navigated to yet.
  const [bookmarked, setBookmarked] = useBookmarkState(entryId, initialBookmarked);
  const [busy, setBusy] = useState(false);

  if (!userId) return null;

  async function toggle() {
    if (busy) return;
    setBusy(true);
    const next = !bookmarked;
    setBookmarked(next);

    const supabase = createClient();
    const { error } = next
      ? await supabase.from("bookmarks").insert({ user_id: userId, entry_id: entryId })
      : await supabase.from("bookmarks").delete().eq("user_id", userId).eq("entry_id", entryId);

    if (error) setBookmarked(!next);
    setBusy(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={bookmarked ? t("card.unsave") : t("card.save")}
      className={`flex h-10 w-10 items-center justify-center rounded-full transition active:scale-90 ${
        bookmarked ? "text-ink-accent" : "text-ink-text-muted hover:bg-ink-bg-hover hover:text-ink-text"
      } disabled:cursor-not-allowed disabled:opacity-50`}
    >
      <svg
        width="19"
        height="19"
        viewBox="0 0 24 24"
        fill={bookmarked ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" />
      </svg>
    </button>
  );
}

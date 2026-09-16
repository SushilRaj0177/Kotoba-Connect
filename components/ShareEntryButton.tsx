"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/Toast";
import { SITE_URL } from "@/lib/site";

// Content-sharing platform with no share affordance anywhere was a real
// gap — native share sheet where available (mobile), clipboard copy with
// a toast confirmation everywhere else (the shared app-wide toast queue
// instead of a one-off inline label swap).
export default function ShareEntryButton({
  entryId,
  rawJapanese,
}: {
  entryId: string;
  rawJapanese: string;
}) {
  const { t } = useLocale();
  const { showToast } = useToast();

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    const url = `${SITE_URL}/entries/${entryId}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: rawJapanese, url });
      } catch {
        // User cancelled the share sheet — not an error, do nothing.
      }
      return;
    }

    try {
      await navigator.clipboard.writeText(url);
      showToast(t("card.linkCopied"));
    } catch {
      // Clipboard API blocked (permissions, insecure context) — silently no-op
      // rather than surface an error for a non-critical convenience action.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      title={t("card.share")}
      className="flex h-9 w-9 items-center justify-center rounded-full text-ink-text-muted transition hover:bg-ink-bg-hover hover:text-ink-text active:scale-90"
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="18" cy="5" r="3" />
        <circle cx="6" cy="12" r="3" />
        <circle cx="18" cy="19" r="3" />
        <path d="m8.6 13.5 6.8 4M15.4 6.5 8.6 10.5" />
      </svg>
    </button>
  );
}

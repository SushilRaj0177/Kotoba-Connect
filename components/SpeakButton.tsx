"use client";

import { useEffect, useState } from "react";
import { speakJapanese, speechSupported } from "@/lib/use-speech";
import { useLocale } from "@/components/i18n/LocaleProvider";

// Sits alongside the other per-entry action buttons (like, comment,
// bookmark, ...) rather than inline next to the Japanese text itself —
// the text is usually wrapped in a Link to the entry's own page, and a
// <button> can't legally nest inside an <a>.
export default function SpeakButton({
  text,
  variant = "chip",
  className = "",
}: {
  text: string;
  // "chip": h-10 w-10 rounded hover circle, matching the default card's
  // action-row icons. "bare": no box/hover fill, matching Edge's flatter,
  // chromeless icon style in that theme's action row.
  variant?: "chip" | "bare";
  className?: string;
}) {
  const { t } = useLocale();
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);

  // speechSupported() reads `window`, so it can only be checked after
  // mount — checking it during render would disagree with the server's
  // markup (which has no window) and trigger a hydration mismatch.
  useEffect(() => {
    setSupported(speechSupported());
  }, []);

  if (!supported) return null;

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setSpeaking(true);
    speakJapanese(text, () => setSpeaking(false));
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      title={t("card.listen")}
      aria-label={t("card.listen")}
      className={`transition active:scale-90 ${
        variant === "chip"
          ? "flex h-10 w-10 items-center justify-center rounded-full"
          : "inline-flex items-center"
      } ${speaking ? "text-ink-accent" : "text-ink-text-muted hover:bg-ink-bg-hover hover:text-ink-text"} ${
        variant === "bare" ? "hover:!bg-transparent" : ""
      } ${className}`}
    >
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 9v6h4l5 5V4L8 9H4z" />
        <path d={speaking ? "M17 8.5a5.5 5.5 0 0 1 0 7M19.5 6a9 9 0 0 1 0 12" : "M16.5 9a3.5 3.5 0 0 1 0 6"} />
      </svg>
    </button>
  );
}

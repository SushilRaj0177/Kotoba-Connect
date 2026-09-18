"use client";

import * as wanakana from "wanakana";
import { katakanaToHiragana } from "@/lib/kana";
import { useReadingAid } from "@/lib/use-reading-aid";
import type { KuromojiToken } from "@/types/database";

const KANJI_RE = /[一-龯㐀-䶿]/;

// The plain (non-interactive) reading-aid renderer, used for card
// previews where TokenizedText's per-word click-to-annotate behavior
// isn't wanted. Falls back to the plain string whenever there's nothing
// useful to work with — no tokens, or the aid is off — so this is a safe
// drop-in wherever a bare Japanese string was rendered before.
export default function JapaneseText({
  text,
  tokens,
  className,
}: {
  text: string;
  tokens?: KuromojiToken[] | null;
  className?: string;
}) {
  const [mode] = useReadingAid();

  if (mode === "none" || !tokens?.length) {
    return <span className={className}>{text}</span>;
  }

  if (mode === "furigana") {
    return (
      <span className={className}>
        {tokens.map((token, i) =>
          token.reading && KANJI_RE.test(token.surface_form) ? (
            <ruby key={i}>
              {token.surface_form}
              <rt className="text-[0.5em] text-ink-text-muted">{katakanaToHiragana(token.reading)}</rt>
            </ruby>
          ) : (
            <span key={i}>{token.surface_form}</span>
          )
        )}
      </span>
    );
  }

  // romaji — pronunciation (not reading) accounts for sound shifts like
  // the topic marker は being spoken "wa", so it's the more accurate
  // source for how the sentence actually sounds.
  return (
    <span className={className}>
      {tokens.map((t) => wanakana.toRomaji(t.pronunciation || t.reading || t.surface_form)).join(" ")}
    </span>
  );
}

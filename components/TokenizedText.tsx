"use client";

import * as wanakana from "wanakana";
import { katakanaToHiragana } from "@/lib/kana";
import { useReadingAid } from "@/lib/use-reading-aid";
import type { KuromojiToken } from "@/types/database";

const KANJI_RE = /[一-龯㐀-䶿]/;

export default function TokenizedText({
  tokens,
  onTokenClick,
  activeIndex,
}: {
  tokens: KuromojiToken[];
  onTokenClick?: (index: number) => void;
  activeIndex?: number | null;
}) {
  const [readingAid] = useReadingAid();
  if (!tokens.length) return null;

  return (
    <div className="flex flex-wrap gap-1 font-jp text-lg leading-loose text-ink-text-header">
      {tokens.map((token, i) => (
        <button
          key={i}
          type="button"
          disabled={!onTokenClick}
          onClick={() => onTokenClick?.(i)}
          title={`${token.pos} · ${token.basic_form}${token.reading ? ` · ${token.reading}` : ""}`}
          className={`rounded px-0.5 transition ${
            onTokenClick ? "cursor-pointer hover:bg-ink-bg-hover" : "cursor-default"
          } ${activeIndex === i ? "bg-ink-accent text-white hover:bg-ink-accent" : ""}`}
        >
          {readingAid === "furigana" && token.reading && KANJI_RE.test(token.surface_form) ? (
            <ruby>
              {token.surface_form}
              <rt className="text-[0.5em]">{katakanaToHiragana(token.reading)}</rt>
            </ruby>
          ) : readingAid === "romaji" ? (
            // pronunciation (not reading) accounts for sound shifts like
            // the topic marker は being spoken "wa".
            wanakana.toRomaji(token.pronunciation || token.reading || token.surface_form)
          ) : (
            token.surface_form
          )}
        </button>
      ))}
    </div>
  );
}

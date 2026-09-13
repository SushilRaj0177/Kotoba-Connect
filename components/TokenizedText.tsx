"use client";

import type { KuromojiToken } from "@/types/database";

export default function TokenizedText({
  tokens,
  onTokenClick,
  activeIndex,
}: {
  tokens: KuromojiToken[];
  onTokenClick?: (index: number) => void;
  activeIndex?: number | null;
}) {
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
          {token.surface_form}
        </button>
      ))}
    </div>
  );
}

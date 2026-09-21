"use client";

import type { FormalityLevel } from "@/types/database";
import { formalityLabel } from "@/lib/formality-labels";
import { useLocale } from "@/components/i18n/LocaleProvider";

export type SortOption = "new" | "popular";

const FORMALITY_LEVELS: FormalityLevel[] = [
  "Sonkeigo",
  "Kenjougo",
  "Teineigo",
  "Casual",
  "Slang",
  "Dialect",
];

// Same hues as FormalityBadge so an active filter pill reads as "the same
// concept, now a control" rather than a disconnected new color language.
const FORMALITY_RING: Record<FormalityLevel, string> = {
  Sonkeigo: "ring-violet-500 bg-violet-500 text-white",
  Kenjougo: "ring-indigo-500 bg-indigo-500 text-white",
  Teineigo: "ring-sky-500 bg-sky-500 text-white",
  Casual: "ring-emerald-500 bg-emerald-500 text-white",
  Slang: "ring-amber-500 bg-amber-500 text-white",
  Dialect: "ring-rose-500 bg-rose-500 text-white",
};

export default function BoardControls({
  sortBy,
  onSortChange,
  formalityFilter,
  onFormalityChange,
}: {
  sortBy: SortOption;
  onSortChange: (sort: SortOption) => void;
  formalityFilter: FormalityLevel | "all";
  onFormalityChange: (level: FormalityLevel | "all") => void;
}) {
  const { t } = useLocale();

  return (
    <div className="space-y-2">
      <div className="flex rounded-full bg-ink-bg-input p-1 text-xs font-semibold sm:inline-flex">
        <button
          type="button"
          onClick={() => onSortChange("new")}
          className={`flex-1 rounded-full px-3 py-1.5 transition sm:flex-none ${
            sortBy === "new" ? "bg-ink-accent text-white" : "text-ink-text-muted hover:text-ink-text"
          }`}
        >
          {t("board.sortNew")}
        </button>
        <button
          type="button"
          onClick={() => onSortChange("popular")}
          className={`flex-1 rounded-full px-3 py-1.5 transition sm:flex-none ${
            sortBy === "popular" ? "bg-ink-accent text-white" : "text-ink-text-muted hover:text-ink-text"
          }`}
        >
          {t("board.sortPopular")}
        </button>
      </div>

      {/* A single scrollable row on mobile instead of letting 7 pills wrap
         across 2-3 lines and push the feed down before it even starts —
         the same controls, just laid out horizontally where space is
         tight. Reverts to a normal wrapping row once there's room. */}
      <div className="no-scrollbar -mx-1 flex items-center gap-1.5 overflow-x-auto px-1 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        <button
          type="button"
          onClick={() => onFormalityChange("all")}
          className={`flex-none rounded-full px-3 py-1.5 text-xs font-semibold transition ${
            formalityFilter === "all"
              ? "bg-ink-text-header text-ink-bg"
              : "bg-ink-bg-input text-ink-text-muted hover:text-ink-text"
          }`}
        >
          {t("board.filterAll")}
        </button>
        {FORMALITY_LEVELS.map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => onFormalityChange(formalityFilter === level ? "all" : level)}
            className={`flex-none rounded-full px-3 py-1.5 text-xs font-semibold transition ${
              formalityFilter === level
                ? FORMALITY_RING[level]
                : "bg-ink-bg-input text-ink-text-muted hover:text-ink-text"
            }`}
          >
            {formalityLabel(t, level)}
          </button>
        ))}
      </div>
    </div>
  );
}

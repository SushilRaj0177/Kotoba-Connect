"use client";

import { useEffect, useRef, useState } from "react";
import type { FormalityLevel } from "@/types/database";
import { FORMALITY_COLORS } from "@/lib/formality-colors";
import { formalityLabel } from "@/lib/formality-labels";
import { useLocale } from "@/components/i18n/LocaleProvider";

const FORMALITY_LEVELS: FormalityLevel[] = [
  "Sonkeigo",
  "Kenjougo",
  "Teineigo",
  "Casual",
  "Slang",
  "Dialect",
];

// A native <select>'s dropdown list can't be restyled — it renders as the
// browser/OS's own default popup (visible in a screenshot with a stock
// blue-highlighted row), which clashes hard with the rest of the app's
// custom UI. This swaps it for a button + absolutely-positioned option
// list built from scratch, using the same colored-pill language as
// FormalityBadge so picking a register here visually previews the badge
// it'll produce on the card.
export default function FormalitySelect({
  value,
  onChange,
  id,
}: {
  value: FormalityLevel;
  onChange: (level: FormalityLevel) => void;
  id?: string;
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        id={id}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex w-full items-center gap-2 rounded-lg border-none bg-ink-bg-input px-3 py-2 text-left text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
      >
        <span className={`h-2.5 w-2.5 flex-none rounded-full ${FORMALITY_COLORS[value]}`} aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{formalityLabel(t, value)}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className={`flex-none text-ink-text-muted transition ${open ? "rotate-180" : ""}`}
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute left-0 right-0 top-full z-20 mt-1.5 max-h-64 overflow-y-auto rounded-2xl bg-ink-bg-secondary p-1.5 border border-ink-border/70 shadow-xl"
        >
          {FORMALITY_LEVELS.map((level) => (
            <li key={level}>
              <button
                type="button"
                role="option"
                aria-selected={level === value}
                onClick={() => {
                  onChange(level);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 rounded-xl px-2.5 py-2 text-left text-sm transition ${
                  level === value ? "bg-ink-bg-input font-semibold text-ink-text-header" : "text-ink-text hover:bg-ink-bg-hover"
                }`}
              >
                <span className={`h-2.5 w-2.5 flex-none rounded-full ${FORMALITY_COLORS[level]}`} aria-hidden="true" />
                {formalityLabel(t, level)}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

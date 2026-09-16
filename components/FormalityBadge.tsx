"use client";

import { useEffect, useRef, useState } from "react";
import type { FormalityLevel } from "@/types/database";
import { FORMALITY_COLORS } from "@/lib/formality-colors";
import { formalityLabel, formalityGloss, formalityHasGloss, formalityDescription } from "@/lib/formality-labels";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { usePopoverClamp } from "@/lib/use-popover-clamp";

// Bold solid tag chips, one vivid hue per register — reads as a badge/
// achievement pill rather than a subtle label, matching the energetic UI.
// "Sonkeigo"/"Kenjougo"/"Teineigo" are real linguistics terms a beginner
// won't know and won't want to stop and search — a small tap target reveals
// a plain-English explainer without permanently lengthening the badge
// (Casual/Slang/Dialect are already plain English, so they skip it).
export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const glossRef = useRef<HTMLDivElement>(null);
  const shift = usePopoverClamp(open, glossRef);

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

  if (!level) return null;

  const hasGloss = formalityHasGloss(t, level);

  return (
    <div className="relative inline-block" ref={ref}>
      <button
        type="button"
        onClick={() => hasGloss && setOpen((o) => !o)}
        className={`flex flex-none items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white ${FORMALITY_COLORS[level]} ${
          hasGloss ? "cursor-pointer" : "cursor-default"
        }`}
      >
        {formalityLabel(t, level)}
        {hasGloss && (
          <span className="flex h-3.5 w-3.5 flex-none items-center justify-center rounded-full bg-white/25 text-[9px] font-black normal-case tracking-normal">
            i
          </span>
        )}
      </button>

      {open && hasGloss && (
        <div
          ref={glossRef}
          style={{ transform: shift ? `translateX(${shift}px)` : undefined }}
          className="absolute left-0 top-full z-20 mt-1.5 w-56 rounded-xl bg-ink-bg-secondary p-3 border border-ink-border/70 shadow-xl"
        >
          <p className="text-xs font-bold text-ink-text-header">{formalityGloss(t, level)}</p>
          <p className="mt-1 text-xs leading-relaxed text-ink-text-muted">{formalityDescription(t, level)}</p>
        </div>
      )}
    </div>
  );
}

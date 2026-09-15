"use client";

import type { FormalityLevel } from "@/types/database";
import { FORMALITY_COLORS } from "@/lib/formality-colors";
import { formalityDisplayLabel, formalityDescription } from "@/lib/formality-labels";
import { useLocale } from "@/components/i18n/LocaleProvider";

// Bold solid tag chips, one vivid hue per register — reads as a badge/
// achievement pill rather than a subtle label, matching the energetic UI.
// Pairs the linguistic term with a plain-English gloss ("Teineigo ·
// Polite") since the bare term means nothing to someone who hasn't
// studied Japanese grammar; the full explanation is a hover/tap tooltip.
export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  const { t } = useLocale();
  if (!level) return null;
  return (
    <span
      title={formalityDescription(t, level)}
      className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-extrabold tracking-wide text-white ${FORMALITY_COLORS[level]}`}
    >
      {formalityDisplayLabel(t, level)}
    </span>
  );
}

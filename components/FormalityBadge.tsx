import type { FormalityLevel } from "@/types/database";
import { FORMALITY_COLORS } from "@/lib/formality-colors";

// Bold solid tag chips, one vivid hue per register — reads as a badge/
// achievement pill rather than a subtle label, matching the energetic UI.
export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  if (!level) return null;
  return (
    <span
      className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white ${FORMALITY_COLORS[level]}`}
    >
      {level}
    </span>
  );
}

import type { FormalityLevel } from "@/types/database";

// Bold solid tag chips, one vivid hue per register — reads as a badge/
// achievement pill rather than a subtle label, matching the energetic UI.
const STYLES: Record<FormalityLevel, string> = {
  Sonkeigo: "bg-violet-500",
  Kenjougo: "bg-indigo-500",
  Teineigo: "bg-sky-500",
  Casual: "bg-emerald-500",
  Slang: "bg-amber-500",
  Dialect: "bg-rose-500",
};

export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  if (!level) return null;
  return (
    <span
      className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-extrabold uppercase tracking-wide text-white ${STYLES[level]}`}
    >
      {level}
    </span>
  );
}

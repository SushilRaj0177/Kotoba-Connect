import type { FormalityLevel } from "@/types/database";

// Outlined pill chips, one hue per register — same idea as a tag or label
// chip in most social apps, just colored to distinguish six categories.
const STYLES: Record<FormalityLevel, string> = {
  Sonkeigo: "text-violet-300 border-violet-300/40",
  Kenjougo: "text-indigo-300 border-indigo-300/40",
  Teineigo: "text-sky-300 border-sky-300/40",
  Casual: "text-emerald-300 border-emerald-300/40",
  Slang: "text-amber-300 border-amber-300/40",
  Dialect: "text-rose-300 border-rose-300/40",
};

export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  if (!level) return null;
  return (
    <span
      className={`flex-none rounded-full border bg-ink-bg-input px-2.5 py-0.5 text-xs font-semibold ${STYLES[level]}`}
    >
      {level}
    </span>
  );
}

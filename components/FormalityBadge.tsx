import type { FormalityLevel } from "@/types/database";

// Soft filled tag chips, one hue per register — light enough to feel like
// a sticker rather than a status indicator. Each has a light-theme and a
// dark-theme variant so it stays readable (and still soft) either way.
const STYLES: Record<FormalityLevel, string> = {
  Sonkeigo: "bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300",
  Kenjougo: "bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300",
  Teineigo: "bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300",
  Casual: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
  Slang: "bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300",
  Dialect: "bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300",
};

export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  if (!level) return null;
  return (
    <span className={`flex-none rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[level]}`}>
      {level}
    </span>
  );
}

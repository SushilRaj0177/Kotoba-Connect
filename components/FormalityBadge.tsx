import type { FormalityLevel } from "@/types/database";

const STYLES: Record<FormalityLevel, string> = {
  Sonkeigo: "bg-purple-100 text-purple-700",
  Kenjougo: "bg-indigo-100 text-indigo-700",
  Teineigo: "bg-blue-100 text-blue-700",
  Casual: "bg-emerald-100 text-emerald-700",
  Slang: "bg-orange-100 text-orange-700",
  Dialect: "bg-pink-100 text-pink-700",
};

export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  if (!level) return null;
  return (
    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${STYLES[level]}`}>
      {level}
    </span>
  );
}

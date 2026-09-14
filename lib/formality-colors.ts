import type { FormalityLevel } from "@/types/database";

// One vivid hue per register, shared by FormalityBadge and
// FormalitySelect so the same color always means the same register
// everywhere it shows up (badges, the board filter chips, the post form).
export const FORMALITY_COLORS: Record<FormalityLevel, string> = {
  Sonkeigo: "bg-violet-500",
  Kenjougo: "bg-indigo-500",
  Teineigo: "bg-sky-500",
  Casual: "bg-emerald-500",
  Slang: "bg-amber-500",
  Dialect: "bg-rose-500",
};

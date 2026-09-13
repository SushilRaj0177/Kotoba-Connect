import type { FormalityLevel } from "@/types/database";

// Discord-style role-tag chips: dark pill, colored text/border, no filled background.
const STYLES: Record<FormalityLevel, string> = {
  Sonkeigo: "text-[#c9a0f5] border-[#c9a0f5]/40",
  Kenjougo: "text-[#9c84ef] border-[#9c84ef]/40",
  Teineigo: "text-[#00a8fc] border-[#00a8fc]/40",
  Casual: "text-[#23a55a] border-[#23a55a]/40",
  Slang: "text-[#f0b232] border-[#f0b232]/40",
  Dialect: "text-[#eb459e] border-[#eb459e]/40",
};

export default function FormalityBadge({ level }: { level: FormalityLevel | null }) {
  if (!level) return null;
  return (
    <span
      className={`flex-none rounded-full border bg-discord-bg-input px-2.5 py-0.5 text-xs font-semibold ${STYLES[level]}`}
    >
      {level}
    </span>
  );
}

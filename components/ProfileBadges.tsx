"use client";

import { useLocale } from "@/components/i18n/LocaleProvider";

interface BadgeDef {
  key: string;
  emoji: string;
  labelKey: string;
  earned: boolean;
}

// Computed on the fly from stats the profile already has (entries,
// reputation, streak, followers) rather than a separate awarded-badges
// table — nothing to backfill, and thresholds can change without a
// migration. If a persistent/one-off badge (e.g. "founding member") is
// ever needed, that's the point to add a real table.
export default function ProfileBadges({
  entryCount,
  reputation,
  longestStreak,
  followerCount,
}: {
  entryCount: number;
  reputation: number;
  longestStreak: number;
  followerCount: number;
}) {
  const { t } = useLocale();

  const badges: BadgeDef[] = [
    { key: "firstPost", emoji: "📝", labelKey: "badges.firstPost", earned: entryCount >= 1 },
    { key: "prolific", emoji: "📚", labelKey: "badges.prolific", earned: entryCount >= 10 },
    { key: "trusted", emoji: "⭐", labelKey: "badges.trusted", earned: reputation >= 50 },
    { key: "weekStreak", emoji: "🔥", labelKey: "badges.weekStreak", earned: longestStreak >= 7 },
    { key: "monthStreak", emoji: "🏆", labelKey: "badges.monthStreak", earned: longestStreak >= 30 },
    { key: "popular", emoji: "👥", labelKey: "badges.popular", earned: followerCount >= 10 },
  ].filter((b) => b.earned);

  if (badges.length === 0) return null;

  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      {badges.map((b) => (
        <span
          key={b.key}
          title={t(b.labelKey)}
          className="flex items-center gap-1 rounded-full bg-ink-bg-input px-2.5 py-1 text-xs font-medium text-ink-text"
        >
          <span aria-hidden="true">{b.emoji}</span>
          {t(b.labelKey)}
        </span>
      ))}
    </div>
  );
}

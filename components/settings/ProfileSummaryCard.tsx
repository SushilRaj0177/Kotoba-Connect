import Avatar from "@/components/Avatar";
import { getServerTranslator } from "@/lib/i18n/server";
import type { Profile } from "@/types/database";

// The one piece of context that should stay visible no matter which
// settings tab is open — otherwise switching to Appearance or Privacy
// loses track of whose settings you're even looking at.
export default function ProfileSummaryCard({ profile, email }: { profile: Profile; email: string | null }) {
  const { t } = getServerTranslator();
  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mb-5 flex flex-col gap-3 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5">
      <Avatar username={profile.username} avatarUrl={profile.avatar_url} size={48} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold text-ink-text-header">
          {profile.display_name?.trim() || `@${profile.username}`}
        </p>
        <p className="truncate text-sm text-ink-text-muted">{email ?? t("settings.noEmail")}</p>
      </div>
      <div className="flex-none text-xs text-ink-text-muted sm:text-right">
        <p>
          {t("profile.reputation")}: <span className="font-bold text-ink-accent">{profile.reputation_score}</span>
        </p>
        <p className="mt-0.5">
          {t("profile.memberSince")} {joined}
        </p>
      </div>
    </div>
  );
}

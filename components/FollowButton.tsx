"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function FollowButton({
  profileId,
  currentUserId,
  initialFollowing,
  onChange,
}: {
  profileId: string;
  currentUserId: string | null;
  initialFollowing: boolean;
  onChange?: (following: boolean) => void;
}) {
  const { t } = useLocale();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  if (!currentUserId || currentUserId === profileId) return null;

  async function toggle() {
    setPending(true);
    const supabase = createClient();
    const next = !following;

    if (next) {
      await supabase.from("user_follows").insert({ follower_id: currentUserId, following_id: profileId });
    } else {
      await supabase
        .from("user_follows")
        .delete()
        .eq("follower_id", currentUserId)
        .eq("following_id", profileId);
    }

    setFollowing(next);
    onChange?.(next);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition disabled:opacity-60 ${
        following
          ? "bg-ink-bg-input text-ink-text hover:bg-ink-red/10 hover:text-ink-red"
          : "bg-ink-accent text-white hover:opacity-90"
      }`}
    >
      {following ? t("profile.unfollow") : t("profile.follow")}
    </button>
  );
}

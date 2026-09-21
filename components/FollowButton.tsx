"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/Toast";

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
  const { showToast } = useToast();
  const [following, setFollowing] = useState(initialFollowing);
  const [pending, setPending] = useState(false);

  if (!currentUserId || currentUserId === profileId) return null;

  async function toggle() {
    setPending(true);
    const supabase = createClient();
    const next = !following;

    // Previously this discarded the result entirely — a failed insert
    // (RLS rejection, network blip, anything) still flipped the button to
    // "Following" client-side, which then silently reverted on the next
    // real page load once server-rendered data showed the row was never
    // actually written. Only trust the optimistic flip once Supabase
    // confirms the write went through.
    const { error } = next
      ? await supabase.from("user_follows").insert({ follower_id: currentUserId, following_id: profileId })
      : await supabase.from("user_follows").delete().eq("follower_id", currentUserId).eq("following_id", profileId);

    if (error) {
      showToast(t("profile.actionError"), "error");
      setPending(false);
      return;
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

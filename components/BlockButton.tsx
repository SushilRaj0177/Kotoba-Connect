"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useToast } from "@/components/Toast";

export default function BlockButton({
  profileId,
  currentUserId,
  initialBlocked,
}: {
  profileId: string;
  currentUserId: string | null;
  initialBlocked: boolean;
}) {
  const { t } = useLocale();
  const { showToast } = useToast();
  const [blocked, setBlocked] = useState(initialBlocked);
  const [pending, setPending] = useState(false);

  if (!currentUserId || currentUserId === profileId) return null;

  async function toggle() {
    setPending(true);
    const supabase = createClient();
    const next = !blocked;

    const { error } = next
      ? await supabase.from("user_blocks").insert({ blocker_id: currentUserId, blocked_id: profileId })
      : await supabase.from("user_blocks").delete().eq("blocker_id", currentUserId).eq("blocked_id", profileId);

    if (error) {
      showToast(t("profile.actionError"), "error");
      setPending(false);
      return;
    }

    setBlocked(next);
    setPending(false);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={pending}
      className="rounded-full px-2 py-1 text-xs font-semibold text-ink-text-muted transition hover:text-ink-red disabled:opacity-60"
    >
      {blocked ? t("profile.unblock") : t("profile.block")}
    </button>
  );
}

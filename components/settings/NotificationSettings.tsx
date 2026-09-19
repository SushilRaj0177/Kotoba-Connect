"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import PushNotificationRow from "@/components/settings/PushNotificationRow";
import type { NotificationPrefs, Profile } from "@/types/database";

const TYPES: (keyof NotificationPrefs)[] = ["upvote", "annotation", "comment", "follow"];

// Skipped entirely here: 'system' notifications (moderation/account
// messages) — those always fire regardless of this preference, so
// there's deliberately no toggle for them.
function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`relative h-6 w-11 flex-none rounded-full transition active:scale-95 ${
        checked ? "bg-ink-accent" : "bg-ink-bg-input"
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-[22px]" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export default function NotificationSettings({ profile }: { profile: Profile }) {
  const { t } = useLocale();
  // Missing keys default to on, matching the migration's coalesce(...,
  // true) — a profile row created before this feature shipped won't
  // have every key set yet.
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    upvote: profile.notification_prefs?.upvote ?? true,
    annotation: profile.notification_prefs?.annotation ?? true,
    comment: profile.notification_prefs?.comment ?? true,
    follow: profile.notification_prefs?.follow ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle(key: keyof NotificationPrefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    setSaving(true);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ notification_prefs: next })
      .eq("id", profile.id);

    if (updateError) {
      setPrefs(prefs); // roll back
      setError(t("settings.notificationsSaveError"));
    }
    setSaving(false);
  }

  return (
    <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
      <h2 className="font-display text-base font-bold text-ink-text-header">{t("settings.notificationsTitle")}</h2>
      <p className="mt-1 text-sm text-ink-text-muted">{t("settings.notificationsHint")}</p>

      <div className="mt-3 divide-y divide-ink-border/70">
        {TYPES.map((key) => (
          <div key={key} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
            <div className="min-w-0 flex-1 pr-4">
              <p className="text-sm font-semibold text-ink-text">{t(`settings.notificationType.${key}`)}</p>
              <p className="text-xs text-ink-text-muted">{t(`settings.notificationType.${key}Hint`)}</p>
            </div>
            <ToggleSwitch checked={prefs[key]} onChange={() => toggle(key)} />
          </div>
        ))}
      </div>

      {error && <p className="mt-3 text-sm text-ink-red">{error}</p>}
      {saving && <p className="mt-3 text-xs text-ink-text-muted">{t("settings.saving")}</p>}

      <PushNotificationRow />
    </div>
  );
}

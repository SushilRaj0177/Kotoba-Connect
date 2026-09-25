"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import Avatar from "@/components/Avatar";
import AvatarPicker from "@/components/AvatarPicker";

export default function ProfileSettingsForm({ profile }: { profile: Profile }) {
  const { t } = useLocale();
  const router = useRouter();

  const [displayName, setDisplayName] = useState(profile.display_name ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const trimmedUsername = username.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmedUsername)) {
      setError(t("settings.usernameInvalid"));
      setSaving(false);
      return;
    }

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        username: trimmedUsername,
        display_name: displayName.trim() || null,
        avatar_url: avatarUrl,
        bio: bio.trim() || null,
        website: website.trim() || null,
      })
      .eq("id", profile.id);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? t("settings.usernameTaken")
          : errorMessage(updateError, "Couldn't save. Try again.")
      );
    } else {
      setSaved(true);
      router.refresh();
    }
    setSaving(false);
  }

  return (
    <form
      onSubmit={handleSave}
      className="space-y-3 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5"
    >
      <h2 className="font-display text-base font-bold text-ink-text-header">{t("settings.profileTitle")}</h2>

      <div>
        <span className="mb-1.5 block text-xs font-medium text-ink-text-muted">{t("settings.avatarLabel")}</span>
        <div className="flex items-center gap-3">
          <Avatar username={profile.username} avatarUrl={avatarUrl} size={56} />
          <button
            type="button"
            onClick={() => setAvatarPickerOpen((o) => !o)}
            className="rounded-full bg-ink-bg-input px-3.5 py-1.5 text-xs font-semibold text-ink-text transition active:scale-95 hover:bg-ink-bg-hover"
          >
            {avatarPickerOpen ? t("settings.avatarClose") : t("settings.avatarChoose")}
          </button>
        </div>
        {avatarPickerOpen && (
          <div className="mt-3">
            <AvatarPicker value={avatarUrl} onChange={(token) => setAvatarUrl(token)} />
          </div>
        )}
      </div>

      <div>
        <label htmlFor="displayName" className="mb-1 block text-xs font-medium text-ink-text-muted">
          {t("settings.displayNameLabel")}
        </label>
        <input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={50}
          placeholder={profile.username}
          className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
        <p className="mt-1 text-xs text-ink-text-muted">{t("settings.displayNameHint")}</p>
      </div>
      <div>
        <label htmlFor="username" className="mb-1 block text-xs font-medium text-ink-text-muted">
          {t("settings.usernameLabel")}
        </label>
        <input
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          maxLength={20}
          className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
        <p className="mt-1 text-xs text-ink-text-muted">{t("settings.usernameHint")}</p>
      </div>
      <div>
        <label htmlFor="bio" className="mb-1 block text-xs font-medium text-ink-text-muted">
          {t("settings.bioLabel")}
        </label>
        <textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          rows={3}
          maxLength={280}
          placeholder={t("settings.bioPlaceholder")}
          className="w-full resize-none rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
      </div>
      <div>
        <label htmlFor="website" className="mb-1 block text-xs font-medium text-ink-text-muted">
          {t("settings.websiteLabel")}
        </label>
        <input
          id="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          maxLength={200}
          placeholder={t("settings.websitePlaceholder")}
          className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
        />
      </div>
      {error && <p className="text-sm text-ink-red">{error}</p>}
      {saved && !error && <p className="text-sm text-ink-green">{t("settings.saved")}</p>}
      <button
        type="submit"
        disabled={saving}
        className="btn-chunky rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-[rgb(var(--c-on-accent))] disabled:opacity-60"
      >
        {saving ? t("settings.saving") : t("settings.save")}
      </button>
    </form>
  );
}

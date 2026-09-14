"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import Avatar from "@/components/Avatar";
import AvatarPicker from "@/components/AvatarPicker";

export default function SettingsForm({ profile, email }: { profile: Profile; email: string | null }) {
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

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const joined = new Date(profile.created_at).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

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

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();
    setPasswordSaved(false);
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError(t("settings.passwordTooShort"));
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError(t("settings.passwordMismatch"));
      return;
    }

    setPasswordSaving(true);
    const supabase = createClient();
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });

    if (pwError) {
      setPasswordError(errorMessage(pwError, "Couldn't change your password. Try again."));
    } else {
      setPasswordSaved(true);
      setNewPassword("");
      setConfirmPassword("");
    }
    setPasswordSaving(false);
  }

  async function handleDelete() {
    if (confirmText !== "DELETE") return;
    setDeleting(true);
    setDeleteError(null);

    const res = await fetch("/api/account/delete", { method: "POST" });
    const data = await res.json();

    if (!res.ok) {
      setDeleteError(data.error ?? "Couldn't delete your account.");
      setDeleting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:flex-row sm:items-center sm:gap-4 sm:p-5">
        <Avatar username={profile.username} avatarUrl={avatarUrl} size={48} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold text-ink-text-header">
            {displayName.trim() || `@${profile.username}`}
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
              className="rounded-full bg-ink-bg-input px-3.5 py-1.5 text-xs font-semibold text-ink-text transition hover:bg-ink-bg-hover"
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
          className="btn-chunky rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {saving ? t("settings.saving") : t("settings.save")}
        </button>
      </form>

      <form
        onSubmit={handlePasswordChange}
        className="space-y-3 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5"
      >
        <h2 className="font-display text-base font-bold text-ink-text-header">{t("settings.passwordTitle")}</h2>
        <div>
          <label htmlFor="newPassword" className="mb-1 block text-xs font-medium text-ink-text-muted">
            {t("settings.newPasswordLabel")}
          </label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="mb-1 block text-xs font-medium text-ink-text-muted">
            {t("settings.confirmPasswordLabel")}
          </label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
            className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
          />
        </div>
        {passwordError && <p className="text-sm text-ink-red">{passwordError}</p>}
        {passwordSaved && !passwordError && <p className="text-sm text-ink-green">{t("settings.passwordSaved")}</p>}
        <button
          type="submit"
          disabled={passwordSaving || !newPassword}
          className="rounded-2xl bg-ink-bg-input px-6 py-3 text-sm font-bold text-ink-text transition hover:bg-ink-bg-hover disabled:opacity-60"
        >
          {passwordSaving ? t("settings.saving") : t("settings.changePassword")}
        </button>
      </form>

      <div className="rounded-2xl border border-ink-red/40 bg-ink-red/5 p-4 sm:p-5">
        <h2 className="mb-1 text-sm font-semibold text-ink-red">{t("settings.dangerZone")}</h2>
        <p className="mb-3 text-sm text-ink-text-muted">{t("settings.deleteAccountBody")}</p>

        {!confirmOpen ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-full bg-ink-red px-4 py-2 text-sm font-semibold text-white hover:bg-ink-red-hover"
          >
            {t("settings.deleteAccount")}
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-ink-text">{t("settings.deleteConfirm")}</p>
            <input
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={t("settings.deleteInputPlaceholder")}
              className="w-full max-w-xs rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-red"
            />
            {deleteError && <p className="text-sm text-ink-red">{deleteError}</p>}
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={confirmText !== "DELETE" || deleting}
                className="rounded-full bg-ink-red px-4 py-2 text-sm font-semibold text-white hover:bg-ink-red-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? t("settings.deleting") : t("settings.deleteButton")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
                className="rounded-full px-4 py-2 text-sm text-ink-text-muted hover:bg-ink-bg-hover"
              >
                {t("card.cancel")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

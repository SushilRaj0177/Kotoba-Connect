"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";

// Password change and account deletion grouped together as "Account" —
// both are account-security/lifecycle actions, distinct from the profile
// fields people tweak often (display name, bio, etc.) and from
// appearance/privacy preferences.
export default function AccountSettings({ email }: { email: string | null }) {
  const { t } = useLocale();
  const router = useRouter();

  // The form itself starts collapsed behind a "Change password" prompt
  // rather than three open fields sitting there by default — the fields
  // (especially "current password") only make sense once someone's
  // actually decided to change it.
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  function closePasswordForm() {
    setPasswordFormOpen(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
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

    // Supabase's updateUser() trusts the existing session and doesn't
    // itself ask for the current password, so it's verified here first
    // via a real sign-in attempt — the standard way to confirm a
    // password without a dedicated "verify password" endpoint.
    if (email) {
      const { error: reauthError } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword,
      });
      if (reauthError) {
        setPasswordError(t("settings.currentPasswordIncorrect"));
        setPasswordSaving(false);
        return;
      }
    }

    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });

    if (pwError) {
      setPasswordError(errorMessage(pwError, "Couldn't change your password. Try again."));
      setPasswordSaving(false);
    } else {
      setPasswordSaved(true);
      setPasswordSaving(false);
      closePasswordForm();
    }
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
      <div className="rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5">
        <h2 className="font-display text-base font-bold text-ink-text-header">{t("settings.passwordTitle")}</h2>

        {!passwordFormOpen ? (
          <>
            <p className="mt-1 text-sm text-ink-text-muted">{t("settings.passwordHint")}</p>
            {passwordSaved && <p className="mt-2 text-sm text-ink-green">{t("settings.passwordSaved")}</p>}
            <button
              type="button"
              onClick={() => {
                setPasswordSaved(false);
                setPasswordFormOpen(true);
              }}
              className="mt-3 rounded-full bg-ink-bg-input px-4 py-2 text-sm font-semibold text-ink-text transition active:scale-95 hover:bg-ink-bg-hover"
            >
              {t("settings.changePassword")}
            </button>
          </>
        ) : (
          <form onSubmit={handlePasswordChange} className="mt-3 space-y-3">
            <div>
              <label htmlFor="currentPassword" className="mb-1 block text-xs font-medium text-ink-text-muted">
                {t("settings.currentPasswordLabel")}
              </label>
              <input
                id="currentPassword"
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
              />
            </div>
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
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={passwordSaving || !currentPassword || !newPassword}
                className="rounded-full bg-ink-accent px-4 py-2 text-sm font-bold text-[rgb(var(--c-on-accent))] transition active:scale-95 disabled:opacity-60"
              >
                {passwordSaving ? t("settings.saving") : t("settings.changePassword")}
              </button>
              <button
                type="button"
                onClick={closePasswordForm}
                className="rounded-full px-4 py-2 text-sm text-ink-text-muted transition active:scale-95 hover:bg-ink-bg-hover"
              >
                {t("card.cancel")}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="rounded-2xl border border-ink-red/40 bg-ink-red/5 p-4 sm:p-5">
        <h2 className="mb-1 text-sm font-semibold text-ink-red">{t("settings.dangerZone")}</h2>
        <p className="mb-3 text-sm text-ink-text-muted">{t("settings.deleteAccountBody")}</p>

        {!confirmOpen ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="rounded-full bg-ink-red px-4 py-2 text-sm font-semibold text-white transition active:scale-95 hover:bg-ink-red-hover"
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
                className="rounded-full bg-ink-red px-4 py-2 text-sm font-semibold text-white transition active:scale-95 hover:bg-ink-red-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deleting ? t("settings.deleting") : t("settings.deleteButton")}
              </button>
              <button
                type="button"
                onClick={() => {
                  setConfirmOpen(false);
                  setConfirmText("");
                }}
                className="rounded-full px-4 py-2 text-sm text-ink-text-muted transition active:scale-95 hover:bg-ink-bg-hover"
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

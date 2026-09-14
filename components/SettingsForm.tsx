"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/database";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";

export default function SettingsForm({ profile }: { profile: Profile }) {
  const { t } = useLocale();
  const router = useRouter();
  const [bio, setBio] = useState(profile.bio ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);

    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ bio: bio.trim() || null, website: website.trim() || null })
      .eq("id", profile.id);

    if (updateError) {
      setError(errorMessage(updateError, "Couldn't save. Try again."));
    } else {
      setSaved(true);
    }
    setSaving(false);
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
    <div className="space-y-6">
      <form
        onSubmit={handleSave}
        className="space-y-3 rounded-2xl bg-ink-bg-secondary p-4 border border-ink-border/70 shadow-sm sm:p-5"
      >
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

      <div className="rounded-2xl border-2 border-ink-red/40 bg-ink-red/5 p-4 sm:p-5">
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

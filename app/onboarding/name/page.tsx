"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useClientAuth } from "@/components/auth/ClientAuthProvider";
import Mascot from "@/components/Mascot";
import Avatar from "@/components/Avatar";
import AvatarPicker from "@/components/AvatarPicker";
import { avatarPresetToken } from "@/lib/avatar-presets";

// A brand-new profile already gets a random preset avatar from the DB
// trigger (handle_new_user, see 0017_default_avatar.sql) rather than
// landing here with a null avatar_url — this step is about giving the
// person a chance to swap that random pick for one they actually like,
// not about avoiding the old colored-initial fallback (that fallback
// should now never be the first thing a real user sees).
export default function OnboardingNamePage() {
  const { t } = useLocale();
  const { userId } = useClientAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    const supabase = createClient();
    supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        // Fallback only matters for an account created before the random-
        // avatar trigger existed; every new signup already has one.
        setAvatarUrl(data?.avatar_url ?? avatarPresetToken(0, 0));
      });
  }, [userId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = displayName.trim();
    if (!trimmed) {
      setError(t("onboarding.required"));
      return;
    }
    if (!userId) return;

    setSaving(true);
    setError(null);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ display_name: trimmed, avatar_url: avatarUrl })
      .eq("id", userId);

    if (updateError) {
      setError(t("onboarding.error"));
      setSaving(false);
      return;
    }

    router.replace("/");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-ink-bg-secondary border border-ink-border/70 shadow-sm">
        <div className="bg-seigaiha px-8 pb-7 pt-8 text-center">
          <Mascot size={56} mood="excited" className="mx-auto" />
          <h1 className="mt-2 font-display text-xl font-bold text-ink-text-header">{t("onboarding.title")}</h1>
          <p className="mt-1 text-sm text-ink-text-muted">{t("onboarding.subtitle")}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 px-8 pb-8">
          <div>
            <p className="mb-1 block text-xs font-semibold uppercase text-ink-text-muted">
              {t("onboarding.avatarLabel")}
            </p>
            <div className="flex items-center gap-3">
              <Avatar username={displayName || "you"} avatarUrl={avatarUrl} size={56} />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-text-muted">{t("onboarding.avatarHint")}</p>
                <button
                  type="button"
                  onClick={() => setShowPicker((v) => !v)}
                  className="mt-1 text-xs font-semibold text-ink-text-link hover:underline"
                >
                  {showPicker ? t("settings.avatarClose") : t("settings.avatarChoose")}
                </button>
              </div>
            </div>
            {showPicker && (
              <div className="mt-3">
                <AvatarPicker value={avatarUrl} onChange={setAvatarUrl} />
              </div>
            )}
          </div>
          <div>
            <label htmlFor="onboardingDisplayName" className="mb-1 block text-xs font-semibold uppercase text-ink-text-muted">
              {t("login.displayName")}
            </label>
            <input
              id="onboardingDisplayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoFocus
              required
              maxLength={50}
              placeholder="Sushil"
              className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
            />
          </div>
          {error && <p className="text-sm text-ink-red">{error}</p>}
          <button
            type="submit"
            disabled={saving}
            className="btn-chunky w-full rounded-2xl bg-ink-accent px-3 py-3 text-sm font-bold text-[rgb(var(--c-on-accent))] disabled:opacity-60"
          >
            {saving ? t("login.pleaseWait") : t("onboarding.submit")}
          </button>
        </form>
      </div>
    </main>
  );
}

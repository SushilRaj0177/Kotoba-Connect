"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import { useClientAuth } from "@/components/auth/ClientAuthProvider";
import Mascot from "@/components/Mascot";

export default function OnboardingNamePage() {
  const { t } = useLocale();
  const { userId } = useClientAuth();
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      .update({ display_name: trimmed })
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
            className="btn-chunky w-full rounded-2xl bg-ink-accent px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? t("login.pleaseWait") : t("onboarding.submit")}
          </button>
        </form>
      </div>
    </main>
  );
}

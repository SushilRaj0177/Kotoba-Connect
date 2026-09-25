"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/errors";
import { useLocale } from "@/components/i18n/LocaleProvider";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Mascot from "@/components/Mascot";

// Landed on after clicking the link from requestPasswordReset — by the
// time this renders, app/auth/callback already exchanged the recovery
// code for a real (if short-lived) session, so this just needs to call
// updateUser with the new password.
export default function ResetPasswordPage() {
  const { t } = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("settings.passwordTooShort"));
      return;
    }
    if (password !== confirm) {
      setError(t("settings.passwordMismatch"));
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setError(errorMessage(updateError, "Couldn't reset your password. The link may have expired."));
      setSaving(false);
      return;
    }

    setDone(true);
    setSaving(false);
    setTimeout(() => router.push("/"), 1500);
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-4 flex w-full max-w-sm items-center justify-end gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-ink-bg-secondary border border-ink-border/70 shadow-sm">
        <div className="bg-seigaiha px-8 pb-7 pt-8 text-center">
          <Mascot size={56} mood={done ? "excited" : "happy"} className="mx-auto mb-2" />
          <h1 className="font-display text-xl font-bold text-ink-text-header">{t("login.resetPasswordTitle")}</h1>
        </div>
        <div className="px-8 pb-8">
          {done ? (
            <p className="pt-6 text-center text-sm text-ink-green">{t("settings.passwordSaved")}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-6">
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase text-ink-text-muted">
                  {t("settings.newPasswordLabel")}
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
                />
              </div>
              <div>
                <label htmlFor="confirm" className="mb-1 block text-xs font-semibold uppercase text-ink-text-muted">
                  {t("settings.confirmPasswordLabel")}
                </label>
                <input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text focus:outline-none focus:ring-2 focus:ring-ink-accent"
                />
              </div>
              {error && <p className="rounded-md bg-ink-red/10 px-3 py-2 text-sm text-ink-red">{error}</p>}
              <button
                type="submit"
                disabled={saving || !password}
                className="btn-chunky w-full rounded-2xl bg-ink-accent px-3 py-3 text-sm font-bold text-[rgb(var(--c-on-accent))] disabled:opacity-60"
              >
                {saving ? t("settings.saving") : t("settings.changePassword")}
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

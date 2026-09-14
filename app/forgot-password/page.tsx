"use client";

import { useFormState, useFormStatus } from "react-dom";
import { requestPasswordReset, type AuthState } from "@/app/auth/actions";
import { useLocale } from "@/components/i18n/LocaleProvider";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Mascot from "@/components/Mascot";

const initialState: AuthState = { error: null };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="btn-chunky w-full rounded-2xl bg-ink-accent px-3 py-3 text-sm font-bold text-white disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export default function ForgotPasswordPage() {
  const { t } = useLocale();
  const [state, formAction] = useFormState(requestPasswordReset, initialState);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-4 flex w-full max-w-sm items-center justify-end gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-ink-bg-secondary border border-ink-border/70 shadow-sm">
        <div className="bg-seigaiha px-8 pb-7 pt-8 text-center">
          <Mascot size={56} mood={state.pendingConfirmation ? "happy" : "sleepy"} className="mx-auto mb-2" />
          <h1 className="font-display text-xl font-bold text-ink-text-header">{t("login.forgotPasswordTitle")}</h1>
          <p className="mt-1 text-sm text-ink-text-muted">{t("login.forgotPasswordSubtitle")}</p>
        </div>
        <div className="px-8 pb-8">
          {state.pendingConfirmation ? (
            <div className="pt-6 text-center text-sm text-ink-text-muted">
              {t("login.resetSentBody")} <span className="font-medium text-ink-text">{state.email}</span>.
            </div>
          ) : (
            <form action={formAction} className="space-y-4 pt-6">
              <div>
                <label htmlFor="email" className="mb-1 block text-xs font-semibold uppercase text-ink-text-muted">
                  {t("login.email")}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
                />
              </div>
              {state.error && (
                <p className="rounded-md bg-ink-red/10 px-3 py-2 text-sm text-ink-red">{state.error}</p>
              )}
              <SubmitButton label={t("login.sendResetLink")} pendingLabel={t("login.pleaseWait")} />
            </form>
          )}
          <a href="/login" className="mt-4 block text-center text-sm text-ink-text-link hover:underline">
            {t("login.backToSignIn")}
          </a>
        </div>
      </div>
    </main>
  );
}

"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, resendConfirmation, type AuthState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";
import { useLocale } from "@/components/i18n/LocaleProvider";
import LanguageToggle from "@/components/i18n/LanguageToggle";
import ThemeToggle from "@/components/theme/ThemeToggle";

const initialState: AuthState = { error: null };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-ink-accent px-3 py-2.5 text-sm font-semibold text-white transition hover:bg-ink-accent-hover disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function GoogleButton() {
  const { t } = useLocale();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2 rounded-lg bg-ink-bg-input px-3 py-2.5 text-sm font-semibold text-ink-text transition hover:bg-ink-bg-hover disabled:opacity-60"
    >
      <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.7 0-14.3 4.4-17.7 10.7z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 35.1 26.9 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39.5 16.2 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4 5.6l6.6 5.6C41.4 36 44 30.5 44 24c0-1.3-.1-2.7-.4-3.5z"
        />
      </svg>
      {t("login.google")}
    </button>
  );
}

function ConfirmationPending({ email }: { email: string }) {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    setStatus("sending");
    const res = await resendConfirmation(email);
    setStatus(res.error ? "error" : "sent");
  }

  return (
    <div className="text-center">
      <p className="font-jp text-3xl">📬</p>
      <h2 className="mt-3 text-lg font-bold text-ink-text-header">{t("login.confirmTitle")}</h2>
      <p className="mt-2 text-sm text-ink-text-muted">
        {t("login.confirmBody")} <span className="font-medium text-ink-text">{email}</span>.{" "}
        {t("login.confirmBody2")}
      </p>
      <button
        type="button"
        onClick={handleResend}
        disabled={status === "sending"}
        className="mt-4 text-sm font-semibold text-ink-text-link hover:underline disabled:opacity-60"
      >
        {status === "sending"
          ? t("login.resendSending")
          : status === "sent"
            ? t("login.resendSent")
            : t("login.resend")}
      </button>
      {status === "error" && <p className="mt-2 text-sm text-ink-red">{t("login.resendError")}</p>}
    </div>
  );
}

export default function LoginPage() {
  const { t } = useLocale();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const action = mode === "signIn" ? signIn : signUp;
  const [state, formAction] = useFormState(action, initialState);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="mb-4 flex w-full max-w-sm items-center justify-end gap-2">
        <ThemeToggle />
        <LanguageToggle />
      </div>

      <div className="w-full max-w-sm rounded-2xl bg-ink-bg-secondary p-8 shadow-cozy">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-ink-accent font-jp text-xl font-bold text-white">
            言
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink-text-header">
            {t("app.name")}
          </h1>
          <p className="mt-1 text-sm text-ink-text-muted">{t("login.title")}</p>
        </div>

        {state.pendingConfirmation && state.email ? (
          <ConfirmationPending email={state.email} />
        ) : (
          <>
            <div className="mb-5 flex rounded-full bg-ink-bg-input p-1 text-sm font-medium">
              <button
                type="button"
                onClick={() => setMode("signIn")}
                className={`flex-1 rounded-full py-2 transition ${
                  mode === "signIn"
                    ? "bg-ink-accent text-white"
                    : "text-ink-text-muted hover:text-ink-text"
                }`}
              >
                {t("login.tabSignIn")}
              </button>
              <button
                type="button"
                onClick={() => setMode("signUp")}
                className={`flex-1 rounded-full py-2 transition ${
                  mode === "signUp"
                    ? "bg-ink-accent text-white"
                    : "text-ink-text-muted hover:text-ink-text"
                }`}
              >
                {t("login.tabSignUp")}
              </button>
            </div>

            <GoogleButton />

            <div className="my-4 flex items-center gap-3 text-xs text-ink-text-muted">
              <div className="h-px flex-1 bg-ink-border" />
              {t("login.or")}
              <div className="h-px flex-1 bg-ink-border" />
            </div>

            <form action={formAction} className="space-y-4" key={mode}>
              {mode === "signUp" && (
                <div>
                  <label htmlFor="username" className="mb-1 block text-xs font-semibold uppercase text-ink-text-muted">
                    {t("login.username")}
                  </label>
                  <input
                    id="username"
                    name="username"
                    required
                    minLength={3}
                    maxLength={20}
                    placeholder="tokyo_nuance"
                    className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
                  />
                </div>
              )}
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
              <div>
                <label htmlFor="password" className="mb-1 block text-xs font-semibold uppercase text-ink-text-muted">
                  {t("login.password")}
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="w-full rounded-lg border-none bg-ink-bg-input px-3 py-2 text-sm text-ink-text placeholder:text-ink-text-muted focus:outline-none focus:ring-2 focus:ring-ink-accent"
                />
              </div>

              {state.error && (
                <p className="rounded-md bg-ink-red/10 px-3 py-2 text-sm text-ink-red">
                  {state.error}
                </p>
              )}

              <SubmitButton
                label={mode === "signIn" ? t("login.submitSignIn") : t("login.submitSignUp")}
                pendingLabel={t("login.pleaseWait")}
              />

              {mode === "signUp" && (
                <p className="text-center text-xs text-ink-text-muted">
                  {t("login.agreePrefix")}{" "}
                  <a href="/terms" className="text-ink-text-link underline hover:text-ink-text">
                    {t("footer.terms")}
                  </a>{" "}
                  {t("login.agreeAnd")}{" "}
                  <a href="/privacy" className="text-ink-text-link underline hover:text-ink-text">
                    {t("footer.privacy")}
                  </a>
                  .
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </main>
  );
}

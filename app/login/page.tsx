"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, resendConfirmation, type AuthState } from "@/app/auth/actions";
import { createClient } from "@/lib/supabase/client";

const initialState: AuthState = { error: null };

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-accent px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

function GoogleButton() {
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
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-ink transition hover:bg-slate-50 disabled:opacity-60"
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
      Continue with Google
    </button>
  );
}

function ConfirmationPending({ email }: { email: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function handleResend() {
    setStatus("sending");
    const res = await resendConfirmation(email);
    setStatus(res.error ? "error" : "sent");
  }

  return (
    <div className="text-center">
      <p className="font-jp text-3xl">📬</p>
      <h2 className="mt-3 text-lg font-bold text-ink">Check your inbox</h2>
      <p className="mt-2 text-sm text-slate-muted">
        We sent a confirmation link to <span className="font-medium text-ink">{email}</span>.
        Click it to activate your account.
      </p>
      <button
        type="button"
        onClick={handleResend}
        disabled={status === "sending"}
        className="mt-4 text-sm font-semibold text-accent hover:underline disabled:opacity-60"
      >
        {status === "sending"
          ? "Sending…"
          : status === "sent"
            ? "Sent — check your inbox again"
            : "Resend confirmation email"}
      </button>
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">Couldn't resend. Try again shortly.</p>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");
  const action = mode === "signIn" ? signIn : signUp;
  const [state, formAction] = useFormState(action, initialState);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="font-jp text-3xl font-bold text-ink">言葉 Kotoba Engine</h1>
        <p className="mt-2 text-sm text-slate-muted">
          Sign in to annotate real Japanese pragmatics.
        </p>
      </div>

      {state.pendingConfirmation && state.email ? (
        <ConfirmationPending email={state.email} />
      ) : (
        <>
          <div className="mb-6 flex rounded-lg bg-slate-100 p-1 text-sm font-medium">
            <button
              type="button"
              onClick={() => setMode("signIn")}
              className={`flex-1 rounded-md py-2 transition ${
                mode === "signIn" ? "bg-white shadow text-ink" : "text-slate-muted"
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode("signUp")}
              className={`flex-1 rounded-md py-2 transition ${
                mode === "signUp" ? "bg-white shadow text-ink" : "text-slate-muted"
              }`}
            >
              Create account
            </button>
          </div>

          <GoogleButton />

          <div className="my-4 flex items-center gap-3 text-xs text-slate-muted">
            <div className="h-px flex-1 bg-slate-200" />
            or
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <form action={formAction} className="space-y-4" key={mode}>
            {mode === "signUp" && (
              <div>
                <label htmlFor="username" className="mb-1 block text-sm font-medium text-ink">
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  required
                  minLength={3}
                  maxLength={20}
                  placeholder="tokyo_nuance"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>
            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-ink">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {state.error && (
              <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
            )}

            <SubmitButton
              label={mode === "signIn" ? "Sign in" : "Create account"}
              pendingLabel="Please wait…"
            />

            {mode === "signUp" && (
              <p className="text-center text-xs text-slate-muted">
                By creating an account you agree to the{" "}
                <a href="/terms" className="underline hover:text-ink">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline hover:text-ink">
                  Privacy Policy
                </a>
                .
              </p>
            )}
          </form>
        </>
      )}
    </main>
  );
}

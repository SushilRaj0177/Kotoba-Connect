"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { signIn, signUp, type AuthState } from "@/app/auth/actions";

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
      </form>
    </main>
  );
}

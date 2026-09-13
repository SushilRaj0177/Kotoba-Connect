"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
          <p className="font-jp text-3xl">言葉</p>
          <h1 className="mt-3 text-lg font-bold text-ink">Something went wrong</h1>
          <p className="mt-1 text-sm text-slate-muted">
            The error's been reported. Try reloading the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="mt-4 rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

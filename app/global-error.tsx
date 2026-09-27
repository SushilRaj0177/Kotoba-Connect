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
        <main className="flex min-h-screen flex-col items-center justify-center bg-ink-bg px-6 text-center">
          <p className="font-jp text-3xl text-ink-text-header">言葉</p>
          <h1 className="mt-3 text-lg font-bold text-ink-text-header">Something went wrong</h1>
          <p className="mt-1 text-sm text-ink-text-muted">
            The error&apos;s been reported. Try reloading the page.
          </p>
          <button
            type="button"
            onClick={reset}
            className="btn-chunky mt-4 rounded-xl bg-ink-accent px-4 py-2 text-sm font-bold text-[rgb(var(--c-on-accent))]"
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}

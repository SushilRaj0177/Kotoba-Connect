"use client";

import * as Sentry from "@sentry/nextjs";
import Link from "next/link";
import { useEffect } from "react";
import { Obake } from "@/components/mascots/candidates";

// Route-segment error boundary — catches a crash in any one page and
// swaps out just that page's content, unlike global-error.tsx (which
// only fires when the root layout itself throws, and replaces the
// entire document including the nav). Kept deliberately self-contained
// rather than rendering Navbar/Footer: those are async Server
// Components, and this file must be a Client Component to use React's
// error-boundary hooks, so it can't import them.
export default function Error({
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
    <main className="flex min-h-[70vh] flex-col items-center justify-center px-6 text-center">
      <Obake size={96} />
      <h2 className="mt-5 font-display text-2xl font-bold text-ink-text-header">Something went wrong</h2>
      <p className="mt-2 max-w-sm text-sm text-ink-text-muted">
        The error&apos;s been reported. Try again, or head back to the board.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="btn-chunky rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-[rgb(var(--c-on-accent))]"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-2xl border border-ink-border px-6 py-3 text-sm font-bold text-ink-text transition hover:bg-ink-bg-hover"
        >
          Back to the board
        </Link>
      </div>
    </main>
  );
}

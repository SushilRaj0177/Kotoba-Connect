import * as Sentry from "@sentry/nextjs";

// Server-side error monitoring only activates with a real DSN, so local dev
// and forks without a Sentry project keep working unmonitored. Client-side
// tracking can be added later by running `npx @sentry/wizard@latest` once
// there's a real project (it also wires source map upload via
// SENTRY_AUTH_TOKEN, which isn't configured here).
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 0.1,
    environment: process.env.VERCEL_ENV || process.env.NODE_ENV,
  });
}

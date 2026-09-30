const { withSentryConfig } = require("@sentry/nextjs/config");

// Baseline security headers on every response. No Content-Security-Policy
// on purpose: a CSP strict enough to matter needs nonces threaded through
// Next's inline scripts plus an allowlist for Supabase REST/realtime
// websockets, and getting either wrong silently breaks auth or live
// updates in production — not worth it without a way to test it live.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing legitimately embeds this app in an iframe; blocks clickjacking.
  { key: "X-Frame-Options", value: "DENY" },
  // camera/microphone left at the browser default: the photo-to-text
  // flow uses a file input, and speech is output-only, but restricting
  // them isn't worth breaking a future feature over.
  { key: "Permissions-Policy", value: "geolocation=(), payment=(), usb=(), interest-cohort=()" },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  experimental: {
    instrumentationHook: true,
    // kuromoji resolves its dictionary path at runtime via
    // path.join(process.cwd(), "node_modules", "kuromoji", "dict"), which
    // Next.js's static file tracer can't follow — without this, the .dat.gz
    // dictionary files get left out of the Vercel serverless bundle and
    // tokenization fails in production (but works locally, where the dict
    // is just sitting on disk).
    outputFileTracingIncludes: {
      "/api/tokenize": ["./node_modules/kuromoji/dict/**/*"],
      "/api/admin/bot/seed": ["./node_modules/kuromoji/dict/**/*"],
    },
  },
};

// withSentryConfig no-ops safely without SENTRY_ORG/SENTRY_PROJECT (source
// map upload just gets skipped); it's still applied unconditionally so
// runtime error capture in sentry.server.config.ts works once SENTRY_DSN is set.
module.exports = withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sourcemaps: { disable: !process.env.SENTRY_AUTH_TOKEN },
});

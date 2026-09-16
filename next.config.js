const { withSentryConfig } = require("@sentry/nextjs/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
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

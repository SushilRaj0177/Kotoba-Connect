const { withSentryConfig } = require("@sentry/nextjs/config");

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    instrumentationHook: true,
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

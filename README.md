# 言葉 Kotoba Engine — Kotoba Connect

A community board for annotating the **pragmatic, high-context meaning** behind real
Japanese text — the politeness registers, implicit social cues, and slang that dictionary
apps miss. Users post real Japanese sentences, the app tokenizes them into morphological
components on the server, and the community pins nuance notes to individual word tokens in
real time — plus general comment threads, following, streaks, badges, and a leaderboard on
top of that.

Live at: https://kotoba-connect-three.vercel.app

## Stack

- **Next.js 14** (App Router, React Server Components)
- **Supabase** — Postgres, Auth, Realtime, pgvector, Row Level Security
- **Kuromoji.js** — server-side Japanese morphological tokenizer (POS, lemma, furigana reading)
- **Tailwind CSS**
- **next/og** — dynamically generated Open Graph share images (per-entry and site-wide)
- Optional: **Groq** (automatic Keigo/nuance classification + the in-app mascot chat bot),
  **OpenAI embeddings** (semantic search), **Upstash Redis** (rate limiting), **Sentry**
  (error monitoring)

## Features

**Core board**
- Post a Japanese sentence + translation + formality register + tags — tokenized server-side
  via Kuromoji before saving
- Live collaborative board: new posts, upvotes, comments, and annotations sync to every open
  tab via Supabase Realtime, no refresh needed
- Sort (New / Popular) and filter by formality register (Sonkeigo, Kenjougo, Teineigo, Casual,
  Slang, Dialect), plus semantic search by meaning
- Atomic upvoting via a Postgres RPC (`toggle_entry_upvote`) backed by a unique
  `(user_id, entry_id)` ledger — prevents duplicate votes under concurrency
- Token-level annotation canvas: click any word in a sentence to pin cultural-nuance notes to
  that exact token index, plus general (non-token-pinned) comment threads on every entry
- Bookmarks, a reputation leaderboard, and browsing entries by tag

**Community & profile**
- Follow other users, block/mute users you'd rather not see (client-side filtered, private to
  the blocker), and a notification inbox (upvotes, annotations, comments, follows, admin/system
  messages)
- Daily posting streaks (🔥, gamed-proof — recomputed from each entry's own timestamp) and
  achievement badges computed from a profile's stats
- Editable display name (shown instead of your `@handle` app-wide once set) and 40 preset
  avatar icons across 4 themed sets — no image upload/storage needed
- Password reset flow, account deletion, EN/JP language toggle (cookie-backed, hand-translated
  — not machine translation, see `lib/i18n/`), light/dark theme toggle

**Identity & polish**
- Two hand-drawn SVG mascots (Kokeshi doll + Obake ghost) with equal billing across the app,
  both track the cursor with subtle eye movement; a custom cozy cursor (rounded arrow, bigger
  than system default); a floating mascot chat widget that can answer questions about the app
  and Japanese formality (Groq-backed, feature-flagged, cannot take actions on your behalf)
- Warm "matcha" design system (rice-paper cream light theme, near-neutral dark theme with
  matcha-green accents) — CSS-variable driven, see `app/globals.css` + `tailwind.config.ts`
- Responsive app shell: fixed icon rail on desktop/tablet, bottom tab bar on mobile, with a
  +20% layout zoom on desktop/tablet only (scoped out of mobile, where CSS `zoom` would shrink
  the effective viewport)
- SEO: per-page metadata, dynamically generated Open Graph/Twitter share images (the actual
  Japanese sentence renders in the image, via a request-time-subsetted Noto Sans JP font),
  `robots.txt`, `sitemap.xml`, PWA manifest, custom 404, generated favicon

**Production hardening**
- Email/password auth + Google OAuth (Supabase Auth), with an auto-created `profiles` row per
  user and a proper email-confirmation flow (pending screen + resend)
- Report button on every entry/annotation/comment, an admin moderation queue at `/admin`
  (dismiss or delete-and-resolve), and an `is_admin` flag on profiles
- Database-level rate limits (Postgres triggers) on entries, annotations, and reports — enforced
  regardless of which client talks to Supabase; an optional Upstash-backed limiter in front of
  `/api/tokenize` and the AI endpoints
- Row Level Security on every table — reads are public, writes require the authenticated owner
  (or an admin, for moderation deletes); blocks are private to the blocker
- Middleware forwards the already-validated user id from its own `auth.getUser()` call to the
  page render via a request header, so Server Components can read the session locally instead
  of re-validating with a second network round-trip on every navigation
- Error monitoring via Sentry (server-side), gated entirely on `SENTRY_DSN`
- Terms of Service and Privacy Policy pages

**Phase 2 (feature-flagged — the app runs fine without these keys)**
- Automatic pragmatic analysis: after posting, a Groq LLM call classifies the formality register
  and writes a short nuance summary onto the entry (`/api/entries/[id]/analyze`)
- Semantic search: entries get an OpenAI embedding on creation
  (`/api/entries/[id]/embed`); the search bar on the board calls `/api/search`, which embeds the
  query and matches via the `match_entries` pgvector RPC
- Mascot chat bot (`/api/bot/chat`), Groq-backed

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then open the SQL
   Editor and run, in order:
   1. [`supabase/schema.sql`](./supabase/schema.sql) — base tables, RLS, upvote RPC
   2. Every file in [`supabase/migrations/`](./supabase/migrations), in filename order —
      moderation/admin, DB rate limits, AI columns, pgvector search, platform features
      (bookmarks/notifications), the mascot bot, comments, follows, blocks, streaks, and
      profile customization (display names/avatars)

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   At minimum, fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
   Project Settings → API. Everything else in `.env.example` is optional — see below.

4. **Make yourself an admin** (optional, to see `/admin`): in the SQL editor,

   ```sql
   update public.profiles set is_admin = true where id = '<your-user-uuid>';
   ```

5. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), create an account, and post a
   sentence — try `お先に失礼します` or `マジ卍`.

### Enabling optional features

| Feature | Env var(s) | Where to get it |
|---|---|---|
| Google sign-in | *(none — configured in Supabase)* | Supabase Dashboard → Authentication → Providers → enable Google, add your OAuth client ID/secret, and set the redirect URL to `https://<your-domain>/auth/callback` |
| Rate limiting | `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` | [upstash.com](https://upstash.com) (free tier) |
| Error monitoring | `SENTRY_DSN` (+ `SENTRY_ORG`/`SENTRY_PROJECT`/`SENTRY_AUTH_TOKEN` for source maps) | [sentry.io](https://sentry.io) |
| AI nuance classification + mascot chat bot | `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) (free tier) |
| Semantic search | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| Correct Open Graph image URLs in production | `NEXT_PUBLIC_SITE_URL` | your deployed domain, e.g. `https://kotoba-connect-three.vercel.app` |

Each is independently optional — the app degrades gracefully (features just don't activate)
without them.

## Deploying

1. Push this repo to GitHub.
2. Import it into [Vercel](https://vercel.com/new).
3. Add whichever environment variables from `.env.example` you're using, in the Vercel project
   settings.
4. Deploy. Kuromoji's dictionary ships inside `node_modules/kuromoji/dict` and is bundled
   automatically with the Node.js serverless function for `/api/tokenize`.
5. If using Google sign-in, update the Supabase OAuth redirect URL and Google Cloud OAuth
   client's authorized redirect URI to your production domain.

## Security notes

- Entry/annotation/comment/vote/follow/block/report writes go directly from the browser to
  Supabase, protected by Row Level Security — not by a Next.js API route. The spam heuristics in
  `lib/moderation.ts` (link/flood detection) are client-side UX, not a security boundary; real
  defense is RLS + the DB-level rate-limit triggers in
  `supabase/migrations/0002_db_rate_limits.sql` + the report/admin-review flow.
- This app intentionally does **not** filter profanity or slang — annotating rude/informal
  registers is the product. Abuse handling relies on user reports and admin review instead of
  word-list blocking, which would produce false positives against the app's own purpose.
- Blocking is enforced client-side (filtering fetched rows), not via RLS — a blocked user's
  posts/comments are still publicly readable to everyone else; blocking only affects what the
  blocker sees.
- `npm audit` currently flags a Next.js advisory (Image Optimization AVIF RCE) with no patch
  backported to the 14.x line as of this writing — the fix requires Next 16. This app doesn't
  use `next/image` with AVIF, but if that changes, re-evaluate before upgrading.

## Project structure

```
app/
  page.tsx                        Board (server component, fetches session)
  login/, forgot-password/, reset-password/  Auth flow pages
  entries/[id]/page.tsx             Token-annotation + comments detail view
  entries/[id]/opengraph-image.tsx  Per-entry dynamic OG share image
  opengraph-image.tsx               Site-wide dynamic OG share image
  u/[username]/page.tsx             Public profile (follow/block, streak, badges)
  tags/[tag]/page.tsx               Browse entries by tag
  bookmarks/, leaderboard/          Saved entries, reputation ranking
  settings/page.tsx                 Profile/avatar/password/account settings
  admin/page.tsx                    Moderation queue (admin-only)
  terms/, privacy/                  Legal pages
  not-found.tsx, robots.ts, sitemap.ts, manifest.ts, icon.tsx   SEO/PWA
  auth/actions.ts                   Server actions for sign in/up/out/resend/reset
  auth/callback/route.ts            OAuth + email-confirmation redirect handler
  api/tokenize/route.ts             Kuromoji tokenization endpoint (rate-limited)
  api/entries/[id]/analyze/route.ts Groq pragmatic classification (Phase 2)
  api/entries/[id]/embed/route.ts   OpenAI embedding for semantic search (Phase 2)
  api/search/route.ts               Semantic search endpoint (Phase 2)
  api/bot/chat/route.ts             Mascot chat bot (Phase 2)
components/
  EntryBoard.tsx / BoardControls.tsx  Client board: fetch, realtime, sort/filter, search
  EntryForm.tsx                      Create entry with live tokenizer preview + validation
  EntryCard.tsx / EntryDetail.tsx / EntryComments.tsx   List item / annotation canvas / comments
  FollowButton.tsx / BlockButton.tsx / BlockedUsersManager.tsx   Social graph
  ProfileBadges.tsx / Avatar.tsx / AvatarPicker.tsx   Profile customization
  ReportButton.tsx / AdminQueue.tsx  Moderation UI
  NotificationBell.tsx               Notification inbox
  Mascot.tsx / mascots/candidates.tsx / MascotChat.tsx   Mascots + chat bot widget
  SideRail.tsx / MobileNav.tsx / auth/ClientAuthProvider.tsx   App shell + shared client auth state
  AiNuanceCallout.tsx                Displays Groq's pragmatic read on an entry
  TokenizedText.tsx                  Renders Kuromoji tokens as clickable word chips
lib/
  supabase/                         Browser / server / middleware Supabase clients
  tokenizer.ts                      Cached Kuromoji tokenizer builder
  groq.ts / embeddings.ts            Phase 2 AI integrations (feature-flagged)
  rate-limit.ts                      Optional Upstash-backed limiter
  moderation.ts                      Spam heuristics + report reasons
  avatar-presets.ts                  40 preset avatar icons (4 sets)
  og-font.ts / site.ts               OG image font loading + site URL constant
  use-blocked-ids.ts / cursor-tracker.ts / use-mascot-gaze.ts   Small client hooks
  i18n/                              EN/JP dictionary + server/client locale helpers
supabase/
  schema.sql                        Base schema (fresh install)
  migrations/                       Incremental SQL — see list below
types/database.ts                   Shared TypeScript types
```

### Migrations, in order

| File | Adds |
|---|---|
| `0001_moderation.sql` | `report_flags`, `is_admin` |
| `0002_db_rate_limits.sql` | Postgres-trigger rate limits |
| `0003_ai_pragmatics.sql` | Groq nuance/formality columns on entries |
| `0004_vector_search.sql` | pgvector embedding column + `match_entries` RPC |
| `0005_platform_features.sql` | bio/website, bookmarks, notifications, tag index |
| `0006_bot.sql` | System-typed bot notifications, welcome message |
| `0007_comments.sql` | General (non-token-pinned) comment threads |
| `0008_follows.sql` | Following users |
| `0009_blocks.sql` | Blocking/muting users |
| `0010_streaks.sql` | Daily posting streaks |
| `0011_profile_customization.sql` | Display names, preset avatar icons |

## Roadmap

- Full-text fallback search alongside semantic search
- Media embeds in posts
- Onboarding tour for first-time users
- Client-side Sentry tracing (run the Sentry wizard once a real project exists)

### Further AI integration (queued, not yet built)

Now that `GROQ_API_KEY` is configured in production, these are worth building next —
roughly in order of value-to-effort:

- **OCR ingestion pipeline for manga/street-signage photos** — Groq hosts vision models
  (e.g. Llama 4 Scout) that could read Japanese text straight from an uploaded photo, feeding
  it into the existing tokenizer pipeline instead of requiring manual typing
- **Entry-context-aware chat bot** — MascotChat is currently generic; passing the current
  entry's Japanese text + nuance summary as context when a user opens the bot from an entry
  detail page would let it answer "what does this specific sentence really imply" directly
- **AI-suggested tags** — same call pattern as the existing formality classifier
  (`analyzePragmatics` in `lib/groq.ts`), suggesting 2-3 relevant tags from the sentence content
  so posting has less manual busywork
- **AI-assisted translation draft** — offer a suggested English translation as a starting
  point when a user posts Japanese text, which they then edit/confirm rather than write from
  scratch
- **Duplicate/similar-entry nudge at post time** — reuse the OpenAI embeddings already
  generated per entry (`match_entries` RPC) to warn "a similar entry already exists" before
  someone posts a near-duplicate
- **Moderation triage** — have Groq pre-screen reported content for likely severity before it
  reaches the admin queue, so admins see the worst violations first instead of a flat FIFO list

---

Author: Sushil Raj (CSE, SRMIST Kattankulathur)

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
- **wanakana** — kana/romaji conversion for the furigana/romaji reading-aid toggle
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
  Slang, Dialect), plus semantic search by meaning — sort/filter choice is remembered across
  visits (localStorage) instead of resetting every time
- Reading aids: an Off / Furigana / Romaji toggle (Settings → Appearance → Reading aids) that
  renders each word's Kuromoji-computed reading as `<ruby>` furigana above the kanji, or
  transliterates the sentence to romaji via `wanakana` — applies everywhere Japanese text
  renders (board, search, entry detail, the token-annotation view)
- An official "Kotoba Bot" account (`is_bot` flag) seeds starter entries with real AI nuance +
  embeddings so the board doesn't read empty for new users; excluded from the leaderboard
- Atomic upvoting via a Postgres RPC (`toggle_entry_upvote`) backed by a unique
  `(user_id, entry_id)` ledger — prevents duplicate votes under concurrency
- Token-level annotation canvas: click any word in a sentence to pin cultural-nuance notes to
  that exact token index, plus general (non-token-pinned) comment threads on every entry
- Bookmarks, a reputation leaderboard, and browsing entries by tag

**Community & profile**
- Follow other users, block/mute users you'd rather not see (client-side filtered, private to
  the blocker), and a notification inbox (upvotes, annotations, comments, follows, admin/system
  messages) with per-type mute toggles (Settings → Account → Notifications; `system` messages
  always come through regardless)
- Daily posting streaks (🔥, gamed-proof — recomputed from each entry's own timestamp) and
  achievement badges computed from a profile's stats
- Editable display name (shown instead of your `@handle` app-wide once set) and 40 preset
  avatar icons across 4 themed sets — no image upload/storage needed
- Password change requires re-entering your current password first (verified via a real
  `signInWithPassword` re-auth check before `updateUser` runs) and starts collapsed behind a
  prompt rather than sitting open by default; account deletion; EN/JP language toggle
  (cookie-backed, hand-translated — not machine translation, see `lib/i18n/`)
- Settings is a native-app-style drill-down: a short grouped list (Profile / Account / Privacy /
  Notifications / Appearance / Reading aids, plus Legal and Sign out) where each row opens its
  own dedicated page — see `app/settings/`

**Identity & polish**
- Two hand-drawn SVG mascots (Kokeshi doll + Obake ghost) with equal billing across the app,
  both track the cursor with subtle eye movement; a custom cozy cursor (rounded arrow, bigger
  than system default); a floating mascot chat widget that can answer questions about the app
  and Japanese formality (Groq-backed, feature-flagged, cannot take actions on your behalf)
- Three themes: Matcha Light, Matcha Dark (rice-paper cream / near-neutral dark, matcha-green
  accents — CSS-variable driven, see `app/globals.css` + `tailwind.config.ts`), and Edge, a
  separate true-OLED-black theme built for zero visual clutter (flattened surfaces, no paper
  texture, formality badges as colored text instead of solid pills) rather than just a darker
  dark mode
- A universal +17% type/spacing scale (`:root { font-size: 117% }`) applied to every theme on
  every screen size — a real viewport-based baseline, not a desktop-only `zoom` hack (an earlier
  approach that caused a round of "auto-zoomed"-looking pages on narrow phones; root-caused to
  a missing `min-w-0` letting one oversized row set the width floor for the entire app shell —
  see the comment in `app/layout.tsx`)
- Responsive app shell: fixed icon rail on desktop/tablet, bottom tab bar on mobile; a single
  empty `touchstart` listener (`components/EnableTapFeedback.tsx`) makes every `:active`
  press-state style in the app actually fire on iOS Safari, which otherwise silently suppresses
  `:active` entirely unless some element on the page has a touch listener
- Route-level `loading.tsx` + matching skeletons for every main page, so client-side navigation
  shows an instant, correctly-shaped placeholder (via Next's automatic Suspense boundary) instead
  of a frozen screen while the destination page's data fetches
- Like/bookmark state is kept in sync across every simultaneously-rendered copy of the same
  entry (board, search results, entry detail, …) via a small cross-instance store
  (`lib/entry-interaction-store.ts`) instead of each copy's own disconnected local state
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
- Middleware auth check is hybrid: page navigation uses a fast local `auth.getSession()` read
  (re-verified for real via `auth.getUser()` at most once every 5 minutes, tracked in a cookie),
  while every `/api/*` route always pays for the real `auth.getUser()` round-trip, since that's
  the surface where this app's own server-side code makes authorization decisions (account
  deletion, admin actions). Trades a bounded ~5-minute window (worst case) before a revoked
  session stops looking signed-in on ordinary pages, for cutting a network round-trip off nearly
  every request — see `lib/supabase/middleware.ts`. Either way, the resolved user id is forwarded
  to the page render via a request header so Server Components read it locally instead of calling
  `auth.getUser()` again themselves
- Error monitoring via Sentry (server-side), gated entirely on `SENTRY_DSN`
- Terms of Service and Privacy Policy pages

**Phase 2 (feature-flagged — the app runs fine without these keys)**
- Automatic pragmatic analysis: after posting, a Groq LLM call classifies the formality register
  and writes a short nuance summary onto the entry (`/api/entries/[id]/analyze`)
- Semantic search: entries get an OpenAI embedding on creation
  (`/api/entries/[id]/embed`); the search bar on the board calls `/api/search`, which embeds the
  query and matches via the `match_entries` pgvector RPC
- Mascot chat bot (`/api/bot/chat`), Groq-backed, and a real retrieval-augmented agent rather
  than a plain wrapper around an LLM: every message runs a pgvector semantic search
  (`match_entries`, the same RPC the search bar uses) over the board's own submitted entries, and
  relevant results are (a) fed to the model as grounding context it's instructed to cite rather
  than invent, and (b) rendered separately in the UI as clickable "Found on the board" citation
  chips. It's also entry-context-aware — opened from an entry's detail page, it's additionally
  grounded in that specific sentence (`EntryChatContext`)
- Compose-time AI assist (`/api/entries/assist`): Groq suggests a few topic tags and, if the
  translation field is still empty, a draft translation; separately, the OpenAI embeddings
  already generated per entry are reused to warn when a near-duplicate entry already exists
- OCR from photo (`/api/entries/ocr`): a Groq vision model (Llama 4 Scout) transcribes Japanese
  text from an uploaded photo — manga panel, street sign, a screenshot — straight into the
  compose box; the image itself is never stored, only the extracted text
- AI moderation triage (`/api/reports/[id]/triage`): Groq pre-screens each filed report for
  likely severity so the admin queue surfaces credible violations (spam, harassment, non-Japanese
  junk) first — explicitly never treats rude/slang Japanese *content* itself as a violation,
  since this app catalogs that as data on purpose (see Security notes)

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
| AI nuance classification, mascot chat bot, compose-time assist, OCR-from-photo, moderation triage | `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) (free tier) |
| Semantic search, duplicate-entry nudge | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |
| Correct Open Graph image URLs in production | `NEXT_PUBLIC_SITE_URL` | your deployed domain, e.g. `https://kotoba-connect-three.vercel.app` |
| Account deletion, AI moderation triage persistence | `SUPABASE_SERVICE_ROLE_KEY` | Supabase Project Settings → API → `service_role` |

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
- A revoked session (ban, forced sign-out) can still render as "signed in" on ordinary page
  navigation for up to ~5 minutes — see the middleware note under Production hardening above.
  Every actual write still goes through Supabase RLS independently of this, so this window
  affects what a page *shows*, not what a revoked session can actually *do*.
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
  settings/                         Grouped drill-down list + profile/account/privacy/
                                     notifications/appearance/reading sub-pages, each with its
                                     own loading.tsx
  admin/page.tsx                    Moderation queue (admin-only)
  terms/, privacy/                  Legal pages
  not-found.tsx, robots.ts, sitemap.ts, manifest.ts, icon.tsx   SEO/PWA
  auth/actions.ts                   Server actions for sign in/up/out/resend/reset
  auth/callback/route.ts            OAuth + email-confirmation redirect handler
  api/tokenize/route.ts             Kuromoji tokenization endpoint (rate-limited)
  api/entries/[id]/analyze/route.ts Groq pragmatic classification (Phase 2)
  api/entries/[id]/embed/route.ts   OpenAI embedding for semantic search (Phase 2)
  api/entries/assist/route.ts       Compose-time AI assist: tags, translation draft, duplicates
  api/entries/ocr/route.ts          OCR-from-photo transcription (Groq vision)
  api/reports/[id]/triage/route.ts  AI moderation-severity triage
  api/search/route.ts               Semantic search endpoint (Phase 2)
  api/bot/chat/route.ts             Mascot chat bot (Phase 2)
  api/admin/bot/setup/, seed/       Create/seed the official bot account
components/
  EntryBoard.tsx / BoardControls.tsx  Client board: fetch, realtime, sort/filter, search
  EntryForm.tsx                      Create entry — tokenizer preview, AI assist, photo OCR
  EntryCard.tsx / EntryDetail.tsx / EntryComments.tsx   List item / annotation canvas / comments
  JapaneseText.tsx / TokenizedText.tsx   Reading-aid-aware Japanese text renderers (card preview
                                     / interactive click-to-annotate — see lib/reading-aid-store.ts)
  FollowButton.tsx / BlockButton.tsx / BlockedUsersManager.tsx   Social graph
  ProfileBadges.tsx / Avatar.tsx / AvatarPicker.tsx   Profile customization
  ReportButton.tsx / AdminQueue.tsx  Moderation UI (AI-triaged severity sort)
  NotificationBell.tsx               Notification inbox
  Mascot.tsx / mascots/candidates.tsx / MascotChat.tsx   Mascots + entry-aware chat bot widget
  EntryChatContext.tsx               Hands the bot "the entry currently being viewed"
  SideRail.tsx / MobileNav.tsx / auth/ClientAuthProvider.tsx   App shell + shared client auth state
  EnableTapFeedback.tsx              Makes :active press states fire reliably on iOS Safari
  AiNuanceCallout.tsx                Displays Groq's pragmatic read on an entry
  BotSeedPanel.tsx                   Admin UI to create/seed the official bot account
  settings/                         SettingsGroup/Row/SubpageHeader (drill-down list chrome) +
                                     one form component per settings category
  skeletons/                        Route-level loading.tsx building blocks
lib/
  supabase/                         Browser / server / middleware Supabase clients
  tokenizer.ts                      Cached Kuromoji tokenizer builder
  groq.ts / embeddings.ts            Phase 2 AI integrations (feature-flagged)
  rate-limit.ts                      Optional Upstash-backed limiter
  moderation.ts                      Spam heuristics + report reasons
  avatar-presets.ts                  40 preset avatar icons (4 sets)
  og-font.ts / site.ts               OG image font loading + site URL constant
  entry-interaction-store.ts / use-entry-interaction.ts   Cross-instance like/bookmark sync
  reading-aid-store.ts / use-reading-aid.ts / kana.ts   Furigana/romaji preference + conversion
  bot-entries.ts / bot-auth.ts       Starter entry bank + auth guard for the bot admin endpoints
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
| `0012_moderation_triage.sql` | `ai_severity`/`ai_reasoning` on `report_flags` |
| `0013_mandatory_display_name.sql` | Backfills/enforces a display name at signup |
| `0014_bot_account.sql` | `is_bot` flag on `profiles` (official bot account) |
| `0015_notification_preferences.sql` | `notification_prefs` jsonb on `profiles` + updates the four notification-producing trigger functions to check it |

## Roadmap

- Full-text fallback search alongside semantic search
- Media embeds in posts
- Onboarding tour for first-time users
- Client-side Sentry tracing (run the Sentry wizard once a real project exists)
- Stale-while-revalidate client-side caching (SWR/React Query) for feed/search/profile data, so
  a revisited page renders instantly from cache instead of a fresh fetch every time — the main
  remaining lever for faster-feeling navigation on repeat visits

---

Author: Sushil Raj (CSE, SRMIST Kattankulathur)

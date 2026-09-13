# 言葉 Kotoba Engine — Kotoba Connect

A collaborative canvas for annotating the **pragmatic, high-context meaning** behind real
Japanese text — the politeness registers, implicit social cues, and slang that dictionary
apps miss. Users post real Japanese sentences, the app tokenizes them into morphological
components on the server, and the community pins nuance notes to individual word tokens in
real time.

## Stack

- **Next.js 14** (App Router, React Server Components)
- **Supabase** — Postgres, Auth, Realtime, pgvector
- **Kuromoji.js** — server-side Japanese morphological tokenizer (POS, lemma, furigana reading)
- **Tailwind CSS**
- Optional: **Groq** (automatic Keigo/nuance classification), **OpenAI embeddings**
  (semantic search), **Upstash Redis** (rate limiting), **Sentry** (error monitoring)

## Features

**Core**
- Post a Japanese sentence + translation + formality register + tags — tokenized server-side
  via Kuromoji before saving
- Live collaborative board: new posts, upvotes, and annotations sync to every open tab via
  Supabase Realtime, no refresh needed
- Atomic upvoting via a Postgres RPC (`toggle_entry_upvote`) backed by a unique
  `(user_id, entry_id)` ledger — prevents duplicate votes under concurrency
- Token-level annotation canvas: click any word in a sentence to pin cultural-nuance notes to
  that exact token index
- Responsive UI with loading skeletons, empty states, and inline error handling + retry

**Production hardening**
- Email/password auth + Google OAuth (Supabase Auth), with an auto-created `profiles` row per
  user and a proper email-confirmation flow (pending screen + resend)
- Report button on every entry/annotation, an admin moderation queue at `/admin`
  (dismiss or delete-and-resolve), and an `is_admin` flag on profiles
- Database-level rate limits (Postgres triggers) on entries, annotations, and reports — enforced
  regardless of which client talks to Supabase; an optional Upstash-backed limiter in front of
  `/api/tokenize` and the AI endpoints
- Row Level Security on every table — reads are public, writes require the authenticated owner
  (or an admin, for moderation deletes)
- Error monitoring via Sentry (server-side), gated entirely on `SENTRY_DSN`
- Terms of Service and Privacy Policy pages

**Phase 2 (feature-flagged — the app runs fine without these keys)**
- Automatic pragmatic analysis: after posting, a Groq LLM call classifies the formality register
  and writes a short nuance summary onto the entry (`/api/entries/[id]/analyze`)
- Semantic search: entries get an OpenAI embedding on creation
  (`/api/entries/[id]/embed`); the search bar on the board calls `/api/search`, which embeds the
  query and matches via the `match_entries` pgvector RPC

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then open the SQL
   Editor and run, in order:
   1. [`supabase/schema.sql`](./supabase/schema.sql) — base tables, RLS, upvote RPC
   2. Every file in [`supabase/migrations/`](./supabase/migrations), in filename order —
      moderation/admin, DB rate limits, AI columns, pgvector search

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
| AI nuance classification | `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) (free tier) |
| Semantic search | `OPENAI_API_KEY` | [platform.openai.com](https://platform.openai.com) |

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

- Entry/annotation/vote/report writes go directly from the browser to Supabase, protected by
  Row Level Security — not by a Next.js API route. The spam heuristics in `lib/moderation.ts`
  (link/flood detection) are client-side UX, not a security boundary; real defense is RLS +
  the DB-level rate-limit triggers in `supabase/migrations/0002_db_rate_limits.sql` + the
  report/admin-review flow.
- This app intentionally does **not** filter profanity or slang — annotating rude/informal
  registers is the product. Abuse handling relies on user reports and admin review instead of
  word-list blocking, which would produce false positives against the app's own purpose.
- `npm audit` currently flags a Next.js advisory (Image Optimization AVIF RCE) with no patch
  backported to the 14.x line as of this writing — the fix requires Next 16. This app doesn't
  use `next/image` with AVIF, but if that changes, re-evaluate before upgrading.

## Project structure

```
app/
  page.tsx                        Board (server component, fetches session)
  login/page.tsx                   Sign in / sign up (+ Google OAuth, email confirmation)
  entries/[id]/page.tsx             Token-annotation detail view
  admin/page.tsx                    Moderation queue (admin-only)
  terms/, privacy/                  Legal pages
  auth/actions.ts                   Server actions for sign in/up/out/resend
  auth/callback/route.ts            OAuth + email-confirmation redirect handler
  api/tokenize/route.ts             Kuromoji tokenization endpoint (rate-limited)
  api/entries/[id]/analyze/route.ts Groq pragmatic classification (Phase 2)
  api/entries/[id]/embed/route.ts   OpenAI embedding for semantic search (Phase 2)
  api/search/route.ts               Semantic search endpoint (Phase 2)
components/
  EntryBoard.tsx                    Client board: fetch, realtime subscribe, search, list + form
  EntryForm.tsx                      Create entry with live tokenizer preview + validation
  EntryCard.tsx / EntryDetail.tsx    List item / token annotation canvas
  ReportButton.tsx / AdminQueue.tsx  Moderation UI
  AiNuanceCallout.tsx                Displays Groq's pragmatic read on an entry
  TokenizedText.tsx                  Renders Kuromoji tokens as clickable word chips
lib/
  supabase/                         Browser / server / middleware Supabase clients
  tokenizer.ts                      Cached Kuromoji tokenizer builder
  groq.ts / embeddings.ts            Phase 2 AI integrations (feature-flagged)
  rate-limit.ts                      Optional Upstash-backed limiter
  moderation.ts                      Spam heuristics + report reasons
supabase/
  schema.sql                        Base schema (fresh install)
  migrations/                       Incremental SQL — moderation, rate limits, AI columns, vector search
types/database.ts                   Shared TypeScript types
```

## Roadmap

- OCR ingestion pipeline for manga/street-signage photos
- Regional dialect classifier (Kansai-ben, Hakata-ben) and user reputation scoring
- Full-text fallback search alongside semantic search
- Client-side Sentry tracing (run the Sentry wizard once a real project exists)

---

Author: Sushil Raj (CSE, SRMIST Kattankulathur)

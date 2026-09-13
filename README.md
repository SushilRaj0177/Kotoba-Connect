# 言葉 Kotoba Engine — Kotoba Connect

A collaborative canvas for annotating the **pragmatic, high-context meaning** behind real
Japanese text — the politeness registers, implicit social cues, and slang that dictionary
apps miss. Users post real Japanese sentences, the app tokenizes them into morphological
components on the server, and the community pins nuance notes to individual word tokens in
real time.

Built as the Phase 1 MVP of the Kotoba Engine roadmap (Option A: Mini Collaborative App).

## Stack

- **Next.js 14** (App Router, React Server Components)
- **Supabase** — Postgres, Auth, and Realtime (WebSocket sync)
- **Kuromoji.js** — server-side Japanese morphological tokenizer (POS, lemma, furigana reading)
- **Tailwind CSS**

## Features

- Email/password auth (Supabase Auth), with an auto-created `profiles` row per user
- Post a Japanese sentence + translation + formality register (Sonkeigo/Kenjougo/Teineigo/
  Casual/Slang/Dialect) + tags — tokenized server-side via Kuromoji before saving
- Live collaborative board: new posts, upvotes, and annotations sync to every open tab via
  Supabase Realtime, no refresh needed
- Atomic upvoting via a Postgres RPC (`toggle_entry_upvote`) backed by a unique
  `(user_id, entry_id)` ledger — prevents duplicate votes under concurrent requests
- Token-level annotation canvas: click any word in a sentence to pin cultural-nuance notes to
  that exact token index
- Responsive UI with loading skeletons, empty states, and inline error handling + retry
- Row Level Security on every table — reads are public, writes require the authenticated owner

## Local setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Create a Supabase project** at [supabase.com](https://supabase.com), then open the SQL
   Editor and run [`supabase/schema.sql`](./supabase/schema.sql). This creates the tables,
   RLS policies, the new-user profile trigger, the atomic upvote RPC, and enables Realtime on
   the relevant tables.

3. **Configure environment variables**

   ```bash
   cp .env.example .env.local
   ```

   Fill in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from
   Project Settings → API in your Supabase dashboard.

4. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000), create an account, and post a
   sentence — try `お先に失礼します` or `マジ卍`.

## Deploying

1. Push this repo to GitHub (public, per the recruitment task requirements).
2. Import it into [Vercel](https://vercel.com/new).
3. Add the same two environment variables (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) in the Vercel project settings.
4. Deploy. Kuromoji's dictionary ships inside `node_modules/kuromoji/dict` and is bundled
   automatically with the Node.js serverless function for `/api/tokenize`.

## Project structure

```
app/
  page.tsx                 Board (server component, fetches session)
  login/page.tsx            Sign in / sign up
  entries/[id]/page.tsx      Token-annotation detail view
  auth/actions.ts            Server actions for sign in/up/out
  api/tokenize/route.ts      Kuromoji tokenization endpoint (Node runtime)
components/
  EntryBoard.tsx             Client board: fetch, realtime subscribe, list + form
  EntryForm.tsx               Create entry with live tokenizer preview + validation
  EntryCard.tsx / EntryDetail.tsx   List item / token annotation canvas
  TokenizedText.tsx           Renders Kuromoji tokens as clickable word chips
lib/supabase/                Browser / server / middleware Supabase clients
lib/tokenizer.ts             Cached Kuromoji tokenizer builder
supabase/schema.sql          Full Postgres schema, RLS, triggers, RPC
types/database.ts            Shared TypeScript types
```

## Roadmap (post-recruitment)

- Groq/Claude edge function for automatic Keigo register + nuance classification
- pgvector embeddings for semantic similarity search across entries
- OCR ingestion pipeline for manga/street-signage photos
- Regional dialect classifier (Kansai-ben, Hakata-ben) and user reputation scoring

---

Author: Sushil Raj (CSE, SRMIST Kattankulathur)

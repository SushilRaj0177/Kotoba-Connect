import Navbar from "@/components/Navbar";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export const metadata = { title: "Terms of Service — Kotoba Engine" };

export default function TermsPage() {
  return (
    <>
      <Navbar title="Terms" />
      <main className="mx-auto max-w-2xl px-4 py-10 text-sm text-ink-text sm:px-6">
        {/* h2, not h1 — Navbar already renders the page's one h1 ("Terms", via its title prop above) */}
        <h2 className="mb-6 text-2xl font-bold text-ink-text-header">Terms of Service</h2>
        <p className="mb-4 text-ink-text-muted">
          Last updated: {new Date().toISOString().slice(0, 10)}
        </p>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">1. What this is</h2>
          <p>
            Kotoba Engine (言葉) is a community project for annotating the pragmatic and cultural
            nuance of real Japanese text. By creating an account you agree to these terms.
          </p>
        </section>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">2. Your content</h2>
          <p>
            You keep ownership of anything you post (sentences, translations, notes). By posting,
            you grant other users and Kotoba Engine a license to display, and other users to
            annotate, your submissions within the app. Don&apos;t post anything you don&apos;t
            have the right to share.
          </p>
        </section>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">3. Acceptable use</h2>
          <p>
            This platform documents real language, including slang, rude registers, and informal
            speech, as linguistic data — that alone is not a violation. What is not allowed:
            harassment or hate speech directed at people, spam or advertising, impersonation, and
            deliberately false translations intended to mislead. Report anything that crosses the
            line using the Report button; violations may be removed and accounts may be suspended.
          </p>
        </section>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">4. No warranty</h2>
          <p>
            Kotoba Engine is provided &ldquo;as is,&rdquo; without warranty of any kind.
            Translations and nuance notes are community-contributed and may be inaccurate —
            don&apos;t rely on them for anything where mistranslation has real consequences.
          </p>
        </section>

        <section className="mb-6 space-y-2">
          <h2 className="text-base font-semibold text-ink-text-header">5. Changes</h2>
          <p>
            These terms may change as the project grows. Continued use after a change means you
            accept the updated terms.
          </p>
        </section>

        <p className="text-xs text-ink-text-muted">
          This is a starter policy for an early-stage community project, not legal advice — have
          it reviewed before relying on it at scale.
        </p>
      </main>
    </>
  );
}

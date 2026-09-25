import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Mascot from "@/components/Mascot";
import { Obake } from "@/components/mascots/candidates";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export const metadata = { title: "About — Kotoba Engine" };

export default function AboutPage() {
  return (
    <>
      <Navbar title="About" />
      <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center gap-2">
          <Mascot size={48} mood="happy" />
          <Obake size={48} />
        </div>
        {/* h2, not h1 — Navbar already renders the page's one h1 ("About", via its title prop above) */}
        <h2 className="mb-6 text-2xl font-bold text-ink-text-header">About Kotoba Engine</h2>

        <div className="space-y-6 text-sm leading-relaxed text-ink-text">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink-text-header">Why this exists</h2>
            <p>
              Dictionaries and translation tools are great at telling you what a Japanese sentence
              means. They&apos;re much worse at telling you how it <em>lands</em> — whether it
              sounds warm or cold, whether a native speaker would actually say it that way, whether
              it&apos;s the kind of thing you&apos;d text a friend or say to your boss. That gap —
              between the dictionary definition and the lived, social meaning — is what Kotoba
              Engine is for. Real sentences, annotated by real learners and speakers, word by word,
              for exactly the nuance a dictionary entry can&apos;t carry.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink-text-header">
              Where the AI fits, and where it doesn&apos;t
            </h2>
            <p>
              Every entry gets an automatic pragmatic read from an AI model, and every word gets a
              computed reading from a real morphological tokenizer — that&apos;s useful scaffolding,
              not the final answer. You&apos;ll see a note on AI-generated reads reminding you of
              exactly that: it&apos;s a starting point, and the actual point of this board is
              people who know better adding their own annotation on top of it. If an AI read looks
              off to you, that&apos;s not a bug to report — that&apos;s the invitation.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink-text-header">Who&apos;s building this</h2>
            <p>
              Kotoba Engine is an independent, early-stage project built by Sushil Raj (CSE, SRMIST
              Kattankulathur) — not a company, not a funded startup, just something built because
              the gap it fills felt real. That also means it&apos;s small right now: a young
              community, a growing set of entries, still finding its shape. If you&apos;ve found
              this and you&apos;re reading this page, you&apos;re early — which mostly means your
              first few posts and annotations will matter more here than they would on a board with
              ten thousand members already.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-ink-text-header">The source is open</h2>
            <p>
              The whole codebase is public — see the &ldquo;Source&rdquo; link in the footer. If
              something&apos;s broken, missing, or you just want to see how a particular feature
              works, it&apos;s all there to read.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

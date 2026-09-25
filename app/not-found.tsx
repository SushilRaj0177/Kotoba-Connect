import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Obake } from "@/components/mascots/candidates";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export default function NotFound() {
  return (
    <>
      <Navbar title="Not found" />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <Obake size={96} />
        {/* h2, not h1 — Navbar already renders the page's one h1 ("Not found", via its title prop above) */}
        <h2 className="mt-5 font-display text-2xl font-bold text-ink-text-header">Page not found</h2>
        <p className="mt-2 text-sm text-ink-text-muted">
          Whatever you were looking for isn't here — it may have been moved or removed.
        </p>
        <Link
          href="/"
          className="btn-chunky mt-6 rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-[rgb(var(--c-on-accent))]"
        >
          Back to the board
        </Link>
      </main>
    </>
  );
}

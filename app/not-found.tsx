import Link from "next/link";
import Navbar from "@/components/Navbar";
import { Obake } from "@/components/mascots/candidates";

export default function NotFound() {
  return (
    <>
      <Navbar title="Not found" />
      <main className="mx-auto flex max-w-md flex-col items-center px-6 py-20 text-center">
        <Obake size={96} />
        <h1 className="mt-5 font-display text-2xl font-bold text-ink-text-header">Page not found</h1>
        <p className="mt-2 text-sm text-ink-text-muted">
          Whatever you were looking for isn't here — it may have been moved or removed.
        </p>
        <Link
          href="/"
          className="btn-chunky mt-6 rounded-2xl bg-ink-accent px-6 py-3 text-sm font-bold text-white"
        >
          Back to the board
        </Link>
      </main>
    </>
  );
}

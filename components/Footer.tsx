import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-slate-200 py-6 text-center text-xs text-slate-muted">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4">
        <span>言葉 Kotoba Engine</span>
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <a
          href="https://github.com/SushilRaj0177/Kotoba-Connect"
          target="_blank"
          rel="noreferrer"
          className="hover:underline"
        >
          Source
        </a>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";

export default function Footer() {
  const { t } = getServerTranslator();

  return (
    <footer className="mt-12 border-t border-ink-border bg-ink-bg-secondary py-6 text-center text-xs text-ink-text-muted">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-2.5 gap-y-1 px-4 sm:gap-x-4">
        {/* "Kotoba Engine" drops on narrow screens — same treatment the
           navbar logo already gets on mobile — so the brand mark plus all
           three links (which run noticeably wider in Japanese, since
           "利用規約"/"プライバシー"/"ソースコード" render at a larger
           effective width than their English equivalents) fit on one line
           instead of wrapping. */}
        <span className="flex-none font-display font-bold">
          言葉<span className="hidden sm:inline"> Kotoba Engine</span>
        </span>
        <Link href="/terms" className="hover:text-ink-text hover:underline">
          {t("footer.terms")}
        </Link>
        <Link href="/privacy" className="hover:text-ink-text hover:underline">
          {t("footer.privacy")}
        </Link>
        <a
          href="https://github.com/SushilRaj0177/Kotoba-Connect"
          target="_blank"
          rel="noreferrer"
          className="hover:text-ink-text hover:underline"
        >
          {t("footer.source")}
        </a>
      </div>
    </footer>
  );
}

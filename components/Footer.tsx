import Link from "next/link";
import { getServerTranslator } from "@/lib/i18n/server";

export default function Footer() {
  const { t } = getServerTranslator();

  return (
    <footer className="mt-12 border-t border-discord-border bg-discord-bg-secondary py-6 text-center text-xs text-discord-text-muted">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4">
        <span className="font-jp">言葉 Kotoba Engine</span>
        <Link href="/terms" className="hover:text-discord-text hover:underline">
          {t("footer.terms")}
        </Link>
        <Link href="/privacy" className="hover:text-discord-text hover:underline">
          {t("footer.privacy")}
        </Link>
        <a
          href="https://github.com/SushilRaj0177/Kotoba-Connect"
          target="_blank"
          rel="noreferrer"
          className="hover:text-discord-text hover:underline"
        >
          {t("footer.source")}
        </a>
      </div>
    </footer>
  );
}

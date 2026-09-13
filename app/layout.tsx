import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getServerLocale } from "@/lib/i18n/server";

export const metadata: Metadata = {
  title: "Kotoba Engine 言葉 — Japanese Pragmatics Board",
  description:
    "A collaborative canvas for annotating the pragmatic, cultural nuance behind real Japanese text — beyond dictionary definitions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getServerLocale();

  return (
    <html lang={locale}>
      <body className="flex min-h-screen flex-col bg-discord-bg">
        <LocaleProvider initialLocale={locale}>
          <div className="flex-1">{children}</div>
          <Footer />
        </LocaleProvider>
      </body>
    </html>
  );
}

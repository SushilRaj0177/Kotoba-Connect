import type { Metadata } from "next";
import { Inter, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import SideRail from "@/components/SideRail";
import MobileNav from "@/components/MobileNav";
import MascotChat from "@/components/MascotChat";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getServerLocale } from "@/lib/i18n/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getServerTheme } from "@/lib/theme";
import { SITE_URL } from "@/lib/site";
import { ClientAuthProvider } from "@/components/auth/ClientAuthProvider";
import { EntryChatProvider } from "@/components/EntryChatContext";
import { ToastProvider } from "@/components/Toast";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});
// A rounded Japanese gothic face for headings/CTAs/the logotype — it
// actually reads as Japanese-flavored typography (this is a board for
// Japanese language) instead of another interchangeable geometric SaaS
// grotesk. It also natively covers the kanji/kana used throughout the UI,
// so headings and the 言葉 wordmark render from one consistent face
// instead of falling back to the browser's default JP font partway through.
const zenMaru = Zen_Maru_Gothic({
  subsets: ["latin"],
  weight: ["500", "700", "900"],
  variable: "--font-display",
});

const title = "Kotoba Engine 言葉 — Japanese Pragmatics Board";
const description =
  "A community board for annotating the pragmatic, cultural nuance behind real Japanese text — beyond dictionary definitions.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: title, template: "%s — Kotoba Engine 言葉" },
  description,
  openGraph: {
    title,
    description,
    url: SITE_URL,
    siteName: "Kotoba Engine",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getServerLocale();
  const theme = getServerTheme();

  return (
    <html lang={locale} data-theme={theme} className={`${inter.variable} ${zenMaru.variable}`}>
      <body className="flex min-h-screen bg-ink-bg">
        <ThemeProvider initialTheme={theme}>
          <LocaleProvider initialLocale={locale}>
            <ClientAuthProvider>
              <EntryChatProvider>
                <ToastProvider>
                  {/* The rail is fixed to the real left edge (so it can't be
                      dragged along when the page scrolls) and a matching-width
                      spacer takes its place in flow so content doesn't render
                      underneath it. */}
                  <SideRail />
                  <div className="hidden w-[72px] flex-none md:block" aria-hidden="true" />
                  <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
                    <div className="flex-1">{children}</div>
                  </div>
                  <MobileNav />
                  <MascotChat />
                </ToastProvider>
              </EntryChatProvider>
            </ClientAuthProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

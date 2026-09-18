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
import OnboardingGate from "@/components/auth/OnboardingGate";
import { EntryChatProvider } from "@/components/EntryChatContext";
import { ToastProvider } from "@/components/Toast";
import EnableTapFeedback from "@/components/EnableTapFeedback";

// Every page in the app renders theme-dependent output (data-theme on
// <html>, and now Edge's own layout branch in EntryCard), so any page that
// slips through as statically cacheable can freeze whichever theme
// happened to render it into the cached HTML — and worse, can end up
// referencing a CSS chunk hash from whatever build produced that cached
// copy, which 404s once a later deploy replaces it (this exact failure
// mode already hit /u/[username] once — see the dynamic export there).
// Forcing it here at the root means no page anywhere in the app can be
// statically cached, full stop, rather than finding and patching each
// affected route one at a time as it comes up.
export const dynamic = "force-dynamic";

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
              <OnboardingGate />
              <EntryChatProvider>
                <ToastProvider>
                  <EnableTapFeedback />
                  {/* The rail is fixed to the real left edge (so it can't be
                      dragged along when the page scrolls) and a matching-width
                      spacer takes its place in flow so content doesn't render
                      underneath it. */}
                  <SideRail />
                  <div className="hidden w-[72px] flex-none md:block" aria-hidden="true" />
                  {/* min-w-0: without it, a flex item's default min-width:auto
                     floors this at the min-content width of whatever's
                     rendered inside it (a header row, a long line of text,
                     anything) — on a narrow phone that floor can end up
                     wider than the viewport itself, and since nothing
                     upstream is what's supposed to shrink, the whole page
                     renders at that wider floor width and gets silently
                     clipped by body's overflow-x:hidden instead of actually
                     fitting the screen. This is what "auto-zoomed" pages
                     really were: not zoom, a missing min-w-0 letting one
                     oversized row set the floor for the entire app shell. */}
                  <div className="flex min-w-0 min-h-screen flex-1 flex-col pb-20 md:pb-0">
                    <div className="min-w-0 flex-1">{children}</div>
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

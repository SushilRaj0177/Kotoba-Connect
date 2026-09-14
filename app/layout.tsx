import type { Metadata } from "next";
import { Inter, Zen_Maru_Gothic } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import SideRail from "@/components/SideRail";
import MobileNav from "@/components/MobileNav";
import MascotChat from "@/components/MascotChat";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getServerLocale } from "@/lib/i18n/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getServerTheme } from "@/lib/theme";

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

export const metadata: Metadata = {
  title: "Kotoba Engine 言葉 — Japanese Pragmatics Board",
  description:
    "A community board for annotating the pragmatic, cultural nuance behind real Japanese text — beyond dictionary definitions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getServerLocale();
  const theme = getServerTheme();

  return (
    <html lang={locale} data-theme={theme} className={`${inter.variable} ${zenMaru.variable}`}>
      <body className="flex min-h-screen bg-ink-bg">
        <ThemeProvider initialTheme={theme}>
          <LocaleProvider initialLocale={locale}>
            {/* The rail stays flush against the real left edge, like every
                reference app — no dead margin before it. A matching-width
                spacer on the right is what makes the content column's own
                mx-auto centering land on true center instead of drifting
                left by the rail's width. */}
            <SideRail />
            <div className="flex min-h-screen flex-1 flex-col pb-16 md:pb-0">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
            <div className="hidden w-16 flex-none md:block" aria-hidden="true" />
            <MobileNav />
            <MascotChat />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

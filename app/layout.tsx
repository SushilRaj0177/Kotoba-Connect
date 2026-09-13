import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import SideRail from "@/components/SideRail";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getServerLocale } from "@/lib/i18n/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getServerTheme } from "@/lib/theme";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
});
const grotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
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
    <html lang={locale} data-theme={theme} className={`${jakarta.variable} ${grotesk.variable}`}>
      <body className="flex min-h-screen bg-ink-bg">
        <ThemeProvider initialTheme={theme}>
          <LocaleProvider initialLocale={locale}>
            <SideRail />
            <div className="flex min-h-screen flex-1 flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

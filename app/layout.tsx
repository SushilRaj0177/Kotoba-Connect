import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { getServerLocale } from "@/lib/i18n/server";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { getServerTheme } from "@/lib/theme";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Kotoba Engine 言葉 — Japanese Pragmatics Board",
  description:
    "A cozy community board for annotating the pragmatic, cultural nuance behind real Japanese text — beyond dictionary definitions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = getServerLocale();
  const theme = getServerTheme();

  return (
    <html lang={locale} data-theme={theme} className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col bg-ink-bg">
        <ThemeProvider initialTheme={theme}>
          <LocaleProvider initialLocale={locale}>
            <div className="flex-1">{children}</div>
            <Footer />
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

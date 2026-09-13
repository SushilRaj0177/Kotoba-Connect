import type { Metadata } from "next";
import "./globals.css";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Kotoba Engine 言葉 — Japanese Pragmatics Board",
  description:
    "A collaborative canvas for annotating the pragmatic, cultural nuance behind real Japanese text — beyond dictionary definitions.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}

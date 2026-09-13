"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { translate, LOCALE_COOKIE, type Locale } from "@/lib/i18n/dictionaries";

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

// Locale starts from the `locale` cookie read server-side (see lib/i18n/server.ts)
// and passed in as `initialLocale`, so server components render the right
// language on first paint with no flash. The toggle updates the cookie and
// this context together, then refreshes the router so server components
// (Navbar, page titles, etc.) pick up the change too.
export function LocaleProvider({
  initialLocale,
  children,
}: {
  initialLocale: Locale;
  children: React.ReactNode;
}) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      setLocaleState(next);
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [router]
  );

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key: string) => translate(locale, key),
    }),
    [locale, setLocale]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within LocaleProvider");
  return ctx;
}

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE, LOCALES, translate, type Locale } from "./dictionaries";

export function getServerLocale(): Locale {
  const raw = cookies().get(LOCALE_COOKIE)?.value;
  return (LOCALES as string[]).includes(raw ?? "") ? (raw as Locale) : DEFAULT_LOCALE;
}

export function getServerTranslator() {
  const locale = getServerLocale();
  return { locale, t: (key: string) => translate(locale, key) };
}

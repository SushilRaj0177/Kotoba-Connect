import { describe, expect, it } from "vitest";
import { dictionaries, translate } from "@/lib/i18n/dictionaries";

const placeholders = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort();

describe("i18n dictionaries", () => {
  const enKeys = Object.keys(dictionaries.en).sort();
  const jaKeys = Object.keys(dictionaries.ja).sort();

  it("has no English key missing a Japanese translation", () => {
    expect(enKeys.filter((k) => !(k in dictionaries.ja))).toEqual([]);
  });

  it("has no Japanese key missing from English", () => {
    expect(jaKeys.filter((k) => !(k in dictionaries.en))).toEqual([]);
  });

  it("has no empty strings", () => {
    for (const locale of ["en", "ja"] as const) {
      const empty = Object.entries(dictionaries[locale])
        .filter(([, v]) => v.trim() === "")
        .map(([k]) => `${locale}:${k}`);
      expect(empty).toEqual([]);
    }
  });

  it("keeps the same {placeholders} in both languages", () => {
    const mismatched = enKeys.filter(
      (k) => k in dictionaries.ja && placeholders(dictionaries.en[k]).join() !== placeholders(dictionaries.ja[k]).join()
    );
    expect(mismatched).toEqual([]);
  });

  it("translate() returns the locale's string", () => {
    expect(translate("en", "landing.heroTitle")).toBe(dictionaries.en["landing.heroTitle"]);
    expect(translate("ja", "landing.heroTitle")).toBe(dictionaries.ja["landing.heroTitle"]);
  });
});

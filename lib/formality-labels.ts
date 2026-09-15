import type { FormalityLevel } from "@/types/database";

// Every place a FormalityLevel enum value is shown as visible text (badges,
// board filter chips, the post form's picker) should go through this
// instead of rendering the raw value — the enum itself doubles as the en
// dictionary key, ja gets real Japanese terms.
export function formalityLabel(t: (key: string) => string, level: FormalityLevel): string {
  return t(`formality.${level}`);
}

// A plain-language gloss for the term above. "Sonkeigo"/"Kenjougo" mean
// nothing to someone who hasn't studied Japanese grammar — used to power a
// tap-to-reveal explainer rather than lengthening every badge, so the
// board stays scannable while still being one tap from an answer.
export function formalityGloss(t: (key: string) => string, level: FormalityLevel): string {
  return t(`formality.${level}.gloss`);
}

// True only for the levels where the gloss actually teaches something
// ("Casual"/"Slang"/"Dialect" are already plain English).
export function formalityHasGloss(t: (key: string) => string, level: FormalityLevel): boolean {
  return formalityGloss(t, level) !== formalityLabel(t, level);
}

// One-sentence plain-English explanation, used as the body of the
// tap-to-reveal explainer and as helper text under each option in the
// compose-form select.
export function formalityDescription(t: (key: string) => string, level: FormalityLevel): string {
  return t(`formality.${level}.desc`);
}

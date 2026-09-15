import type { FormalityLevel } from "@/types/database";

// Every place a FormalityLevel enum value is shown as visible text (badges,
// board filter chips, the post form's picker) should go through this
// instead of rendering the raw value — the enum itself doubles as the en
// dictionary key, ja gets real Japanese terms.
export function formalityLabel(t: (key: string) => string, level: FormalityLevel): string {
  return t(`formality.${level}`);
}

// A plain-language gloss for the term above. "Sonkeigo"/"Kenjougo" mean
// nothing to someone who hasn't studied Japanese grammar, so every badge
// pairs the linguistic term with this so newcomers aren't left guessing —
// see formalityDisplayLabel, which combines the two (and skips the
// gloss when it's identical to the term, e.g. "Casual").
export function formalityGloss(t: (key: string) => string, level: FormalityLevel): string {
  return t(`formality.${level}.gloss`);
}

// One-sentence plain-English explanation, used as a tooltip/helper line
// wherever there's room to teach rather than just label.
export function formalityDescription(t: (key: string) => string, level: FormalityLevel): string {
  return t(`formality.${level}.desc`);
}

export function formalityDisplayLabel(t: (key: string) => string, level: FormalityLevel): string {
  const term = formalityLabel(t, level);
  const gloss = formalityGloss(t, level);
  return gloss && gloss !== term ? `${term} · ${gloss}` : term;
}

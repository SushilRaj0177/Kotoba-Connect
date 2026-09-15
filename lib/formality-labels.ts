import type { FormalityLevel } from "@/types/database";

// Every place a FormalityLevel enum value is shown as visible text (badges,
// board filter chips, the post form's picker) should go through this
// instead of rendering the raw value — the enum itself doubles as the en
// dictionary key, ja gets real Japanese terms.
export function formalityLabel(t: (key: string) => string, level: FormalityLevel): string {
  return t(`formality.${level}`);
}

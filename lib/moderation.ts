// Lightweight spam heuristics — deliberately NOT a profanity filter. This app
// catalogs slang, insults, and rude registers as linguistic data, so blocking
// on word lists would break the product. Real defense against abuse is the
// report button + admin review queue (see supabase/migrations/0001_moderation.sql),
// this just catches obvious link/flood spam before it hits the DB.
export function spamSignal(text: string): string | null {
  if (/https?:\/\/|www\./i.test(text)) {
    return "Links aren't allowed in this field.";
  }
  if (/(.)\1{9,}/.test(text)) {
    return "That looks like spam (a character repeated too many times).";
  }
  return null;
}

export const REPORT_REASONS = [
  "Spam or advertising",
  "Harassment or hate speech",
  "Not actually Japanese / low-effort",
  "Incorrect or misleading translation",
  "Other",
] as const;

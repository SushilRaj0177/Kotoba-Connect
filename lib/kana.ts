// Furigana is conventionally shown in hiragana even though kuromoji's
// IPADIC readings come back in katakana — this is a plain Unicode
// code-point shift (katakana and hiragana share the same relative layout,
// offset by 0x60), no library needed for this direction.
export function katakanaToHiragana(input: string): string {
  return input.replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60));
}

import path from "path";
import kuromoji, { type Tokenizer, type IpadicFeatures } from "kuromoji";
import type { KuromojiToken } from "@/types/database";

let tokenizerPromise: Promise<Tokenizer<IpadicFeatures>> | null = null;

// kuromoji ships its IPADIC dictionary inside node_modules; building the
// tokenizer is expensive (~1s, loads the dict), so we cache the promise
// across invocations within the same server process.
function getTokenizer(): Promise<Tokenizer<IpadicFeatures>> {
  if (!tokenizerPromise) {
    const dicPath = path.join(process.cwd(), "node_modules", "kuromoji", "dict");
    tokenizerPromise = new Promise((resolve, reject) => {
      kuromoji.builder({ dicPath }).build((err, tokenizer) => {
        if (err) reject(err);
        else resolve(tokenizer);
      });
    });
  }
  return tokenizerPromise;
}

export async function tokenizeJapanese(text: string): Promise<KuromojiToken[]> {
  const tokenizer = await getTokenizer();
  const tokens = tokenizer.tokenize(text);

  return tokens.map((t) => ({
    word_id: t.word_id,
    word_type: t.word_type,
    surface_form: t.surface_form,
    pos: t.pos,
    pos_detail_1: t.pos_detail_1,
    basic_form: t.basic_form,
    reading: t.reading,
    pronunciation: t.pronunciation,
  }));
}

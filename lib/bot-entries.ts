import type { FormalityLevel } from "@/types/database";

export interface BotEntrySeed {
  japanese: string;
  translation: string;
  formality: FormalityLevel;
  tags: string[];
}

// A starter bank of common, everyday Japanese sentences — the kind a
// learner runs into constantly (greetings, convenience-store checkout,
// group-chat texting, anime/manga stock lines) but rarely sees with the
// pragmatic "why does it feel this way" context this board exists for.
// Posted by the bot account (see lib/bot-account.ts) so the board has real
// content to browse from day one instead of reading as empty.
export const BOT_ENTRY_SEEDS: BotEntrySeed[] = [
  { japanese: "お疲れ様です。", translation: "Thanks for your hard work.", formality: "Teineigo", tags: ["work", "greetings"] },
  { japanese: "よろしくお願いします。", translation: "Please treat me well / I look forward to working with you.", formality: "Teineigo", tags: ["greetings", "business"] },
  { japanese: "お世話になっております。", translation: "Thank you for your continued support.", formality: "Teineigo", tags: ["business", "email"] },
  { japanese: "少々お待ちください。", translation: "Please wait a moment.", formality: "Teineigo", tags: ["service", "business"] },
  { japanese: "申し訳ございません。", translation: "I'm terribly sorry.", formality: "Kenjougo", tags: ["apology", "business"] },
  { japanese: "かしこまりました。", translation: "Understood (formal, service context).", formality: "Kenjougo", tags: ["service", "business"] },
  { japanese: "失礼いたします。", translation: "Excuse me / pardon my intrusion.", formality: "Kenjougo", tags: ["greetings", "business"] },
  { japanese: "ご確認いただけますでしょうか。", translation: "Could you please check this?", formality: "Sonkeigo", tags: ["business", "email"] },
  { japanese: "何かご不明な点はございますか。", translation: "Is there anything unclear?", formality: "Sonkeigo", tags: ["service", "business"] },
  { japanese: "先生がおっしゃった通りです。", translation: "It's exactly as the teacher said.", formality: "Sonkeigo", tags: ["school", "respect"] },
  { japanese: "袋はご利用ですか。", translation: "Would you like a bag?", formality: "Teineigo", tags: ["shopping", "convenience-store"] },
  { japanese: "お会計、こちらでよろしいでしょうか。", translation: "Is this total okay with you?", formality: "Teineigo", tags: ["shopping", "convenience-store"] },
  { japanese: "レジ袋は有料になります。", translation: "Plastic bags cost extra.", formality: "Teineigo", tags: ["shopping"] },
  { japanese: "温めますか。", translation: "Would you like this heated up?", formality: "Teineigo", tags: ["convenience-store", "food"] },
  { japanese: "ポイントカードはお持ちですか。", translation: "Do you have a point card?", formality: "Teineigo", tags: ["shopping"] },
  { japanese: "了解！", translation: "Got it! (casual, common in group chats)", formality: "Casual", tags: ["texting", "chat"] },
  { japanese: "マジで？", translation: "Seriously? / For real?", formality: "Casual", tags: ["texting", "reaction"] },
  { japanese: "それな。", translation: "Right? / Exactly. (agreeing casually)", formality: "Slang", tags: ["texting", "chat"] },
  { japanese: "草", translation: "lol (literally \"grass\" — from the kanji 笑 looking like grass when repeated)", formality: "Slang", tags: ["internet", "texting"] },
  { japanese: "ワンチャンある。", translation: "There's a chance / it might just work out.", formality: "Slang", tags: ["internet", "chat"] },
  { japanese: "詰んだ。", translation: "It's over / I'm doomed (lit. \"checkmated\").", formality: "Slang", tags: ["internet", "gaming"] },
  { japanese: "びっくりした〜。", translation: "That startled me~", formality: "Casual", tags: ["reaction", "everyday"] },
  { japanese: "今行くね。", translation: "I'm heading over now.", formality: "Casual", tags: ["texting", "everyday"] },
  { japanese: "全然大丈夫だよ。", translation: "It's totally fine.", formality: "Casual", tags: ["everyday", "reassurance"] },
  { japanese: "ちょっと待って！", translation: "Wait a sec!", formality: "Casual", tags: ["everyday"] },
  { japanese: "お腹すいた。", translation: "I'm hungry.", formality: "Casual", tags: ["everyday", "food"] },
  { japanese: "眠すぎる。", translation: "I'm way too sleepy.", formality: "Casual", tags: ["everyday"] },
  { japanese: "行くしかない。", translation: "There's no choice but to go.", formality: "Casual", tags: ["everyday", "determination"] },
  { japanese: "諦めるな！", translation: "Don't give up!", formality: "Casual", tags: ["anime", "encouragement"] },
  { japanese: "覚悟はいいか？", translation: "Are you ready? (lit. \"is your resolve ready\")", formality: "Casual", tags: ["anime", "dramatic"] },
  { japanese: "これで終わりだと思うなよ。", translation: "Don't think this is over.", formality: "Casual", tags: ["anime", "dramatic"] },
  { japanese: "お前を倒す！", translation: "I'll defeat you!", formality: "Casual", tags: ["anime", "battle"] },
  { japanese: "まだまだこれからだ。", translation: "This is just the beginning.", formality: "Casual", tags: ["anime", "determination"] },
  { japanese: "信じてたよ。", translation: "I believed in you.", formality: "Casual", tags: ["anime", "emotional"] },
  { japanese: "さすがだね。", translation: "As expected of you / impressive as always.", formality: "Casual", tags: ["compliment", "everyday"] },
  { japanese: "空気読んで。", translation: "Read the room. (lit. \"read the air\")", formality: "Casual", tags: ["idiom", "social"] },
  { japanese: "それは言わない約束でしょ。", translation: "We agreed not to bring that up, remember?", formality: "Casual", tags: ["everyday", "banter"] },
  { japanese: "そろそろ行かなきゃ。", translation: "I should get going soon.", formality: "Casual", tags: ["everyday"] },
  { japanese: "お先に失礼します。", translation: "Excuse me for leaving first (said when leaving work before coworkers).", formality: "Teineigo", tags: ["work", "greetings"] },
  { japanese: "お疲れ〜！", translation: "Good work! (casual version of otsukaresama)", formality: "Casual", tags: ["work", "greetings"] },
  { japanese: "本日も一日よろしくお願いいたします。", translation: "Thank you for your support again today.", formality: "Sonkeigo", tags: ["work", "morning"] },
  { japanese: "だんだん寒くなってきましたね。", translation: "It's gradually getting colder, isn't it.", formality: "Teineigo", tags: ["small-talk", "weather"] },
  { japanese: "お先にどうぞ。", translation: "After you.", formality: "Teineigo", tags: ["everyday", "manners"] },
  { japanese: "どういたしまして。", translation: "You're welcome.", formality: "Teineigo", tags: ["greetings", "everyday"] },
  { japanese: "お陰様で元気です。", translation: "Thanks to you, I'm doing well.", formality: "Teineigo", tags: ["greetings", "gratitude"] },
  { japanese: "たまげたわ。", translation: "That surprised me. (Kansai-flavored, casual)", formality: "Dialect", tags: ["kansai", "reaction"] },
  { japanese: "ほんまに？", translation: "Really? (Kansai dialect for \"honto ni\")", formality: "Dialect", tags: ["kansai", "reaction"] },
  { japanese: "なんでやねん！", translation: "Why on earth! (classic Kansai comedic retort)", formality: "Dialect", tags: ["kansai", "comedy"] },
  { japanese: "めっちゃ美味しい。", translation: "Really delicious. (めっちゃ = very, Kansai-origin but nationwide now)", formality: "Casual", tags: ["food", "everyday"] },
];

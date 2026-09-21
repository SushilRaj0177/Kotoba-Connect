"use client";

// Wraps the browser's built-in SpeechSynthesis API — no backend, no API
// key, no cost, works offline once the voice is downloaded. Voice quality
// varies a lot by OS/browser (Chrome/Edge desktop tends to have a decent
// ja-JP voice bundled; iOS Safari's is thinner), which is the tradeoff for
// it being free. If that turns out to be a real complaint, the natural
// upgrade path is VOICEVOX (also free, but self-hosted — it needs an
// always-on server, unlike this) or a paid hosted API (Google/Azure TTS).
//
// Voice lists load asynchronously in some browsers (empty on the first
// call, populated once the "voiceschanged" event fires) — this handles
// that by retrying once the event fires, rather than assuming voices are
// available immediately.
let cachedJaVoice: SpeechSynthesisVoice | null | undefined;

function pickJapaneseVoice(): SpeechSynthesisVoice | null {
  if (cachedJaVoice !== undefined) return cachedJaVoice;
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;
  cachedJaVoice = voices.find((v) => v.lang === "ja-JP") ?? voices.find((v) => v.lang.startsWith("ja")) ?? null;
  return cachedJaVoice;
}

export function speechSupported(): boolean {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function speakJapanese(text: string, onEnd?: () => void): boolean {
  if (!speechSupported() || !text.trim()) return false;

  const say = () => {
    window.speechSynthesis.cancel(); // don't stack utterances if tapped repeatedly
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ja-JP";
    utterance.rate = 0.9; // slightly slower than default — this is a pronunciation aid, not playback speed
    const voice = pickJapaneseVoice();
    if (voice) utterance.voice = voice;
    if (onEnd) {
      utterance.onend = onEnd;
      utterance.onerror = onEnd;
    }
    window.speechSynthesis.speak(utterance);
  };

  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.addEventListener("voiceschanged", say, { once: true });
    // Some browsers never fire voiceschanged if voices were already ready
    // by the time this listener attaches — speak once now too as a
    // fallback; cancel() at the top of say() keeps a resulting double-call
    // harmless.
    say();
  } else {
    say();
  }
  return true;
}

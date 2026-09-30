import { describe, expect, it } from "vitest";
import { spamSignal } from "@/lib/moderation";
import { katakanaToHiragana } from "@/lib/kana";
import { AVATAR_SETS, avatarPresetToken, parseAvatarPreset } from "@/lib/avatar-presets";
import { errorMessage } from "@/lib/errors";
import { getClientIp } from "@/lib/rate-limit";

describe("spamSignal", () => {
  it("allows ordinary Japanese, including slang and rude registers", () => {
    expect(spamSignal("お疲れ様でした")).toBeNull();
    expect(spamSignal("うるせえ、黙れ")).toBeNull();
  });

  it("blocks links", () => {
    expect(spamSignal("check https://example.com")).not.toBeNull();
    expect(spamSignal("www.example.com")).not.toBeNull();
  });

  it("blocks a character repeated 10+ times but allows 9", () => {
    expect(spamSignal("w".repeat(10))).not.toBeNull();
    expect(spamSignal("w".repeat(9))).toBeNull();
  });
});

describe("katakanaToHiragana", () => {
  it("converts kuromoji's katakana readings to hiragana", () => {
    expect(katakanaToHiragana("オツカレサマ")).toBe("おつかれさま");
  });

  it("leaves hiragana, kanji, and the long-vowel mark alone", () => {
    expect(katakanaToHiragana("ひらがな漢字ー")).toBe("ひらがな漢字ー");
  });
});

describe("avatar presets", () => {
  it("round-trips every preset through its token", () => {
    AVATAR_SETS.forEach((set, s) =>
      set.presets.forEach((preset, i) => expect(parseAvatarPreset(avatarPresetToken(s, i))).toBe(preset))
    );
  });

  it("returns null for non-preset or out-of-range values", () => {
    expect(parseAvatarPreset(null)).toBeNull();
    expect(parseAvatarPreset("bot-mascot")).toBeNull();
    expect(parseAvatarPreset("preset:99:0")).toBeNull();
    expect(parseAvatarPreset("preset:0:99")).toBeNull();
  });
});

describe("errorMessage", () => {
  it("reads .message from Errors and Supabase's plain-object PostgrestError", () => {
    expect(errorMessage(new Error("boom"), "fallback")).toBe("boom");
    expect(errorMessage({ message: "RLS denied", code: "42501" }, "fallback")).toBe("RLS denied");
  });

  it("falls back for anything else", () => {
    expect(errorMessage(null, "fallback")).toBe("fallback");
    expect(errorMessage("oops", "fallback")).toBe("fallback");
    expect(errorMessage({ message: 42 }, "fallback")).toBe("fallback");
  });
});

describe("getClientIp", () => {
  const req = (headers: Record<string, string>) => new Request("https://x.test", { headers });

  it("uses the first x-forwarded-for hop", () => {
    expect(getClientIp(req({ "x-forwarded-for": "1.2.3.4, 10.0.0.1" }))).toBe("1.2.3.4");
  });

  it("falls back to x-real-ip, then 'unknown'", () => {
    expect(getClientIp(req({ "x-real-ip": "5.6.7.8" }))).toBe("5.6.7.8");
    expect(getClientIp(req({}))).toBe("unknown");
  });
});

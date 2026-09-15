// Four themed sets of 10 preset profile icons, so new users get an actual
// choice beyond the deterministic colored-initial fallback in Avatar.tsx.
// Stored on profiles.avatar_url as a "preset:<setIndex>:<itemIndex>" token
// (see AvatarPicker.tsx / Avatar.tsx) rather than an uploaded image — no
// storage bucket needed, and it renders instantly everywhere.
export interface AvatarPreset {
  emoji: string;
  bg: string;
}

export interface AvatarSet {
  name: string;
  presets: AvatarPreset[];
}

// Background picks deliberately avoid the emoji's own dominant color (an
// orange fox on an orange chip, a green frog on the app's own matcha
// green, a cream onigiri on a near-white chip) — same hue/lightness
// family as the subject makes it blend into its own badge instead of
// popping. Every chip below is a mid-dark, fairly saturated tone chosen
// to contrast against typical emoji coloring instead of matching it.
export const AVATAR_SETS: AvatarSet[] = [
  {
    name: "Animals",
    presets: [
      { emoji: "🐱", bg: "#7a3f8a" },
      { emoji: "🐶", bg: "#2f6b8a" },
      { emoji: "🦊", bg: "#3f4a6b" },
      { emoji: "🐰", bg: "#3f6b3f" },
      { emoji: "🐼", bg: "#a84a6b" },
      { emoji: "🐨", bg: "#b5502f" },
      { emoji: "🐯", bg: "#1f7a6b" },
      { emoji: "🦁", bg: "#4a4a4a" },
      { emoji: "🐸", bg: "#c9403f" },
      { emoji: "🐧", bg: "#d98f1f" },
    ],
  },
  {
    name: "Faces",
    presets: [
      { emoji: "😊", bg: "#7a3f8a" },
      { emoji: "😎", bg: "#b5502f" },
      { emoji: "🥳", bg: "#2f6b8a" },
      { emoji: "😇", bg: "#a84a6b" },
      { emoji: "🤓", bg: "#3f4a6b" },
      { emoji: "😴", bg: "#c9403f" },
      { emoji: "🥰", bg: "#1f7a6b" },
      { emoji: "🤔", bg: "#4a4a4a" },
      { emoji: "😜", bg: "#3f6b3f" },
      { emoji: "🙂", bg: "#4a5f7a" },
    ],
  },
  {
    name: "Nature",
    presets: [
      { emoji: "🌸", bg: "#2f6b8a" },
      { emoji: "🌿", bg: "#a84a6b" },
      { emoji: "🍃", bg: "#b5502f" },
      { emoji: "🌊", bg: "#d98f1f" },
      { emoji: "🔥", bg: "#3f6b3f" },
      { emoji: "⭐", bg: "#7a3f8a" },
      { emoji: "🌙", bg: "#4a4a4a" },
      { emoji: "☀️", bg: "#3f4a6b" },
      { emoji: "🍂", bg: "#1f7a6b" },
      { emoji: "🌈", bg: "#4a5f7a" },
    ],
  },
  {
    name: "Cozy",
    presets: [
      { emoji: "🍙", bg: "#4a4a4a" },
      { emoji: "🍡", bg: "#3f4a6b" },
      { emoji: "🎋", bg: "#c9403f" },
      { emoji: "🏮", bg: "#1f7a6b" },
      { emoji: "📚", bg: "#2f6b8a" },
      { emoji: "🎨", bg: "#a84a6b" },
      { emoji: "🎮", bg: "#d98f1f" },
      { emoji: "🎧", bg: "#7a3f8a" },
      { emoji: "☕", bg: "#4a5f7a" },
      { emoji: "🍵", bg: "#b5502f" },
    ],
  },
];

export function parseAvatarPreset(avatarUrl: string | null | undefined): AvatarPreset | null {
  if (!avatarUrl?.startsWith("preset:")) return null;
  const [, setIndexStr, itemIndexStr] = avatarUrl.split(":");
  const setIndex = Number(setIndexStr);
  const itemIndex = Number(itemIndexStr);
  return AVATAR_SETS[setIndex]?.presets[itemIndex] ?? null;
}

export function avatarPresetToken(setIndex: number, itemIndex: number): string {
  return `preset:${setIndex}:${itemIndex}`;
}

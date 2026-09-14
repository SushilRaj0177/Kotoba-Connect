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

export const AVATAR_SETS: AvatarSet[] = [
  {
    name: "Animals",
    presets: [
      { emoji: "🐱", bg: "#d97757" },
      { emoji: "🐶", bg: "#c98a3f" },
      { emoji: "🦊", bg: "#e0763f" },
      { emoji: "🐰", bg: "#c98fa8" },
      { emoji: "🐼", bg: "#4a4640" },
      { emoji: "🐨", bg: "#8a9a8e" },
      { emoji: "🐯", bg: "#d9973f" },
      { emoji: "🦁", bg: "#d6a13f" },
      { emoji: "🐸", bg: "#688c4a" },
      { emoji: "🐧", bg: "#3b5266" },
    ],
  },
  {
    name: "Faces",
    presets: [
      { emoji: "😊", bg: "#e0b23f" },
      { emoji: "😎", bg: "#3b5266" },
      { emoji: "🥳", bg: "#c9548a" },
      { emoji: "😇", bg: "#8fb8d6" },
      { emoji: "🤓", bg: "#688c4a" },
      { emoji: "😴", bg: "#7c6fa8" },
      { emoji: "🥰", bg: "#d97fa0" },
      { emoji: "🤔", bg: "#c98a3f" },
      { emoji: "😜", bg: "#d9763f" },
      { emoji: "🙂", bg: "#a89a7c" },
    ],
  },
  {
    name: "Nature",
    presets: [
      { emoji: "🌸", bg: "#d9a3b8" },
      { emoji: "🌿", bg: "#5f7a44" },
      { emoji: "🍃", bg: "#7fa363" },
      { emoji: "🌊", bg: "#3f7c96" },
      { emoji: "🔥", bg: "#d9643f" },
      { emoji: "⭐", bg: "#d6b13f" },
      { emoji: "🌙", bg: "#4a4670" },
      { emoji: "☀️", bg: "#e0a13f" },
      { emoji: "🍂", bg: "#b8703f" },
      { emoji: "🌈", bg: "#8a6fa8" },
    ],
  },
  {
    name: "Cozy",
    presets: [
      { emoji: "🍙", bg: "#e8e0c8" },
      { emoji: "🍡", bg: "#d99fae" },
      { emoji: "🎋", bg: "#5f8a5f" },
      { emoji: "🏮", bg: "#c9483f" },
      { emoji: "📚", bg: "#8a6a4a" },
      { emoji: "🎨", bg: "#c95f8a" },
      { emoji: "🎮", bg: "#4a5f8a" },
      { emoji: "🎧", bg: "#3f3f4a" },
      { emoji: "☕", bg: "#6f4a3f" },
      { emoji: "🍵", bg: "#688c4a" },
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

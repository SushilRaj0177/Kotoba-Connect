import { parseAvatarPreset } from "@/lib/avatar-presets";

// The official bot account's avatar_url is set to this exact token (see
// app/api/admin/bot/setup/route.ts) — a robot face on the same matcha
// accent every other bot badge uses, so it reads as "the house account"
// rather than a user's emoji pick.
const BOT_AVATAR_TOKEN = "bot-mascot";

// Deterministic colored avatar: same username always gets the same color
// and initial, no image upload needed. Used as the fallback whenever a
// profile hasn't picked a preset icon (see AvatarPicker.tsx).
const PALETTE = [
  "#e8542f",
  "#d97706",
  "#16a34a",
  "#0891b2",
  "#6366f1",
  "#c026d3",
  "#7c3aed",
  "#dc2626",
];

// Sizes here were always plain px numbers fed straight into inline
// styles/SVG attributes — that's fine normally, but it means they don't
// respond to Edge's root font-size scale (app/globals.css) the way every
// Tailwind rem-based class elsewhere does, so avatars stayed pinned at
// their exact original size while surrounding text grew, throwing off
// the proportions Edge is supposed to keep consistent. rem is relative to
// the root <html> font-size specifically (not the nearest ancestor), so
// this scales in lockstep with that rule on every theme, including the
// ones that don't touch font-size at all (where 16px rem = px, unchanged).
function rem(px: number): string {
  return `${px / 16}rem`;
}

function colorFor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({
  username,
  avatarUrl,
  size = 32,
}: {
  username: string;
  avatarUrl?: string | null;
  size?: number;
}) {
  if (avatarUrl === BOT_AVATAR_TOKEN) {
    return (
      <span
        aria-hidden="true"
        style={{ width: rem(size), height: rem(size), backgroundColor: "#5f7a44" }}
        className="flex flex-none items-center justify-center rounded-full"
      >
        {/* A custom flat robot face, not a stock emoji — antenna, rounded
           head, simple eyes/mouth, in the same matcha tones the mascot
           and every bot badge already use. */}
        <svg width={rem(size * 0.62)} height={rem(size * 0.62)} viewBox="0 0 40 40" fill="none">
          <rect x="7" y="3" width="2" height="7" rx="1" fill="#e8e4d4" />
          <circle cx="8" cy="3" r="2.6" fill="#d9973f" />
          <rect x="4" y="10" width="32" height="26" rx="10" fill="#e8e4d4" />
          <circle cx="14" cy="23" r="4" fill="#3a4a2c" />
          <circle cx="26" cy="23" r="4" fill="#3a4a2c" />
          <circle cx="15.3" cy="21.7" r="1.1" fill="#e8e4d4" />
          <circle cx="27.3" cy="21.7" r="1.1" fill="#e8e4d4" />
          <rect x="13" y="30" width="14" height="2.6" rx="1.3" fill="#3a4a2c" />
        </svg>
      </span>
    );
  }

  const preset = parseAvatarPreset(avatarUrl);

  if (preset) {
    return (
      <span
        aria-hidden="true"
        style={{ width: rem(size), height: rem(size), backgroundColor: preset.bg, fontSize: rem(size * 0.58) }}
        className="flex flex-none items-center justify-center rounded-full"
      >
        {preset.emoji}
      </span>
    );
  }

  const initial = username.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      style={{ width: rem(size), height: rem(size), backgroundColor: colorFor(username), fontSize: rem(size * 0.45) }}
      className="flex flex-none items-center justify-center rounded-full font-semibold text-white"
    >
      {initial}
    </span>
  );
}

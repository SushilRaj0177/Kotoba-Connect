// Deterministic colored avatar: same username always gets the same color
// and initial, no image upload needed.
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

function colorFor(username: string): string {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = (hash << 5) - hash + username.charCodeAt(i);
    hash |= 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export default function Avatar({ username, size = 32 }: { username: string; size?: number }) {
  const initial = username.trim().charAt(0).toUpperCase() || "?";
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, backgroundColor: colorFor(username), fontSize: size * 0.45 }}
      className="flex flex-none items-center justify-center rounded-full font-semibold text-white"
    >
      {initial}
    </span>
  );
}

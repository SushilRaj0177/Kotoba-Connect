// Discord-style deterministic colored avatar: same username always gets the
// same color and initial, no image upload needed.
const PALETTE = [
  "#f23f43",
  "#f0b232",
  "#23a55a",
  "#00a8fc",
  "#5865f2",
  "#eb459e",
  "#9c84ef",
  "#f47b67",
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

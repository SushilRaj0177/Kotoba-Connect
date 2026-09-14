// The board's mascot — a hanko (印鑑, the traditional carved name-stamp
// used across Japan in place of a signature) given a friendly face. It's
// the one piece of imagery unique to this product: not cloned from any
// reference app, and it ties directly into the "real Japanese language,
// stamped with community context" idea the board is built around.
//
// Drawn flat as an SVG sticker (a soft offset shadow + a gloss highlight)
// rather than attempting true 3D — a hand-rolled WebGL model would look
// worse than a clean vector mark at every size this actually renders at,
// from a 16px favicon to a 200px empty-state illustration.
export default function Mascot({
  size = 96,
  mood = "happy",
  className = "",
}: {
  size?: number;
  mood?: "happy" | "sleepy" | "excited";
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <ellipse cx="50" cy="90" rx="26" ry="5" fill="black" fillOpacity="0.18" />

      {/* stubby arms */}
      <rect x="6" y="52" width="16" height="11" rx="5.5" fill="rgb(var(--c-accent))" />
      <rect x="78" y="52" width="16" height="11" rx="5.5" fill="rgb(var(--c-accent))" />

      {/* body: the stamp face */}
      <circle cx="50" cy="48" r="38" fill="rgb(var(--c-accent))" />
      <circle cx="50" cy="48" r="38" fill="url(#mascotShade)" />
      <circle cx="50" cy="48" r="31" fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="3" />

      {/* gloss highlight */}
      <ellipse cx="35" cy="28" rx="13" ry="8" fill="white" fillOpacity="0.35" />

      {/* face */}
      {mood === "sleepy" ? (
        <>
          <path d="M32 47q6-6 12 0" stroke="#221018" strokeWidth="3.2" strokeLinecap="round" fill="none" />
          <path d="M56 47q6-6 12 0" stroke="#221018" strokeWidth="3.2" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="38" cy="46" r="4.2" fill="#221018" />
          <circle cx="62" cy="46" r="4.2" fill="#221018" />
        </>
      )}
      <circle cx="30" cy="57" r="5" fill="#ffb3c6" fillOpacity="0.8" />
      <circle cx="70" cy="57" r="5" fill="#ffb3c6" fillOpacity="0.8" />
      {mood === "excited" ? (
        <path d="M39 60q11 10 22 0" stroke="#221018" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M40 60q10 6 20 0" stroke="#221018" strokeWidth="3.2" strokeLinecap="round" fill="none" />
      )}

      <defs>
        <radialGradient id="mascotShade" cx="0.35" cy="0.3" r="0.9">
          <stop offset="0%" stopColor="white" stopOpacity="0.18" />
          <stop offset="60%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.12" />
        </radialGradient>
      </defs>
    </svg>
  );
}

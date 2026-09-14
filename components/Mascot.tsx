// The board's mascot, "Kokeshi" — a kokeshi (こけし), the traditional Japanese
// wooden folk doll: a simple cylindrical body, a round head, a painted
// face, no arms or legs. It's a genuinely cozy, handmade-feeling object
// (often given as a keepsake) rather than a generic cartoon-blob
// character, and its indigo-painted body matches the aizome accent color
// used everywhere else instead of fighting it.
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
      <ellipse cx="50" cy="93" rx="24" ry="4.5" fill="black" fillOpacity="0.16" />

      <g className="m-sway">
      {/* Sticker-style outline halo, drawn behind everything, so the
          character reads as its own cut-out element instead of blending
          into whatever color surface it's placed on (a flat accent card,
          a themed background, etc). */}
      <path
        d="M28 46c0-3 1-5 2-6 4-4 8-5 20-5s16 1 20 5c1 1 2 3 2 6l3 34c1 7-4 13-11 13H36c-7 0-12-6-11-13z"
        fill="none"
        stroke="#fdf8ef"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <circle cx="50" cy="30" r="23" fill="none" stroke="#fdf8ef" strokeWidth="5" />

      {/* body: a simple rounded cylinder, no arms or legs */}
      <path
        d="M28 46c0-3 1-5 2-6 4-4 8-5 20-5s16 1 20 5c1 1 2 3 2 6l3 34c1 7-4 13-11 13H36c-7 0-12-6-11-13z"
        fill="rgb(var(--c-accent))"
      />
      <path
        d="M28 46c0-3 1-5 2-6 4-4 8-5 20-5s16 1 20 5c1 1 2 3 2 6l3 34c1 7-4 13-11 13H36c-7 0-12-6-11-13z"
        fill="url(#mascotShade)"
      />

      {/* obi band + simple flower motif */}
      <path d="M25 63h50l1.6 9H23.4z" fill="rgb(var(--c-accent-2))" />
      <circle cx="50" cy="67.5" r="3.4" fill="rgb(var(--c-bg-secondary))" fillOpacity="0.9" />

      {/* gloss highlight on the body */}
      <ellipse cx="38" cy="50" rx="7" ry="14" fill="white" fillOpacity="0.16" />

      {/* head */}
      <circle cx="50" cy="30" r="23" fill="#fbf3e3" />
      <circle cx="50" cy="30" r="23" fill="none" stroke="#2a2438" strokeOpacity="0.35" strokeWidth="1.8" />

      {/* hair */}
      <path d="M28 24a22 22 0 0 1 44 0c-6-3-14-4-22-4s-16 1-22 4z" fill="rgb(var(--c-accent-hover))" />

      {/* face */}
      {mood === "sleepy" ? (
        <>
          <path d="M39 32q4-4 8 0" stroke="#2a2438" strokeWidth="2.6" strokeLinecap="round" fill="none" />
          <path d="M53 32q4-4 8 0" stroke="#2a2438" strokeWidth="2.6" strokeLinecap="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx="43" cy="31" r="2.6" fill="#2a2438" />
          <circle cx="61" cy="31" r="2.6" fill="#2a2438" />
        </>
      )}
      <circle cx="36" cy="39" r="4" fill="#e8a0a0" fillOpacity="0.75" />
      <circle cx="68" cy="39" r="4" fill="#e8a0a0" fillOpacity="0.75" />
      {mood === "excited" ? (
        <path d="M45 40q7 6 14 0" stroke="#2a2438" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M46 40q6 4 12 0" stroke="#2a2438" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      )}
      </g>

      <defs>
        <linearGradient id="mascotShade" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="white" stopOpacity="0.12" />
          <stop offset="55%" stopColor="white" stopOpacity="0" />
          <stop offset="100%" stopColor="black" stopOpacity="0.14" />
        </linearGradient>
      </defs>
    </svg>
  );
}

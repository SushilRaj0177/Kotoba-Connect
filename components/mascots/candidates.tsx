// Mascot candidates alongside Kokeshi (components/Mascot.tsx). Obake was
// kept and reworked after feedback that the first version felt
// "incomplete and messy"; Daruma/Maneki/Shiba/Tsuru/Mochi/Tanuki/Sumo/
// Ramen were dropped per direction to replace them with a fox and a cat
// instead. All three here use the same sticker-outline-halo technique as
// Kokeshi so they read as their own element on any background color.
type MascotProps = { size?: number; className?: string };
const HALO = "#fdf8ef";
const INK = "#2a2438";

// "Obake" (お化け) — a round little ghost. Redesigned: an even 3-scallop
// hem instead of the previous asymmetric wavy line, a soft accent-tinted
// fill instead of flat white so it doesn't look like an unfinished
// outline, and the same halo/shadow treatment as Kokeshi.
export function Obake({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="90" rx="20" ry="4" fill="black" fillOpacity="0.14" />
      <g className="m-float">
        <path
          d="M50 14c17 0 29 13 29 30v32c0 3-3 4-5 2l-4-4-6 6a3 3 0 0 1-4 0l-4-4-4 4a3 3 0 0 1-4 0l-4-4-6 6c-2 2-5 1-5-2V44c0-17 12-30 29-30z"
          fill="none"
          stroke={HALO}
          strokeWidth="5"
          strokeLinejoin="round"
        />
        <path
          d="M50 14c17 0 29 13 29 30v32c0 3-3 4-5 2l-4-4-6 6a3 3 0 0 1-4 0l-4-4-4 4a3 3 0 0 1-4 0l-4-4-6 6c-2 2-5 1-5-2V44c0-17 12-30 29-30z"
          fill="#fbf3e3"
        />
        <path
          d="M50 14c17 0 29 13 29 30v32c0 3-3 4-5 2l-4-4-6 6a3 3 0 0 1-4 0l-4-4-4 4a3 3 0 0 1-4 0l-4-4-6 6c-2 2-5 1-5-2V44c0-17 12-30 29-30z"
          fill="rgb(var(--c-accent))"
          fillOpacity="0.14"
        />
        <path
          d="M50 14c17 0 29 13 29 30v32c0 3-3 4-5 2l-4-4-6 6a3 3 0 0 1-4 0l-4-4-4 4a3 3 0 0 1-4 0l-4-4-6 6c-2 2-5 1-5-2V44c0-17 12-30 29-30z"
          fill="none"
          stroke={INK}
          strokeOpacity="0.3"
          strokeWidth="1.6"
        />
        <g className="m-blink">
          <circle cx="41" cy="42" r="3.2" fill={INK} />
          <circle cx="59" cy="42" r="3.2" fill={INK} />
        </g>
        <path d="M45 52q5 4 10 0" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="33" cy="48" r="4" fill="rgb(var(--c-accent-2))" fillOpacity="0.5" />
        <circle cx="67" cy="48" r="4" fill="rgb(var(--c-accent-2))" fillOpacity="0.5" />
      </g>
    </svg>
  );
}

// "Kitsune" — a fox, ears up and tail swishing. Fur in the primary
// accent color, cream muzzle/chest patch, dark ear tips.
export function Kitsune({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="24" ry="4.5" fill="black" fillOpacity="0.16" />

      <g className="m-wave" style={{ transformOrigin: "78px 62px" }}>
        <path d="M78 62q20-4 16 18-14 2-16-18z" fill="rgb(var(--c-accent))" stroke={HALO} strokeWidth="4" strokeLinejoin="round" />
        <path d="M78 62q20-4 16 18-14 2-16-18z" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1.4" />
        <path d="M88 68q6 4 4 10" fill="#fdf8ef" />
      </g>

      <path
        d="M32 50c-6-2-10-16-4-22 4 6 8 10 14 12zM68 50c6-2 10-16 4-22-4 6-8 10-14 12z"
        fill="rgb(var(--c-accent))"
        stroke={HALO}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <path
        d="M32 50c-6-2-10-16-4-22 4 6 8 10 14 12zM68 50c6-2 10-16 4-22-4 6-8 10-14 12z"
        fill="none"
        stroke={INK}
        strokeOpacity="0.25"
        strokeWidth="1.4"
      />
      <path d="M32 44c-3-2-5-8-3-12 2 4 4 6 7 8zM68 44c3-2 5-8 3-12-2 4-4 6-7 8z" fill="#fdf8ef" />

      <circle cx="50" cy="56" r="30" fill="none" stroke={HALO} strokeWidth="5" />
      <circle cx="50" cy="56" r="30" fill="rgb(var(--c-accent))" />
      <circle cx="50" cy="56" r="30" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1.6" />

      <path d="M50 52c10 0 17 6 17 15-8 3-13 4-17 4s-9-1-17-4c0-9 7-15 17-15z" fill="#fdf8ef" />
      <circle cx="42" cy="54" r="2.8" fill={INK} />
      <circle cx="58" cy="54" r="2.8" fill={INK} />
      <path d="M47 62q3 2 6 0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="59" r="2.2" fill={INK} />
      <circle cx="33" cy="64" r="3.6" fill="#f2879a" fillOpacity="0.6" />
      <circle cx="67" cy="64" r="3.6" fill="#f2879a" fillOpacity="0.6" />
    </svg>
  );
}

// "Neko" — a cat, tail curled, ears twitching. Fur in the secondary
// (gold) accent so it visually pairs with Kitsune without matching it.
export function Neko({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="24" ry="4.5" fill="black" fillOpacity="0.16" />

      <g className="m-wave" style={{ transformOrigin: "76px 78px" }}>
        <path d="M74 78q16 2 14-14-12 0-14 14z" fill="rgb(var(--c-accent-2))" stroke={HALO} strokeWidth="4" strokeLinejoin="round" />
        <path d="M74 78q16 2 14-14-12 0-14 14z" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1.4" />
      </g>

      <path
        d="M30 78c-8 0-14-30-6-42 6 10 12 16 20 20zM70 78c8 0 14-30 6-42-6 10-12 16-20 20z"
        fill="rgb(var(--c-accent-2))"
        stroke={HALO}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M30 78c-8 0-14-30-6-42 6 10 12 16 20 20zM70 78c8 0 14-30 6-42-6 10-12 16-20 20z"
        fill="none"
        stroke={INK}
        strokeOpacity="0.25"
        strokeWidth="1.6"
      />

      <g className="m-twitch">
        <path d="M26 36 18 16l16 12z" fill="rgb(var(--c-accent-2))" stroke={HALO} strokeWidth="3" strokeLinejoin="round" />
        <path d="M28 32 23 20l10 8z" fill="#fdf8ef" />
      </g>
      <path d="M74 36 82 16 66 28z" fill="rgb(var(--c-accent-2))" stroke={HALO} strokeWidth="3" strokeLinejoin="round" />
      <path d="M72 32 77 20l-10 8z" fill="#fdf8ef" />

      <circle cx="50" cy="52" r="28" fill="none" stroke={HALO} strokeWidth="5" />
      <circle cx="50" cy="52" r="28" fill="rgb(var(--c-accent-2))" />
      <circle cx="50" cy="52" r="28" fill="none" stroke={INK} strokeOpacity="0.25" strokeWidth="1.6" />

      <path d="M40 54q-8-2-12 2M60 54q8-2 12 2M40 58q-8 1-12 4M60 58q8 1 12 4" stroke={INK} strokeOpacity="0.4" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M38 47q4-4 8 0M54 47q4-4 8 0" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M46 58q4 3 8 0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="50" cy="55" r="2" fill="#f2879a" />
      <circle cx="34" cy="60" r="3.6" fill="#f2879a" fillOpacity="0.6" />
      <circle cx="66" cy="60" r="3.6" fill="#f2879a" fillOpacity="0.6" />
    </svg>
  );
}

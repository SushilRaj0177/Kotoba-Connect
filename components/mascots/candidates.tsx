// Nine alternative mascot designs, all drawn in the same flat-sticker
// style as Kokeshi (components/Mascot.tsx) and all Japan-themed so any
// of them would slot into the identity without a redesign of anything
// else. Each has a name and a real idle-motion loop (see the .m-* classes
// in globals.css) — never a static image.
type MascotProps = { size?: number; className?: string };

// "Daruma" — the round, limbless wish doll, traditionally rocked upright
// when knocked over. Wobbles side to side like the real toy does.
export function Daruma({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="26" ry="4.5" fill="black" fillOpacity="0.16" />
      <g className="m-wobble">
        <path
          d="M50 8c22 0 34 20 34 42s-14 42-34 42S16 72 16 50 28 8 50 8z"
          fill="rgb(var(--c-accent))"
        />
        <circle cx="50" cy="52" r="26" fill="#fbf3e3" />
        <path d="M28 40a22 22 0 0 1 44 0c-7-4-15-6-22-6s-15 2-22 6z" fill="rgb(var(--c-accent-hover))" />
        <path d="M33 46q6-8 12 0" stroke="#2a2438" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M55 46q6-8 12 0" stroke="#2a2438" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M42 62q8 8 16 0" stroke="#c0392b" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        <text x="50" y="86" textAnchor="middle" fontSize="10" fill="rgb(var(--c-accent-2))" fontWeight="700">
          福
        </text>
      </g>
    </svg>
  );
}

// "Maneki" — the beckoning lucky cat, paw raised and waving.
export function Maneki({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="24" ry="4.5" fill="black" fillOpacity="0.16" />
      <path d="M35 60h30l4 30c1 4-2 6-5 6H36c-3 0-6-2-5-6z" fill="#fdf8ef" stroke="rgb(var(--c-border))" strokeWidth="1.5" />
      <circle cx="50" cy="44" r="26" fill="#fdf8ef" stroke="rgb(var(--c-border))" strokeWidth="1.5" />
      <path d="M28 30 20 12l16 10z" fill="#fdf8ef" stroke="rgb(var(--c-border))" strokeWidth="1.5" />
      <path d="M72 30 80 12 64 22z" fill="#fdf8ef" stroke="rgb(var(--c-border))" strokeWidth="1.5" />
      <path d="M31 28 25 16l12 8z" fill="#f0b8c0" />
      <path d="M69 28 75 16l-12 8z" fill="#f0b8c0" />
      <circle cx="42" cy="44" r="2.6" fill="#2a2438" />
      <circle cx="58" cy="44" r="2.6" fill="#2a2438" />
      <path d="M48 50q2 2 4 0" stroke="#2a2438" strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="34" cy="52" r="3.6" fill="#f0b8c0" fillOpacity="0.8" />
      <circle cx="66" cy="52" r="3.6" fill="#f0b8c0" fillOpacity="0.8" />
      <rect x="30" y="64" width="40" height="6" fill="rgb(var(--c-accent))" />
      <circle cx="50" cy="67" r="4" fill="rgb(var(--c-accent-2))" />
      <g className="m-wave">
        <ellipse cx="78" cy="52" rx="8" ry="14" fill="#fdf8ef" stroke="rgb(var(--c-border))" strokeWidth="1.5" />
      </g>
    </svg>
  );
}

// "Shiba" — a shiba inu face, one ear twitching now and then.
export function Shiba({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="24" ry="4.5" fill="black" fillOpacity="0.16" />
      <path d="M22 30 34 8l14 14z" fill="rgb(var(--c-accent))" />
      <g className="m-twitch">
        <path d="M78 30 66 8 52 22z" fill="rgb(var(--c-accent))" />
      </g>
      <path d="M28 30 36 16l8 10z" fill="#fdf8ef" />
      <path d="M72 30 64 16l-8 10z" fill="#fdf8ef" />
      <circle cx="50" cy="52" r="34" fill="rgb(var(--c-accent))" />
      <path d="M50 40a26 26 0 0 1 26 26c-8-4-17-6-26-6s-18 2-26 6a26 26 0 0 1 26-26z" fill="#fdf8ef" />
      <circle cx="40" cy="48" r="3" fill="#2a2438" />
      <circle cx="60" cy="48" r="3" fill="#2a2438" />
      <ellipse cx="50" cy="58" rx="4" ry="3" fill="#2a2438" />
      <path d="M50 61v4" stroke="#2a2438" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 68q10 6 20 0" stroke="#2a2438" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <ellipse cx="46" cy="72" rx="4" ry="6" fill="#f2879a" />
    </svg>
  );
}

// "Tsuru" — a folded-paper origami crane, wings flapping.
export function Tsuru({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="88" rx="20" ry="4" fill="black" fillOpacity="0.14" />
      <path d="M50 30 30 74h40z" fill="rgb(var(--c-accent))" />
      <path d="M50 30 62 20l8 6-10 12z" fill="rgb(var(--c-accent-hover))" />
      <circle cx="70" cy="24" r="2.4" fill="#2a2438" />
      <g className="m-flap-l">
        <path d="M32 55 4 40l6 22z" fill="rgb(var(--c-accent-2))" />
      </g>
      <g className="m-flap-r">
        <path d="M68 55 96 40l-6 22z" fill="rgb(var(--c-accent-2))" />
      </g>
      <path d="M50 74 42 92l8-6 8 6z" fill="rgb(var(--c-accent-hover))" />
    </svg>
  );
}

// "Mochi" — a soft round rice cake, squishing gently.
export function Mochi({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="86" rx="28" ry="5" fill="black" fillOpacity="0.14" />
      <g className="m-squish">
        <ellipse cx="50" cy="55" rx="34" ry="28" fill="#fdf8ef" stroke="rgb(var(--c-border))" strokeWidth="1.5" />
        <ellipse cx="50" cy="55" rx="34" ry="28" fill="rgb(var(--c-accent))" fillOpacity="0.08" />
        <circle cx="40" cy="50" r="2.6" fill="#2a2438" />
        <circle cx="60" cy="50" r="2.6" fill="#2a2438" />
        <path d="M42 60q8 6 16 0" stroke="#2a2438" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="33" cy="58" r="3.6" fill="#f2879a" fillOpacity="0.7" />
        <circle cx="67" cy="58" r="3.6" fill="#f2879a" fillOpacity="0.7" />
        <circle cx="50" cy="34" r="3" fill="rgb(var(--c-accent-2))" />
      </g>
    </svg>
  );
}

// "Tanuki" — the pot-bellied raccoon dog statue, belly bouncing.
export function Tanuki({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="26" ry="4.5" fill="black" fillOpacity="0.16" />
      <path d="M18 44c0-18 14-30 32-30s32 12 32 30-10 46-32 46-32-28-32-46z" fill="rgb(var(--c-accent-2))" />
      <g className="m-bounce">
        <ellipse cx="50" cy="66" rx="24" ry="22" fill="#fdf8ef" />
        <ellipse cx="50" cy="66" rx="24" ry="22" fill="rgb(var(--c-accent-2))" fillOpacity="0.1" />
      </g>
      <path d="M22 28 12 10l14 8z" fill="rgb(var(--c-accent-hover))" />
      <path d="M78 28 88 10 74 18z" fill="rgb(var(--c-accent-hover))" />
      <ellipse cx="40" cy="36" rx="4" ry="3" fill="#2a2438" />
      <ellipse cx="60" cy="36" rx="4" ry="3" fill="#2a2438" />
      <circle cx="30" cy="44" r="4" fill="#f2879a" fillOpacity="0.7" />
      <circle cx="70" cy="44" r="4" fill="#f2879a" fillOpacity="0.7" />
      <ellipse cx="50" cy="44" rx="6" ry="4" fill="#fdf8ef" />
      <path d="M8 8q10 2 12 12" stroke="rgb(var(--c-green))" strokeWidth="3" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// "Sumo" — a round wrestler with a topknot, stomping in place.
export function Sumo({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="28" ry="4.5" fill="black" fillOpacity="0.18" />
      <g className="m-stomp">
        <circle cx="50" cy="56" r="36" fill="#f0c9a0" />
        <circle cx="50" cy="30" r="4" fill="#2a2438" />
        <rect x="32" y="70" width="36" height="10" rx="5" fill="rgb(var(--c-accent))" />
        <circle cx="38" cy="52" r="3" fill="#2a2438" />
        <circle cx="62" cy="52" r="3" fill="#2a2438" />
        <path d="M36 46q4-4 8 0M56 46q4-4 8 0" stroke="#2a2438" strokeWidth="2" strokeLinecap="round" fill="none" />
        <path d="M40 64q10 6 20 0" stroke="#2a2438" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="32" cy="58" r="4" fill="#f2879a" fillOpacity="0.6" />
        <circle cx="68" cy="58" r="4" fill="#f2879a" fillOpacity="0.6" />
      </g>
    </svg>
  );
}

// "Ramen" — a bowl of noodles with a face peeking out, steam rising.
export function Ramen({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <g opacity="0.7">
        <rect x="44" y="8" width="3" height="14" rx="1.5" fill="rgb(var(--c-text-muted))" className="m-steam" />
        <rect x="53" y="8" width="3" height="14" rx="1.5" fill="rgb(var(--c-text-muted))" className="m-steam" style={{ animationDelay: "0.5s" }} />
        <rect x="62" y="8" width="3" height="14" rx="1.5" fill="rgb(var(--c-text-muted))" className="m-steam" style={{ animationDelay: "1s" }} />
      </g>
      <path d="M20 52h60l-6 20c-2 8-10 14-24 14s-22-6-24-14z" fill="rgb(var(--c-accent))" />
      <path d="M18 46h64a4 4 0 0 1 4 4v2H14v-2a4 4 0 0 1 4-4z" fill="#fdf8ef" stroke="rgb(var(--c-border))" strokeWidth="1.5" />
      <path d="M30 52q6 10 0 18M50 52q-6 10 0 18M70 52q6 10 0 18" stroke="rgb(var(--c-accent-2))" strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="40" cy="66" r="2.6" fill="#2a2438" />
      <circle cx="58" cy="66" r="2.6" fill="#2a2438" />
      <path d="M44 72q6 4 12 0" stroke="#2a2438" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

// "Obake" — a round little ghost, bobbing and blinking.
export function Obake({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="90" rx="18" ry="3.5" fill="black" fillOpacity="0.12" />
      <g className="m-float">
        <path
          d="M50 12c18 0 30 14 30 32v34q-4-6-8 0t-8-6-8 6-8-6-8 6-8 0V44c0-18 12-32 30-32z"
          fill="#fdf8ef"
          stroke="rgb(var(--c-border))"
          strokeWidth="1.5"
        />
        <g className="m-blink">
          <circle cx="40" cy="44" r="3.2" fill="#2a2438" />
          <circle cx="60" cy="44" r="3.2" fill="#2a2438" />
        </g>
        <ellipse cx="50" cy="54" rx="4" ry="5" fill="#2a2438" />
        <circle cx="33" cy="50" r="4" fill="rgb(var(--c-accent-2))" fillOpacity="0.5" />
        <circle cx="67" cy="50" r="4" fill="rgb(var(--c-accent-2))" fillOpacity="0.5" />
      </g>
    </svg>
  );
}

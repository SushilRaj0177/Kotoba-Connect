"use client";

import { useRef } from "react";
import { useMascotGaze } from "@/lib/use-mascot-gaze";

// Mascot candidates alongside Kokeshi (components/Mascot.tsx). Obake was
// kept and reworked after feedback that the first version felt
// "incomplete and messy", then promoted to full co-mascot status
// alongside Kokeshi — equal billing across the site rather than one
// dominant character with a sidekick. Daruma/Maneki/Shiba/Tsuru/Mochi/
// Tanuki/Sumo/Ramen were dropped per direction to replace them with a
// fox and a cat instead. All three here use the same sticker-outline-
// halo technique as Kokeshi so they read as their own element on any
// background color.
type MascotProps = { size?: number; className?: string };
const HALO = "#fdf8ef";
const INK = "#2a2438";

// "Obake" (お化け) — a round little ghost, Kokeshi's co-mascot. Eyes
// track the cursor the same way Kokeshi's do (lib/use-mascot-gaze.ts).
export function Obake({ size = 96, className = "" }: MascotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const eyeLRef = useRef<SVGCircleElement>(null);
  const eyeRRef = useRef<SVGCircleElement>(null);
  useMascotGaze(svgRef, [eyeLRef, eyeRRef], true);

  return (
    <svg ref={svgRef} width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="90" rx="20" ry="4" fill="black" fillOpacity="0.14" />
      <g className="m-float">
        <path
          d="M50 14c17 0 29 13 29 30v32c0 3-3 4-5 2l-4-4-6 6a3 3 0 0 1-4 0l-4-4-4 4a3 3 0 0 1-4 0l-4-4-6 6c-2 2-5 1-5-2V44c0-17 12-30 29-30z"
          fill="none"
          stroke={HALO}
          strokeWidth="2.5"
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
          <circle ref={eyeLRef} cx="41" cy="42" r="3.2" fill={INK} />
          <circle ref={eyeRRef} cx="59" cy="42" r="3.2" fill={INK} />
        </g>
        <path d="M45 52q5 4 10 0" stroke={INK} strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <circle cx="33" cy="48" r="4" fill="rgb(var(--c-accent-2))" fillOpacity="0.5" />
        <circle cx="67" cy="48" r="4" fill="rgb(var(--c-accent-2))" fillOpacity="0.5" />
      </g>
    </svg>
  );
}

// "Kitsune" — a fox. Redone after feedback that the first pass looked
// bad: ears now overlap the head silhouette directly (no floating gap),
// a proper round snout, big sparkly eyes, and a visible swishing tail.
export function Kitsune({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="24" ry="4.5" fill="black" fillOpacity="0.16" />

      {/* tail, swishing behind */}
      <g className="m-wave" style={{ transformOrigin: "82px 70px" }}>
        <path d="M80 60q22-6 16 22-16 4-22-10-4-8 6-12z" fill="rgb(var(--c-accent))" />
        <path d="M80 60q22-6 16 22-16 4-22-10-4-8 6-12z" fill="none" stroke={HALO} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M84 78q6 4 4 10" fill="#fdf8ef" />
      </g>

      {/* ears: base points sit inside the head circle so there's no gap */}
      <path d="M28 38 14 8 46 28z" fill="rgb(var(--c-accent))" stroke={HALO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M72 38 86 8 54 28z" fill="rgb(var(--c-accent))" stroke={HALO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M30 32 21 14 39 26z" fill="#fdf8ef" />
      <path d="M70 32 79 14 61 26z" fill="#fdf8ef" />

      {/* head */}
      <circle cx="50" cy="55" r="30" fill="none" stroke={HALO} strokeWidth="2.5" />
      <circle cx="50" cy="55" r="30" fill="rgb(var(--c-accent))" />
      <circle cx="50" cy="55" r="30" fill="none" stroke={INK} strokeOpacity="0.2" strokeWidth="1.4" />

      {/* snout */}
      <ellipse cx="50" cy="66" rx="15" ry="11" fill="#fdf8ef" />

      {/* face */}
      <circle cx="40" cy="52" r="4" fill={INK} />
      <circle cx="60" cy="52" r="4" fill={INK} />
      <circle cx="41.3" cy="50.3" r="1.3" fill="white" />
      <circle cx="61.3" cy="50.3" r="1.3" fill="white" />
      <path d="M47 63 L53 63 L50 67Z" fill={INK} />
      <path d="M45 68q5 4 10 0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="30" cy="62" r="4.2" fill="#f2879a" fillOpacity="0.65" />
      <circle cx="70" cy="62" r="4.2" fill="#f2879a" fillOpacity="0.65" />
    </svg>
  );
}

// "Neko" — a cat. Redone alongside Kitsune for the same reasons: fused
// ears, bigger sparkly eyes, and whiskers placed as short marks beside
// the cheeks instead of long arcs that read as eyebrows.
export function Neko({ size = 96, className = "" }: MascotProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" className={className} aria-hidden="true">
      <ellipse cx="50" cy="93" rx="24" ry="4.5" fill="black" fillOpacity="0.16" />

      <g className="m-wave" style={{ transformOrigin: "80px 72px" }}>
        <path d="M78 62q20 0 18 22-14 8-22-6-6-10 4-16z" fill="rgb(var(--c-accent-2))" />
        <path d="M78 62q20 0 18 22-14 8-22-6-6-10 4-16z" fill="none" stroke={HALO} strokeWidth="2.5" strokeLinejoin="round" />
      </g>

      <path d="M26 40 16 10 46 30z" fill="rgb(var(--c-accent-2))" stroke={HALO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M74 40 84 10 54 30z" fill="rgb(var(--c-accent-2))" stroke={HALO} strokeWidth="2.5" strokeLinejoin="round" />
      <path d="M28 33 22 16 38 28z" fill="#f2c9c9" />
      <path d="M72 33 78 16 62 28z" fill="#f2c9c9" />

      <circle cx="50" cy="55" r="30" fill="none" stroke={HALO} strokeWidth="2.5" />
      <circle cx="50" cy="55" r="30" fill="rgb(var(--c-accent-2))" />
      <circle cx="50" cy="55" r="30" fill="none" stroke={INK} strokeOpacity="0.2" strokeWidth="1.4" />

      <circle cx="40" cy="54" r="4.4" fill={INK} />
      <circle cx="60" cy="54" r="4.4" fill={INK} />
      <circle cx="41.4" cy="52.2" r="1.4" fill="white" />
      <circle cx="61.4" cy="52.2" r="1.4" fill="white" />
      <path d="M32 60h-9M31 65h-8M68 60h9M69 65h8" stroke={INK} strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M48 63q2 2 4 0" stroke="#f2879a" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <path d="M43 68q7 5 14 0" stroke={INK} strokeWidth="2" strokeLinecap="round" fill="none" />
      <circle cx="32" cy="63" r="4.2" fill="#f2879a" fillOpacity="0.65" />
      <circle cx="68" cy="63" r="4.2" fill="#f2879a" fillOpacity="0.65" />
    </svg>
  );
}

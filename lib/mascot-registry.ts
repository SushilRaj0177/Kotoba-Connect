// Every mascot design currently in play, named, so a later "revert back
// to <name>" request is a one-line change: swap which import
// components/Mascot.tsx re-exports. This file is just the catalog for
// browsing/reference (see app/dev/mascots for the live gallery) — it
// doesn't control which one is active.
//
// Daruma, Maneki, Shiba, Tsuru, Mochi, Tanuki, Sumo, and Ramen were tried
// and dropped in favor of Kitsune and Neko; their code was removed
// rather than kept around unused.
export const MASCOT_CATALOG = [
  { id: "kokeshi", name: "Kokeshi", blurb: "The current mascot — a painted wooden folk doll, gently swaying." },
  { id: "obake", name: "Obake", blurb: "A round little ghost, bobbing and blinking." },
  { id: "kitsune", name: "Kitsune", blurb: "A fox with ears up, tail swishing." },
  { id: "neko", name: "Neko", blurb: "A cat, tail curled, ears twitching." },
] as const;

export type MascotId = (typeof MASCOT_CATALOG)[number]["id"];

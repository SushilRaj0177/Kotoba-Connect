// Every mascot design that's been tried, named, so a later "revert back
// to <name>" request is a one-line change: swap which import
// components/Mascot.tsx re-exports. This file is just the catalog for
// browsing/reference (see app/dev/mascots for the live gallery) — it
// doesn't control which one is active.
export const MASCOT_CATALOG = [
  { id: "kokeshi", name: "Kokeshi", blurb: "The current mascot — a painted wooden folk doll, gently swaying." },
  { id: "daruma", name: "Daruma", blurb: "The round wish doll that always rocks back upright — wobbles side to side." },
  { id: "maneki", name: "Maneki", blurb: "The beckoning lucky cat, waving a raised paw." },
  { id: "shiba", name: "Shiba", blurb: "A shiba inu face with a twitching ear." },
  { id: "tsuru", name: "Tsuru", blurb: "A folded-paper origami crane, flapping its wings." },
  { id: "mochi", name: "Mochi", blurb: "A soft round rice cake, squishing gently." },
  { id: "tanuki", name: "Tanuki", blurb: "The pot-bellied raccoon dog statue, belly bouncing." },
  { id: "sumo", name: "Sumo", blurb: "A round wrestler with a topknot, stomping in place." },
  { id: "ramen", name: "Ramen", blurb: "A bowl of noodles with a face peeking out, steam rising." },
  { id: "obake", name: "Obake", blurb: "A round little ghost, bobbing and blinking." },
] as const;

export type MascotId = (typeof MASCOT_CATALOG)[number]["id"];

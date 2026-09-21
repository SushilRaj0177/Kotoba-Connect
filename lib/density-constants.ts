// Split from lib/density.ts the same way theme-constants.ts is split from
// theme.ts: that file imports next/headers (server-only), so client
// components import the shared type/constant from here instead.
//
// Independent of color theme (light/dark/edge) — this controls how much of
// a card's secondary content (right now: the AI pragmatic-read box) shows
// by default versus sits behind a click-to-expand toggle. Edge's own layout
// already renders collapsed regardless of this setting (it's a deliberately
// different, denser layout end to end); this setting is what lets someone
// on light or dark theme get that same "collapsed by default" behavior
// without switching their whole color theme to get it.
export type CardDensity = "comfortable" | "compact";
export const DENSITY_COOKIE = "card_density";

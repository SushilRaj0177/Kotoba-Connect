import { ImageResponse } from "next/og";

// 512px so the same generated image works both as the small browser-tab
// favicon (browsers downscale fine) and as the large PWA install icon
// declared in manifest.ts — Chrome's install-eligibility check wants at
// least a 192px icon, and claiming a size we didn't actually generate
// would have looked worse than just generating it at that size.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// The app's actual character — Kokeshi (components/Mascot.tsx), the
// wooden-doll co-mascot — bolted down into an icon-legible mark, instead
// of an abstract shape that could belong to any app. On a home screen
// full of monogram/wordmark icons, a genuinely illustrated character is
// what actually stands out and gets remembered — that's the whole point
// of having a mascot rather than a lettermark in the first place.
//
// This is a deliberately different (much bolder, much simpler) drawing
// from the on-page Mascot, not a shrunk copy of it — the on-page version
// has fine linework (a thin halo stroke, blush circles, a gloss
// highlight, a hairline body outline) that reads fine at 26-96px next to
// UI text, but turns to mud at a 16px favicon or a phone's actual
// rendered home-screen icon size. Every shape here is picked to still
// read clearly that small: two solid eye dots, one thick smile stroke,
// one flat hair cap, one flat obi band — no gradients, no hairline
// strokes, nothing under ~4% of the icon's width.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#5f7a44",
          borderRadius: 96,
        }}
      >
        <svg width="512" height="512" viewBox="0 0 100 100">
          {/* body — a simple rounded-bottom cylinder, cream against the
             green background instead of the on-page version's green body
             (which would vanish into this icon's own green fill) */}
          <path
            d="M27 47c0-4 1.5-6.5 3-8 4-3.5 8-4.5 20-4.5s16 1 20 4.5c1.5 1.5 3 4 3 8l3 32c1 8-4.5 15-12.5 15H36.5c-8 0-13.5-7-12.5-15z"
            fill="#fbf3e3"
          />

          {/* obi band, indigo — the aizome accent, as a bold flat stripe
             instead of the thin patterned band the on-page version uses */}
          <path d="M23.5 62h53l2 12h-57z" fill="#3d4a7a" />
          <circle cx="50" cy="68" r="5" fill="#d8b462" />

          {/* head */}
          <circle cx="50" cy="30" r="25" fill="#fbf3e3" />

          {/* hair cap — one flat shape, no strand linework */}
          <path d="M25.5 26a24.5 24.5 0 0 1 49 0c-7-4-15.5-6-24.5-6s-17.5 2-24.5 6z" fill="#3d4a7a" />

          {/* face — bold enough to survive a 16px favicon */}
          <circle cx="41.5" cy="32" r="3.6" fill="#2a2438" />
          <circle cx="58.5" cy="32" r="3.6" fill="#2a2438" />
          <path d="M43 42q7 7 14 0" stroke="#2a2438" strokeWidth="4" strokeLinecap="round" fill="none" />
        </svg>
      </div>
    ),
    size
  );
}

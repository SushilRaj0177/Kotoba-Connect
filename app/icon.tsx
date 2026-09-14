import { ImageResponse } from "next/og";

// 512px so the same generated image works both as the small browser-tab
// favicon (browsers downscale fine) and as the large PWA install icon
// declared in manifest.ts — Chrome's install-eligibility check wants at
// least a 192px icon, and claiming a size we didn't actually generate
// would have looked worse than just generating it at that size.
export const size = { width: 512, height: 512 };
export const contentType = "image/png";

// A pure-shape mark, not text — the previous version relied on the
// system font rendering the kanji glyph "言" inside Satori (next/og's
// renderer), which doesn't reliably ship CJK coverage and was rendering
// badly. Three stacked bars nod at 言 (speech/words) without depending on
// any font glyph, so it can't break the same way, and it stays in sync
// with the current accent color instead of a hardcoded leftover hex.
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          background: "#688c4a",
          borderRadius: 40,
        }}
      >
        <div style={{ width: 92, height: 16, borderRadius: 8, background: "#fbf3e3" }} />
        <div style={{ width: 92, height: 16, borderRadius: 8, background: "#fbf3e3" }} />
        <div style={{ width: 56, height: 16, borderRadius: 8, background: "#d8b462" }} />
      </div>
    ),
    size
  );
}

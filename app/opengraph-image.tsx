import { ImageResponse } from "next/og";
import { loadNotoSansJP } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

export default async function OgImage() {
  const fontData = await loadNotoSansJP("言葉");

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
          gap: 28,
          background: "#fbf3e3",
        }}
      >
        <span style={{ fontSize: 160, fontWeight: 700, color: "#688c4a", fontFamily: "Noto Sans JP" }}>
          言葉
        </span>
        <span style={{ fontSize: 34, fontWeight: 600, color: "#2a2438", letterSpacing: 1 }}>
          KOTOBA ENGINE — Japanese Pragmatics Board
        </span>
        <span style={{ fontSize: 24, color: "#6b6458", maxWidth: 820, textAlign: "center" }}>
          The cultural nuance behind real Japanese text — beyond dictionary definitions.
        </span>
      </div>
    ),
    { ...size, fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }] }
  );
}

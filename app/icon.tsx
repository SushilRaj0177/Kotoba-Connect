import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#ff3d7f",
          borderRadius: 40,
          color: "white",
          fontSize: 96,
          fontWeight: 900,
        }}
      >
        言
      </div>
    ),
    size
  );
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kotoba Engine 言葉",
    short_name: "Kotoba",
    description: "A community board for annotating the pragmatic, cultural nuance behind real Japanese text.",
    start_url: "/",
    display: "standalone",
    background_color: "#171412",
    theme_color: "#688c4a",
    icons: [
      { src: "/kotoba-mark-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/kotoba-mark-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      // Full-bleed with the artwork inside the central safe zone, so
      // Android's circle/squircle masks don't crop it.
      { src: "/kotoba-mark-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

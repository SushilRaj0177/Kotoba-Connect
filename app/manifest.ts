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
      { src: "/icon", sizes: "180x180", type: "image/png" },
      { src: "/icon", sizes: "192x192", type: "image/png" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

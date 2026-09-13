import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kotoba Engine 言葉",
    short_name: "Kotoba",
    description: "A community board for annotating the pragmatic, cultural nuance behind real Japanese text.",
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#ff3d7f",
    icons: [
      { src: "/icon", sizes: "180x180", type: "image/png" },
    ],
  };
}

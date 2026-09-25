import type { MetadataRoute } from "next";

// Bumped whenever app/icon.tsx's actual artwork changes. Unlike the
// favicon <link> tag (which Next.js content-hashes automatically), this
// manifest's icon URLs are plain strings, and installed PWAs / Chrome's
// tab-switcher cache icons by that exact URL — so without a version query
// param here, a new icon.tsx never gets picked up on existing installs.
const ICON_VERSION = "2";

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
      { src: `/icon?v=${ICON_VERSION}`, sizes: "180x180", type: "image/png" },
      { src: `/icon?v=${ICON_VERSION}`, sizes: "192x192", type: "image/png" },
      { src: `/icon?v=${ICON_VERSION}`, sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}

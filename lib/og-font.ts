// Satori (next/og's renderer) ships no CJK glyph coverage on its own, which
// is exactly why app/icon.tsx had to drop the kanji glyph entirely. OG
// images for entry pages need to actually show the Japanese sentence, so we
// fetch just the glyphs in play from Google Fonts' CSS API instead — the
// `text=` param returns a subsetted font containing only those characters,
// and requesting without a browser User-Agent makes Google serve a
// Satori-compatible truetype file instead of woff2.
export async function loadNotoSansJP(text: string, weight: 400 | 500 | 700 = 700): Promise<ArrayBuffer> {
  const cssUrl = `https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@${weight}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(cssUrl)).text();
  const match = css.match(/src: url\(([^)]+)\) format\('(?:opentype|truetype)'\)/);
  if (!match) throw new Error("Could not resolve Noto Sans JP font source");
  const res = await fetch(match[1]);
  if (!res.ok) throw new Error("Failed to download Noto Sans JP font data");
  return res.arrayBuffer();
}

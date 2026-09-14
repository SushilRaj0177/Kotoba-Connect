import { ImageResponse } from "next/og";
import { createClient } from "@/lib/supabase/server";
import { loadNotoSansJP } from "@/lib/og-font";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "nodejs";

const FORMALITY_LABEL: Record<string, string> = {
  Sonkeigo: "Sonkeigo",
  Kenjougo: "Kenjougo",
  Teineigo: "Teineigo",
  Casual: "Casual",
  Slang: "Slang",
  Dialect: "Dialect",
};

function truncate(text: string, max: number) {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

export default async function EntryOgImage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: entry } = await supabase
    .from("context_entries")
    .select("raw_japanese, primary_translation, formality_level, tags")
    .eq("id", params.id)
    .single();

  const japanese = truncate(entry?.raw_japanese ?? "言葉", 60);
  const translation = truncate(entry?.primary_translation ?? "A Japanese pragmatics board.", 110);
  const formality = entry?.formality_level ? FORMALITY_LABEL[entry.formality_level] : null;
  const tags = (entry?.tags ?? []).slice(0, 3);

  const fontData = await loadNotoSansJP(`${japanese}言葉${formality ?? ""}${tags.join("")}`);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          background: "#fbf3e3",
          fontFamily: "Noto Sans JP",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ display: "flex", width: 30, height: 6, borderRadius: 3, background: "#688c4a" }} />
          <span style={{ fontSize: 26, fontWeight: 700, color: "#688c4a", letterSpacing: 1 }}>
            言葉 KOTOBA ENGINE
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <span
            style={{
              fontSize: japanese.length > 24 ? 56 : 72,
              fontWeight: 700,
              color: "#2a2438",
              lineHeight: 1.25,
            }}
          >
            {japanese}
          </span>
          <span style={{ fontSize: 32, color: "#6b6458", lineHeight: 1.4 }}>{translation}</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {formality && (
            <span
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 700,
                color: "#fbf3e3",
                background: "#688c4a",
                padding: "8px 20px",
                borderRadius: 999,
              }}
            >
              {formality}
            </span>
          )}
          {tags.map((tag: string) => (
            <span
              key={tag}
              style={{
                display: "flex",
                fontSize: 22,
                color: "#688c4a",
                background: "#eee3c8",
                padding: "8px 20px",
                borderRadius: 999,
              }}
            >
              #{tag}
            </span>
          ))}
        </div>
      </div>
    ),
    { ...size, fonts: [{ name: "Noto Sans JP", data: fontData, weight: 700, style: "normal" }] }
  );
}

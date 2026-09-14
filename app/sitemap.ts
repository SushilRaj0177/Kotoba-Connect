import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kotoba-connect-three.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient();
  const { data: entries } = await supabase
    .from("context_entries")
    .select("id, created_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "hourly", priority: 1 },
    { url: `${SITE_URL}/leaderboard`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/login`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const entryRoutes: MetadataRoute.Sitemap = (entries ?? []).map((e) => ({
    url: `${SITE_URL}/entries/${e.id}`,
    lastModified: e.created_at,
    changeFrequency: "weekly",
    priority: 0.5,
  }));

  return [...staticRoutes, ...entryRoutes];
}

import type { Metadata } from "next";
import BoardView from "@/components/BoardView";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export const metadata: Metadata = {
  title: "Board",
  description: "Real Japanese sentences, annotated word by word with the pragmatic nuance a dictionary won't tell you.",
};

export default function BoardPage() {
  return <BoardView />;
}

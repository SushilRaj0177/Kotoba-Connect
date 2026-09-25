import BoardView from "@/components/BoardView";
import LandingPage from "@/components/LandingPage";
import { getCurrentUser } from "@/lib/supabase/server";

// Edge Runtime: no cold-start container spin-up like Vercel's default
// Node.js functions pay on every infrequently-hit route — this page only
// touches @supabase/ssr + next/headers, both edge-compatible.
export const runtime = "edge";

export default async function HomePage() {
  const user = await getCurrentUser();
  return user ? <BoardView /> : <LandingPage />;
}

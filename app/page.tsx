import BoardView from "@/components/BoardView";
import LandingPage from "@/components/LandingPage";
import { getCurrentUser } from "@/lib/supabase/server";

export default async function HomePage() {
  const user = await getCurrentUser();
  return user ? <BoardView /> : <LandingPage />;
}

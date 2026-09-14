import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

// See lib/supabase/client.ts for why this client isn't parameterized with
// the hand-written Database type.
export function createClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component; middleware refreshes the session instead.
          }
        },
      },
    }
  );
}

// auth.getUser() is a real network round-trip to Supabase's auth server
// (it verifies the JWT server-side, unlike the cookie-only getSession()),
// and Navbar, the page itself, RightRail, etc. each used to call it
// independently — 2-4 redundant round-trips stacked serially on every
// single page load, which is exactly the kind of thing that makes
// "switching pages" feel slow. React's cache() memoizes this per
// request, so no matter how many components call getCurrentUser() during
// one render, the actual network call happens once.
export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Same idea for the signed-in user's own profile row (username, is_admin,
// etc.) — Navbar, the home page, settings, and admin all wanted it
// separately. One query per request instead of one per component.
export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;
  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies, headers } from "next/headers";
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

// auth.getUser() is a real network round-trip to Supabase's auth server —
// middleware (lib/supabase/middleware.ts) already makes exactly this call
// on every request to refresh/validate the session, and used to be
// immediately followed by a second, identical round-trip here on every
// single navigation. Middleware now forwards the verified id via the
// x-kotoba-user-id request header, so when it's present we can trust the
// session cookie (already validated this request) and read it locally via
// getSession() — no network call — instead of re-verifying from scratch.
// React's cache() still memoizes this per request on top of that, so no
// matter how many components call getCurrentUser(), the work happens once.
export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const verifiedId = headers().get("x-kotoba-user-id");

  if (verifiedId === "") return null;
  if (verifiedId) {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (session?.user?.id === verifiedId) return session.user;
  }

  // Fallback for any render path middleware didn't cover.
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

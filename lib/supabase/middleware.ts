import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// auth.getUser() is a real network round-trip to Supabase's auth server on
// every single request — the dominant source of per-navigation latency,
// since nothing else on the page can start until it resolves. auth.getSession()
// instead just reads/decodes the session cookie locally: no network call, but
// it trusts the token until its own expiry rather than re-confirming with
// Supabase that the session is still actually valid (a revoked session,
// e.g. from a ban, stays looking "signed in" here until the token expires).
//
// Split the difference: ordinary page navigation (the overwhelming bulk of
// traffic) uses the fast local check, re-verified for real at most every
// REVALIDATE_INTERVAL_MS so a revoked session can't ride on the fast path
// for longer than that bounded window. API routes — where this app's own
// server-side code makes an authorization decision (account deletion, admin
// actions) — always pay for the real check, since that's the surface where
// a stale "still looks signed in" actually matters.
const REVALIDATE_COOKIE = "kotoba-auth-verified-at";
const REVALIDATE_INTERVAL_MS = 5 * 60 * 1000;

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  const lastVerified = Number(request.cookies.get(REVALIDATE_COOKIE)?.value ?? 0);
  const needsRevalidation = Date.now() - lastVerified > REVALIDATE_INTERVAL_MS;

  let userId: string | null;

  if (isApiRoute || needsRevalidation) {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
    // Only stamped after an actual live check — the fast path below never
    // touches this, so it can't extend the window by resetting the clock
    // on its own.
    response.cookies.set(REVALIDATE_COOKIE, String(Date.now()), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    });
  } else {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    userId = session?.user?.id ?? null;
  }

  // Forward the resolved user id to the Server Component render via a
  // request header, so lib/supabase/server.ts's getCurrentUser() can reuse
  // it without another round-trip — see the comment there for how it's
  // consumed. Cookies that Supabase's setAll may have queued (token
  // refresh, or the revalidation stamp above) are preserved by copying
  // them onto the new response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kotoba-user-id", userId ?? "");
  const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.getAll().forEach((cookie) => finalResponse.cookies.set(cookie));

  return finalResponse;
}

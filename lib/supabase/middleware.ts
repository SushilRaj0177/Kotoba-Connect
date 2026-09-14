import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

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

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Forward the already-validated user id to the Server Component render via
  // a request header, so lib/supabase/server.ts's getCurrentUser() can skip
  // a second full auth.getUser() network round-trip to Supabase for the same
  // request — middleware already did that verification. This cuts one of
  // the two serial Supabase Auth calls that used to happen on every single
  // navigation (middleware, then the page/layout render). Cookies that
  // Supabase's setAll may have queued (token refresh) are preserved by
  // copying them onto the new response.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-kotoba-user-id", user?.id ?? "");
  const finalResponse = NextResponse.next({ request: { headers: requestHeaders } });
  response.cookies.getAll().forEach((cookie) => finalResponse.cookies.set(cookie));

  return finalResponse;
}

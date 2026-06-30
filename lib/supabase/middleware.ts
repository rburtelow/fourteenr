import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANT: Do not remove this line.
  // Refreshes the auth token and keeps the session alive.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes: redirect to login if not authenticated
  const protectedPaths = ["/profile", "/community"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // If user is authenticated but has no screen_name, redirect to setup.
  // We cache the result in a short-lived cookie (_pp_ok) so we only hit
  // the DB once per browser session rather than on every request.
  const skipPaths = ["/auth/setup-profile", "/auth/callback", "/auth/login", "/auth/signup"];
  if (user && !skipPaths.some((p) => request.nextUrl.pathname.startsWith(p))) {
    const profileOkCookie = request.cookies.get("_pp_ok");
    if (!profileOkCookie) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("screen_name")
        .eq("id", user.id)
        .single();

      if (profile && !profile.screen_name) {
        const url = request.nextUrl.clone();
        url.pathname = "/auth/setup-profile";
        return NextResponse.redirect(url);
      }
      // Profile is complete — cache for 24 hours so we skip the DB call.
      supabaseResponse.cookies.set("_pp_ok", "1", {
        maxAge: 60 * 60 * 24,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  // If user is logged in and tries to visit auth pages, redirect to home
  if (
    user &&
    (request.nextUrl.pathname === "/auth/login" ||
      request.nextUrl.pathname === "/auth/signup")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

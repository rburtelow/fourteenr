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
  const protectedPaths = ["/profile", "/community", "/admin"];
  const isProtectedRoute = protectedPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    url.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Admin routes: verify admin role, cache result in _adm cookie (mirrors _pp_ok pattern)
  if (user && request.nextUrl.pathname.startsWith("/admin")) {
    const admCookie = request.cookies.get("_adm");
    if (!admCookie) {
      const { data: isAdminResult } = await supabase.rpc("is_admin", { uid: user.id });
      if (!isAdminResult) {
        const url = request.nextUrl.clone();
        url.pathname = "/";
        return NextResponse.redirect(url);
      }
      supabaseResponse.cookies.set("_adm", "1", {
        maxAge: 60 * 60, // 1 hour
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
  }

  // Throttled last_seen update: write at most once per 5 minutes per user.
  // The _seen cookie gates the write so we don't hit the DB on every request.
  if (user && !request.nextUrl.pathname.startsWith("/auth")) {
    const seenCookie = request.cookies.get("_seen");
    if (!seenCookie) {
      supabase.from("profiles").update({ last_seen: new Date().toISOString() }).eq("id", user.id)
        .then(() => {});
      supabaseResponse.cookies.set("_seen", "1", {
        maxAge: 60 * 5, // 5 minutes
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }
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

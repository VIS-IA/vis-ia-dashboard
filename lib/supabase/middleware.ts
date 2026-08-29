import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// If Supabase is slow to respond (e.g. right after a period of
// inactivity), don't let the middleware hang until Vercel's own hard
// cutoff kicks in and shows an ugly 504. Give up after this long and
// fail gracefully instead.
const AUTH_CHECK_TIMEOUT_MS = 8000;

function fetchWithTimeout(timeoutMs: number) {
  return async (input: RequestInfo | URL, init?: RequestInit) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
}

/**
 * Refreshes the Supabase auth session on every request and decides
 * whether a request to a protected route should be redirected to /login.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        fetch: fetchWithTimeout(AUTH_CHECK_TIMEOUT_MS),
      },
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({ name, value, ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({ request: { headers: request.headers } });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const isProtectedRoute = request.nextUrl.pathname.startsWith("/panel");
  const isLoginRoute = request.nextUrl.pathname.startsWith("/login");

  let user = null;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch {
    // Supabase didn't respond in time. Fail open here rather than
    // hang: let the request through. The page itself will still
    // check auth before showing any client data, so this never
    // leaks anything — worst case is a slower page instead of a
    // hard error screen.
    return response;
  }

  if (!user && isProtectedRoute) {
    const redirectUrl = new URL("/login", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isLoginRoute) {
    const redirectUrl = new URL("/panel", request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return response;
}

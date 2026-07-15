import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { getSupabaseRuntimeConfig } from "@/lib/config/environment";

function createSignInUrl(request: NextRequest): URL {
  const signInUrl = new URL("/auth/sign-in", request.url);
  signInUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );
  return signInUrl;
}

export async function updateSupabaseSession(
  request: NextRequest,
): Promise<NextResponse> {
  let response = NextResponse.next({ request });
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    return response;
  }

  const supabase = createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => {
          request.cookies.set(name, value);
        });
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, options, value }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const { data, error } = await supabase.auth.getClaims();
  const hasAuthenticatedIdentity = !error && Boolean(data?.claims.sub);

  if (
    request.nextUrl.pathname.startsWith("/app") &&
    !hasAuthenticatedIdentity
  ) {
    return NextResponse.redirect(createSignInUrl(request));
  }

  if (request.nextUrl.pathname === "/" && hasAuthenticatedIdentity) {
    return NextResponse.redirect(new URL("/app", request.url));
  }

  return response;
}

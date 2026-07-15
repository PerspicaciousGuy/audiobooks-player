import { NextResponse, type NextRequest } from "next/server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/features/auth/redirects";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
  );
  const supabase = await createServerSupabaseClient();

  if (!code || !supabase) {
    return NextResponse.redirect(
      new URL("/auth/error?reason=callback", request.url),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL("/auth/error?reason=exchange", request.url),
    );
  }

  return NextResponse.redirect(new URL(nextPath, request.url));
}

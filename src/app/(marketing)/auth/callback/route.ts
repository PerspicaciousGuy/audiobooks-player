import { NextResponse, type NextRequest } from "next/server";

import {
  createApplicationRedirectUrl,
  getSafeRedirectPath,
} from "@/features/auth/redirects";
import { environment } from "@/lib/config/environment";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const code = request.nextUrl.searchParams.get("code");
  const nextPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next"),
  );
  const supabase = await createServerSupabaseClient();

  if (!code || !supabase) {
    return NextResponse.redirect(
      createApplicationRedirectUrl(
        environment.appUrl,
        "/auth/error?reason=callback",
      ),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      createApplicationRedirectUrl(
        environment.appUrl,
        "/auth/error?reason=exchange",
      ),
    );
  }

  return NextResponse.redirect(
    createApplicationRedirectUrl(environment.appUrl, nextPath),
  );
}

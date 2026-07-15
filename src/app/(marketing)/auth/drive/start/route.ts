import { NextResponse, type NextRequest } from "next/server";

import { getSafeRedirectPath } from "@/features/auth/redirects";
import { getAuthenticatedIdentity } from "@/features/auth/session";
import { getGoogleDriveRuntimeConfig } from "@/features/drive/config";
import { createGoogleDriveAuthorizationUrl } from "@/features/drive/googleOAuth";
import {
  createDriveOAuthAttempt,
  DRIVE_OAUTH_COOKIE_MAX_AGE_SECONDS,
  DRIVE_OAUTH_COOKIE_NAME,
} from "@/features/drive/oauthState";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    const signInUrl = new URL("/auth/sign-in", request.url);
    signInUrl.searchParams.set("next", "/app/onboarding");
    return NextResponse.redirect(signInUrl);
  }

  const config = getGoogleDriveRuntimeConfig();

  if (!config) {
    return NextResponse.redirect(
      new URL("/app/onboarding?drive=unavailable", request.url),
    );
  }

  const nextPath = getSafeRedirectPath(
    request.nextUrl.searchParams.get("next") ?? "/app/onboarding",
  );
  const attempt = createDriveOAuthAttempt(
    identity.id,
    nextPath,
    config.tokenEncryptionKey,
  );
  const authorizationUrl = createGoogleDriveAuthorizationUrl(
    config,
    attempt.state,
    attempt.codeChallenge,
  );
  const response = NextResponse.redirect(authorizationUrl);
  response.cookies.set(DRIVE_OAUTH_COOKIE_NAME, attempt.cookieValue, {
    httpOnly: true,
    maxAge: DRIVE_OAUTH_COOKIE_MAX_AGE_SECONDS,
    path: "/auth/drive/callback",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

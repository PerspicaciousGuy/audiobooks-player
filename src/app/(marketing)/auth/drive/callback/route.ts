import { NextResponse, type NextRequest } from "next/server";

import { createApplicationRedirectUrl } from "@/features/auth/redirects";
import { getAuthenticatedIdentity } from "@/features/auth/session";
import { getGoogleDriveRuntimeConfig } from "@/features/drive/config";
import {
  DRIVE_FILE_SCOPE,
  exchangeGoogleDriveCode,
  getGoogleDriveSubject,
} from "@/features/drive/googleOAuth";
import {
  DRIVE_OAUTH_COOKIE_NAME,
  verifyDriveOAuthAttempt,
} from "@/features/drive/oauthState";
import {
  getDriveConnection,
  saveDriveConnection,
} from "@/features/drive/repository";
import {
  decryptDriveCredentials,
  encryptDriveCredentials,
} from "@/features/drive/tokenEncryption";
import { environment } from "@/lib/config/environment";

function redirectWithDriveStatus(path: string, status: string): NextResponse {
  const url = createApplicationRedirectUrl(environment.appUrl, path);
  url.searchParams.set("drive", status);
  const response = NextResponse.redirect(url);
  response.cookies.set(DRIVE_OAUTH_COOKIE_NAME, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/auth/drive/callback",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return response;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const identity = await getAuthenticatedIdentity();
  const config = getGoogleDriveRuntimeConfig();

  if (!identity || !config) {
    return redirectWithDriveStatus("/app/onboarding", "unavailable");
  }

  const attempt = verifyDriveOAuthAttempt(
    request.cookies.get(DRIVE_OAUTH_COOKIE_NAME)?.value,
    request.nextUrl.searchParams.get("state") ?? undefined,
    identity.id,
    config.tokenEncryptionKey,
  );

  if (!attempt) {
    return redirectWithDriveStatus("/app/onboarding", "invalid-state");
  }

  if (request.nextUrl.searchParams.has("error")) {
    return redirectWithDriveStatus(attempt.nextPath, "cancelled");
  }

  const code = request.nextUrl.searchParams.get("code");

  if (!code) {
    return redirectWithDriveStatus(attempt.nextPath, "failed");
  }

  try {
    const grant = await exchangeGoogleDriveCode(config, code, attempt.verifier);

    if (!grant.scopes.includes(DRIVE_FILE_SCOPE)) {
      return redirectWithDriveStatus(attempt.nextPath, "scope-denied");
    }

    const existingConnection = await getDriveConnection(identity.id);
    const existingCredentials = existingConnection
      ? decryptDriveCredentials(
          existingConnection.encryptedTokenEnvelope,
          config.tokenEncryptionKey,
          identity.id,
        )
      : undefined;
    const refreshToken =
      grant.refreshToken ?? existingCredentials?.refreshToken;

    if (!refreshToken) {
      return redirectWithDriveStatus(attempt.nextPath, "failed");
    }

    const googleSubject = await getGoogleDriveSubject(grant.accessToken);
    const encryptedTokenEnvelope = encryptDriveCredentials(
      {
        accessToken: grant.accessToken,
        expiresAt: grant.expiresAt,
        refreshToken,
        scope: grant.scopes,
        tokenType: grant.tokenType,
      },
      config.tokenEncryptionKey,
      identity.id,
    );

    await saveDriveConnection({
      accessTokenExpiresAt: grant.expiresAt,
      encryptedTokenEnvelope,
      googleSubject,
      grantedScopes: grant.scopes,
      userId: identity.id,
    });

    return redirectWithDriveStatus(attempt.nextPath, "connected");
  } catch {
    return redirectWithDriveStatus(attempt.nextPath, "failed");
  }
}

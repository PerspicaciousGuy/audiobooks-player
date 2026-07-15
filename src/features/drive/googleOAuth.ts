import "server-only";

import { z } from "zod";

import type { GoogleDriveRuntimeConfig } from "./config";

export const DRIVE_FILE_SCOPE = "https://www.googleapis.com/auth/drive.file";

const tokenResponseSchema = z.object({
  access_token: z.string().min(1),
  expires_in: z.number().int().positive(),
  refresh_token: z.string().min(1).optional(),
  scope: z.string().optional(),
  token_type: z.string().min(1),
});

const driveAboutSchema = z.object({
  user: z.object({ permissionId: z.string().min(1) }),
});

export interface GoogleTokenGrant {
  accessToken: string;
  expiresAt: string;
  refreshToken?: string;
  scopes: string[];
  tokenType: string;
}

function callbackUrl(config: GoogleDriveRuntimeConfig): string {
  return new URL("/auth/drive/callback", config.appUrl).toString();
}

async function fetchWithTimeout(
  input: string,
  init: RequestInit,
): Promise<Response> {
  return fetch(input, {
    ...init,
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });
}

export function createGoogleDriveAuthorizationUrl(
  config: GoogleDriveRuntimeConfig,
  state: string,
  codeChallenge: string,
): URL {
  const url = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("client_id", config.clientId);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("include_granted_scopes", "true");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("redirect_uri", callbackUrl(config));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", DRIVE_FILE_SCOPE);
  url.searchParams.set("state", state);
  return url;
}

export async function exchangeGoogleDriveCode(
  config: GoogleDriveRuntimeConfig,
  code: string,
  codeVerifier: string,
): Promise<GoogleTokenGrant> {
  const response = await fetchWithTimeout(
    "https://oauth2.googleapis.com/token",
    {
      body: new URLSearchParams({
        client_id: config.clientId,
        client_secret: config.clientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: "authorization_code",
        redirect_uri: callbackUrl(config),
      }),
      headers: { "content-type": "application/x-www-form-urlencoded" },
      method: "POST",
    },
  );

  if (!response.ok) {
    throw new Error("Google rejected the Drive authorization exchange.");
  }

  const token = tokenResponseSchema.parse(await response.json());

  return {
    accessToken: token.access_token,
    expiresAt: new Date(Date.now() + token.expires_in * 1_000).toISOString(),
    ...(token.refresh_token ? { refreshToken: token.refresh_token } : {}),
    scopes: token.scope?.split(" ").filter(Boolean) ?? [DRIVE_FILE_SCOPE],
    tokenType: token.token_type,
  };
}

export async function getGoogleDriveSubject(
  accessToken: string,
): Promise<string> {
  const response = await fetchWithTimeout(
    "https://www.googleapis.com/drive/v3/about?fields=user(permissionId)",
    { headers: { authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new Error("Google Drive account validation failed.");
  }

  return driveAboutSchema.parse(await response.json()).user.permissionId;
}

export async function revokeGoogleToken(token: string): Promise<boolean> {
  const url = new URL("https://oauth2.googleapis.com/revoke");
  url.searchParams.set("token", token);
  const response = await fetchWithTimeout(url.toString(), {
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
  });

  return response.ok || response.status === 400;
}

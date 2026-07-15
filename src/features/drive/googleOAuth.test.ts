import { afterEach, describe, expect, it, vi } from "vitest";

import type { GoogleDriveRuntimeConfig } from "./config";
import {
  DRIVE_FILE_SCOPE,
  createGoogleDriveAuthorizationUrl,
  exchangeGoogleDriveCode,
  refreshGoogleDriveAccess,
  revokeGoogleToken,
} from "./googleOAuth";

const CONFIG: GoogleDriveRuntimeConfig = {
  appUrl: "https://quiet.example",
  clientId: "google-client-id",
  clientSecret: "google-client-secret",
  tokenEncryptionKey: Buffer.alloc(32),
};

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("Google Drive OAuth", () => {
  it("creates an offline PKCE grant for only drive.file", () => {
    const url = createGoogleDriveAuthorizationUrl(
      CONFIG,
      "signed-state",
      "pkce-challenge",
    );

    expect(url.origin).toBe("https://accounts.google.com");
    expect(url.searchParams.get("scope")).toBe(DRIVE_FILE_SCOPE);
    expect(url.searchParams.get("access_type")).toBe("offline");
    expect(url.searchParams.get("prompt")).toBe("consent");
    expect(url.searchParams.get("code_challenge_method")).toBe("S256");
    expect(url.searchParams.get("redirect_uri")).toBe(
      "https://quiet.example/auth/drive/callback",
    );
  });

  it("exchanges a code without exposing the client secret in the URL", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T10:00:00.000Z"));
    const fetchMock = vi.fn().mockResolvedValue(
      Response.json({
        access_token: "access-token",
        expires_in: 3600,
        refresh_token: "refresh-token",
        scope: DRIVE_FILE_SCOPE,
        token_type: "Bearer",
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    const grant = await exchangeGoogleDriveCode(
      CONFIG,
      "authorization-code",
      "pkce-verifier",
    );

    expect(grant).toEqual({
      accessToken: "access-token",
      expiresAt: "2026-07-15T11:00:00.000Z",
      refreshToken: "refresh-token",
      scopes: [DRIVE_FILE_SCOPE],
      tokenType: "Bearer",
    });
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("https://oauth2.googleapis.com/token");
    expect(url).not.toContain(CONFIG.clientSecret);
    expect(String(init.body)).toContain("code_verifier=pkce-verifier");
  });

  it("preserves the refresh credential and scopes when Google omits them", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-15T10:00:00.000Z"));
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        Response.json({
          access_token: "new-access-token",
          expires_in: 1800,
          token_type: "Bearer",
        }),
      ),
    );

    const grant = await refreshGoogleDriveAccess(
      CONFIG,
      "existing-refresh-token",
      [DRIVE_FILE_SCOPE],
    );

    expect(grant.refreshToken).toBe("existing-refresh-token");
    expect(grant.scopes).toEqual([DRIVE_FILE_SCOPE]);
    expect(grant.expiresAt).toBe("2026-07-15T10:30:00.000Z");
  });

  it("treats an already-invalid token as successfully revoked", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response(undefined, { status: 400 })),
    );

    await expect(revokeGoogleToken("expired-token")).resolves.toBe(true);
  });
});

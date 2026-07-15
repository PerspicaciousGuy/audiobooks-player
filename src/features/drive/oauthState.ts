import {
  createHash,
  createHmac,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

import { z } from "zod";

const STATE_LIFETIME_MS = 10 * 60 * 1000;

export const DRIVE_OAUTH_COOKIE_NAME = "quiet_library_drive_oauth";
export const DRIVE_OAUTH_COOKIE_MAX_AGE_SECONDS = STATE_LIFETIME_MS / 1_000;

const oauthStateSchema = z.object({
  createdAt: z.number().int().nonnegative(),
  nextPath: z.string().startsWith("/"),
  state: z.string().min(32),
  userId: z.string().uuid(),
  verifier: z.string().min(43).max(128),
});

export interface DriveOAuthAttempt {
  codeChallenge: string;
  cookieValue: string;
  state: string;
}

export interface VerifiedDriveOAuthAttempt {
  nextPath: string;
  userId: string;
  verifier: string;
}

function encode(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

function signingKey(masterKey: Buffer): Buffer {
  return createHmac("sha256", masterKey)
    .update("quiet-library:drive-oauth-state:v1")
    .digest();
}

function sign(payload: string, masterKey: Buffer): string {
  return createHmac("sha256", signingKey(masterKey))
    .update(payload)
    .digest("base64url");
}

export function createDriveOAuthAttempt(
  userId: string,
  nextPath: string,
  masterKey: Buffer,
  now = Date.now(),
): DriveOAuthAttempt {
  const state = randomBytes(32).toString("base64url");
  const verifier = randomBytes(64).toString("base64url");
  const payload = encode(
    JSON.stringify({ createdAt: now, nextPath, state, userId, verifier }),
  );

  return {
    codeChallenge: createHash("sha256").update(verifier).digest("base64url"),
    cookieValue: `${payload}.${sign(payload, masterKey)}`,
    state,
  };
}

export function verifyDriveOAuthAttempt(
  cookieValue: string | undefined,
  returnedState: string | undefined,
  expectedUserId: string,
  masterKey: Buffer,
  now = Date.now(),
): VerifiedDriveOAuthAttempt | undefined {
  if (!cookieValue || !returnedState) {
    return undefined;
  }

  const [payload, signature, extra] = cookieValue.split(".");

  if (!payload || !signature || extra) {
    return undefined;
  }

  const expectedSignature = sign(payload, masterKey);
  const suppliedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    suppliedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(suppliedBuffer, expectedBuffer)
  ) {
    return undefined;
  }

  try {
    const parsed = oauthStateSchema.parse(
      JSON.parse(Buffer.from(payload, "base64url").toString("utf8")),
    );
    const isExpired = now - parsed.createdAt > STATE_LIFETIME_MS;
    const isFromFuture = parsed.createdAt > now + 30_000;

    if (
      isExpired ||
      isFromFuture ||
      parsed.state !== returnedState ||
      parsed.userId !== expectedUserId
    ) {
      return undefined;
    }

    return {
      nextPath: parsed.nextPath,
      userId: parsed.userId,
      verifier: parsed.verifier,
    };
  } catch {
    return undefined;
  }
}

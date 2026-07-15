import { describe, expect, it } from "vitest";

import { createDriveOAuthAttempt, verifyDriveOAuthAttempt } from "./oauthState";

const KEY = Buffer.alloc(32, 7);
const USER_ID = "6e5c3b21-3f17-4cb5-b471-98acdf735141";
const NOW = 1_750_000_000_000;

describe("Drive OAuth state", () => {
  it("round-trips a signed, user-bound PKCE attempt", () => {
    const attempt = createDriveOAuthAttempt(
      USER_ID,
      "/app/onboarding",
      KEY,
      NOW,
    );

    expect(
      verifyDriveOAuthAttempt(
        attempt.cookieValue,
        attempt.state,
        USER_ID,
        KEY,
        NOW + 1_000,
      ),
    ).toEqual({
      nextPath: "/app/onboarding",
      userId: USER_ID,
      verifier: expect.any(String),
    });
    expect(attempt.codeChallenge).toHaveLength(43);
  });

  it("rejects tampered state and a different signed-in user", () => {
    const attempt = createDriveOAuthAttempt(USER_ID, "/app", KEY, NOW);

    expect(
      verifyDriveOAuthAttempt(
        attempt.cookieValue,
        `${attempt.state}x`,
        USER_ID,
        KEY,
        NOW,
      ),
    ).toBeUndefined();
    expect(
      verifyDriveOAuthAttempt(
        attempt.cookieValue,
        attempt.state,
        "82706ed8-d4d8-448e-bd53-6712f634d987",
        KEY,
        NOW,
      ),
    ).toBeUndefined();
  });

  it("rejects expired attempts", () => {
    const attempt = createDriveOAuthAttempt(USER_ID, "/app", KEY, NOW);

    expect(
      verifyDriveOAuthAttempt(
        attempt.cookieValue,
        attempt.state,
        USER_ID,
        KEY,
        NOW + 10 * 60 * 1000 + 1,
      ),
    ).toBeUndefined();
  });
});

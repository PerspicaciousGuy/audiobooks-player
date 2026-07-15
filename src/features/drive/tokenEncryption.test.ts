import { describe, expect, it } from "vitest";

import {
  decryptDriveCredentials,
  encryptDriveCredentials,
  type DriveCredentials,
} from "./tokenEncryption";

const KEY = Buffer.alloc(32, 9);
const USER_ID = "6e5c3b21-3f17-4cb5-b471-98acdf735141";
const CREDENTIALS: DriveCredentials = {
  accessToken: "access-token",
  expiresAt: "2026-07-15T12:00:00.000Z",
  refreshToken: "refresh-token",
  scope: ["https://www.googleapis.com/auth/drive.file"],
  tokenType: "Bearer",
};

describe("Drive credential encryption", () => {
  it("encrypts and decrypts a credential envelope", () => {
    const envelope = encryptDriveCredentials(CREDENTIALS, KEY, USER_ID);

    expect(envelope.ciphertext).not.toContain("refresh-token");
    expect(decryptDriveCredentials(envelope, KEY, USER_ID)).toEqual(
      CREDENTIALS,
    );
  });

  it("binds the encrypted envelope to its owner", () => {
    const envelope = encryptDriveCredentials(CREDENTIALS, KEY, USER_ID);

    expect(() =>
      decryptDriveCredentials(
        envelope,
        KEY,
        "82706ed8-d4d8-448e-bd53-6712f634d987",
      ),
    ).toThrow();
  });
});

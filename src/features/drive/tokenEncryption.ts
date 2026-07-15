import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

import { z } from "zod";

const envelopeSchema = z.object({
  ciphertext: z.string().min(1),
  iv: z.string().min(1),
  tag: z.string().min(1),
  version: z.literal(1),
});

const credentialsSchema = z.object({
  accessToken: z.string().min(1),
  expiresAt: z.string().datetime(),
  refreshToken: z.string().min(1),
  scope: z.array(z.string().min(1)),
  tokenType: z.string().min(1),
});

export type DriveCredentialEnvelope = z.infer<typeof envelopeSchema>;
export type DriveCredentials = z.infer<typeof credentialsSchema>;

function additionalData(userId: string): Buffer {
  return Buffer.from(`quiet-library:drive-credentials:v1:${userId}`, "utf8");
}

export function encryptDriveCredentials(
  credentials: DriveCredentials,
  masterKey: Buffer,
  userId: string,
): DriveCredentialEnvelope {
  const validated = credentialsSchema.parse(credentials);
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", masterKey, iv);
  cipher.setAAD(additionalData(userId));
  const ciphertext = Buffer.concat([
    cipher.update(JSON.stringify(validated), "utf8"),
    cipher.final(),
  ]);

  return {
    ciphertext: ciphertext.toString("base64url"),
    iv: iv.toString("base64url"),
    tag: cipher.getAuthTag().toString("base64url"),
    version: 1,
  };
}

export function decryptDriveCredentials(
  envelope: unknown,
  masterKey: Buffer,
  userId: string,
): DriveCredentials {
  const validated = envelopeSchema.parse(envelope);
  const decipher = createDecipheriv(
    "aes-256-gcm",
    masterKey,
    Buffer.from(validated.iv, "base64url"),
  );
  decipher.setAAD(additionalData(userId));
  decipher.setAuthTag(Buffer.from(validated.tag, "base64url"));
  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(validated.ciphertext, "base64url")),
    decipher.final(),
  ]);

  return credentialsSchema.parse(JSON.parse(plaintext.toString("utf8")));
}

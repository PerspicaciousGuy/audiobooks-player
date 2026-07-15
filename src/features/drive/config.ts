import "server-only";

import { environment } from "@/lib/config/environment";

export interface GoogleDriveRuntimeConfig {
  appUrl: string;
  clientId: string;
  clientSecret: string;
  tokenEncryptionKey: Buffer;
}

export function getGoogleDriveRuntimeConfig():
  GoogleDriveRuntimeConfig | undefined {
  if (environment.driveIntegrationMode !== "google") {
    return undefined;
  }

  const {
    driveTokenEncryptionKey,
    googleDriveClientId,
    googleDriveClientSecret,
  } = environment;

  if (
    !driveTokenEncryptionKey ||
    !googleDriveClientId ||
    !googleDriveClientSecret
  ) {
    throw new Error("Google Drive configuration was not validated.");
  }

  const tokenEncryptionKey = Buffer.from(driveTokenEncryptionKey, "base64");

  if (
    tokenEncryptionKey.length !== 32 ||
    tokenEncryptionKey.toString("base64") !== driveTokenEncryptionKey
  ) {
    throw new Error(
      "DRIVE_TOKEN_ENCRYPTION_KEY must be a canonical base64-encoded 32-byte key.",
    );
  }

  return {
    appUrl: environment.appUrl,
    clientId: googleDriveClientId,
    clientSecret: googleDriveClientSecret,
    tokenEncryptionKey,
  };
}

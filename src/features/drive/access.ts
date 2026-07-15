import "server-only";

import { getGoogleDriveRuntimeConfig } from "./config";
import { refreshGoogleDriveAccess } from "./googleOAuth";
import { getDriveConnection, saveDriveConnection } from "./repository";
import {
  decryptDriveCredentials,
  encryptDriveCredentials,
  type DriveCredentials,
} from "./tokenEncryption";

const REFRESH_BUFFER_MS = 60_000;

export async function getValidDriveCredentials(
  userId: string,
  forceRefresh = false,
): Promise<DriveCredentials> {
  const config = getGoogleDriveRuntimeConfig();
  const connection = await getDriveConnection(userId);

  if (!config || !connection || connection.status !== "active") {
    throw new Error("Google Drive is not connected.");
  }

  const credentials = decryptDriveCredentials(
    connection.encryptedTokenEnvelope,
    config.tokenEncryptionKey,
    userId,
  );

  if (
    !forceRefresh &&
    new Date(credentials.expiresAt).getTime() > Date.now() + REFRESH_BUFFER_MS
  ) {
    return credentials;
  }

  const refreshed = await refreshGoogleDriveAccess(
    config,
    credentials.refreshToken,
    credentials.scope,
  );
  const nextCredentials: DriveCredentials = {
    accessToken: refreshed.accessToken,
    expiresAt: refreshed.expiresAt,
    refreshToken: credentials.refreshToken,
    scope: refreshed.scopes,
    tokenType: refreshed.tokenType,
  };

  await saveDriveConnection({
    accessTokenExpiresAt: refreshed.expiresAt,
    encryptedTokenEnvelope: encryptDriveCredentials(
      nextCredentials,
      config.tokenEncryptionKey,
      userId,
    ),
    googleSubject: connection.googleSubject,
    grantedScopes: refreshed.scopes,
    userId,
  });

  return nextCredentials;
}

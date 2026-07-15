"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAuthenticatedIdentity } from "@/features/auth/session";

import { getGoogleDriveRuntimeConfig } from "./config";
import { revokeGoogleToken } from "./googleOAuth";
import { deleteDriveConnection, getDriveConnection } from "./repository";
import { decryptDriveCredentials } from "./tokenEncryption";

export async function disconnectGoogleDrive(): Promise<never> {
  const identity = await requireAuthenticatedIdentity("/app/settings");
  const config = getGoogleDriveRuntimeConfig();

  if (!identity || !config) {
    redirect("/app/settings?drive=unavailable");
  }

  const connection = await getDriveConnection(identity.id);

  if (!connection) {
    redirect("/app/settings?drive=disconnected");
  }

  try {
    const credentials = decryptDriveCredentials(
      connection.encryptedTokenEnvelope,
      config.tokenEncryptionKey,
      identity.id,
    );
    const wasRevoked = await revokeGoogleToken(credentials.refreshToken);

    if (!wasRevoked) {
      redirect("/app/settings?drive=retry-disconnect");
    }
  } catch {
    redirect("/app/settings?drive=retry-disconnect");
  }

  await deleteDriveConnection(identity.id);
  revalidatePath("/app", "layout");
  redirect("/app/settings?drive=disconnected");
}

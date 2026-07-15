import "server-only";

import type { DriveCredentialEnvelope } from "./tokenEncryption";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const CONNECTION_COLUMNS =
  "user_id, google_subject, granted_scopes, encrypted_token_envelope, access_token_expires_at, status";

export interface DriveConnection {
  accessTokenExpiresAt: string | null;
  encryptedTokenEnvelope: unknown;
  googleSubject: string;
  grantedScopes: string[];
  status: string;
  userId: string;
}

interface SaveDriveConnectionInput {
  accessTokenExpiresAt: string;
  encryptedTokenEnvelope: DriveCredentialEnvelope;
  googleSubject: string;
  grantedScopes: string[];
  userId: string;
}

function mapConnection(row: Record<string, unknown>): DriveConnection {
  return {
    accessTokenExpiresAt:
      typeof row.access_token_expires_at === "string"
        ? row.access_token_expires_at
        : null,
    encryptedTokenEnvelope: row.encrypted_token_envelope,
    googleSubject: String(row.google_subject),
    grantedScopes: Array.isArray(row.granted_scopes)
      ? row.granted_scopes.map(String)
      : [],
    status: String(row.status),
    userId: String(row.user_id),
  };
}

export async function getDriveConnection(
  userId: string,
): Promise<DriveConnection | undefined> {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase
    .from("drive_connections")
    .select(CONNECTION_COLUMNS)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to read the Drive connection.", { cause: error });
  }

  return data ? mapConnection(data) : undefined;
}

export async function saveDriveConnection(
  input: SaveDriveConnectionInput,
): Promise<void> {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    throw new Error("The server database connection is unavailable.");
  }

  const { error } = await supabase.from("drive_connections").upsert(
    {
      access_token_expires_at: input.accessTokenExpiresAt,
      encrypted_token_envelope: input.encryptedTokenEnvelope,
      google_subject: input.googleSubject,
      granted_scopes: input.grantedScopes,
      last_validated_at: new Date().toISOString(),
      status: "active",
      user_id: input.userId,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    throw new Error("Unable to save the Drive connection.", { cause: error });
  }
}

export async function deleteDriveConnection(userId: string): Promise<void> {
  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    throw new Error("The server database connection is unavailable.");
  }

  const { error } = await supabase
    .from("drive_connections")
    .delete()
    .eq("user_id", userId);

  if (error) {
    throw new Error("Unable to remove the Drive connection.", { cause: error });
  }
}

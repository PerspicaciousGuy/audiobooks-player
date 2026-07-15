import { NextResponse, type NextRequest } from "next/server";

import { getGoogleDriveRuntimeConfig } from "@/features/drive/config";
import { revokeGoogleToken } from "@/features/drive/googleOAuth";
import { getDriveConnection } from "@/features/drive/repository";
import { decryptDriveCredentials } from "@/features/drive/tokenEncryption";
import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";
import { recordServerEvent } from "@/lib/observability/logger";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";

export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const access = await authorizeMutation(request, "account_delete");

  if (access.response) return access.response;

  try {
    const connection = await getDriveConnection(access.identity.id);

    if (connection) {
      const driveConfig = getGoogleDriveRuntimeConfig();

      if (!driveConfig) {
        recordServerEvent("error", "account_delete_failed", {
          operation: "drive_revocation",
          outcome: "unavailable",
          status: 503,
        });
        return problemResponse(
          "Drive revocation is temporarily unavailable.",
          503,
        );
      }

      const credentials = decryptDriveCredentials(
        connection.encryptedTokenEnvelope,
        driveConfig.tokenEncryptionKey,
        access.identity.id,
      );

      if (!(await revokeGoogleToken(credentials.refreshToken))) {
        recordServerEvent("warn", "account_delete_failed", {
          operation: "drive_revocation",
          outcome: "failure",
          status: 502,
        });
        return problemResponse(
          "Google could not confirm Drive revocation. Try again.",
          502,
        );
      }
    }

    const { error: signOutError } = await access.supabase.auth.signOut({
      scope: "local",
    });

    if (signOutError) {
      recordServerEvent("error", "account_delete_failed", {
        operation: "session_close",
        outcome: "failure",
        status: 503,
      });
      return problemResponse(
        "The account session could not be closed safely.",
        503,
      );
    }

    const admin = createAdminSupabaseClient();

    if (!admin) {
      recordServerEvent("error", "account_delete_failed", {
        operation: "auth_user_delete",
        outcome: "unavailable",
        status: 503,
      });
      return problemResponse(
        "Account deletion is temporarily unavailable.",
        503,
      );
    }

    const { error } = await admin.auth.admin.deleteUser(access.identity.id);

    if (error) {
      recordServerEvent("error", "account_delete_failed", {
        operation: "auth_user_delete",
        outcome: "failure",
        status: 500,
      });
      return problemResponse(
        "The account could not be deleted. Sign in and retry.",
        500,
      );
    }

    recordServerEvent("info", "account_deleted", {
      operation: "account_delete",
      outcome: "success",
      status: 204,
    });

    return new NextResponse(null, {
      headers: { "clear-site-data": '"cache", "storage"' },
      status: 204,
    });
  } catch {
    recordServerEvent("error", "account_delete_failed", {
      operation: "account_delete",
      outcome: "failure",
      status: 500,
    });
    return problemResponse(
      "Account deletion could not be completed safely.",
      500,
    );
  }
}

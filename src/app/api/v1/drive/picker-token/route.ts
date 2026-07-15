import { NextResponse } from "next/server";

import { getValidDriveCredentials } from "@/features/drive/access";
import { problemResponse } from "@/lib/api/problem";
import { authorizeRateLimitedRequest } from "@/lib/security/apiAccess";

export async function GET(): Promise<NextResponse> {
  const access = await authorizeRateLimitedRequest("picker_token");

  if (access.response) return access.response;

  try {
    const credentials = await getValidDriveCredentials(access.identity.id);

    return NextResponse.json(
      {
        accessToken: credentials.accessToken,
        expiresAt: credentials.expiresAt,
      },
      {
        headers: {
          "cache-control": "no-store, private",
          pragma: "no-cache",
        },
      },
    );
  } catch {
    return problemResponse("Google Drive must be reconnected.", 409);
  }
}

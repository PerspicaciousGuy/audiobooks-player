import { NextResponse } from "next/server";

import { getAuthenticatedIdentity } from "@/features/auth/session";
import { getValidDriveCredentials } from "@/features/drive/access";

export async function GET(): Promise<NextResponse> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  try {
    const credentials = await getValidDriveCredentials(identity.id);

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
    return NextResponse.json(
      { error: "Google Drive must be reconnected." },
      { status: 409 },
    );
  }
}

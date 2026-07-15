import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAuthenticatedIdentity } from "@/features/auth/session";
import { openDriveDownloadStream } from "@/features/streaming/driveStream";
import { getOwnedStreamFile } from "@/features/streaming/repository";

const identifiersSchema = z.object({
  audiobookId: z.string().uuid(),
  fileId: z.string().uuid(),
});

interface DownloadRouteContext {
  params: Promise<{ audiobookId: string }>;
}

export async function GET(
  request: NextRequest,
  context: DownloadRouteContext,
): Promise<NextResponse> {
  const identity = await getAuthenticatedIdentity();

  if (!identity) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { audiobookId } = await context.params;
  const identifiers = identifiersSchema.safeParse({
    audiobookId,
    fileId: request.nextUrl.searchParams.get("fileId"),
  });

  if (!identifiers.success) {
    return NextResponse.json(
      { error: "Invalid audio source." },
      { status: 400 },
    );
  }

  try {
    const file = await getOwnedStreamFile(
      identifiers.data.audiobookId,
      identifiers.data.fileId,
    );

    if (!file) {
      return NextResponse.json(
        { error: "Audio source not found." },
        { status: 404 },
      );
    }

    const upstream = await openDriveDownloadStream(
      identity.id,
      file,
      request.signal,
    );

    if (upstream.status === 401 || upstream.status === 403) {
      await upstream.body?.cancel();
      return NextResponse.json(
        { error: "Google Drive access must be reconnected." },
        { status: 409 },
      );
    }

    const contentLength = Number(upstream.headers.get("content-length"));

    if (!upstream.ok || !upstream.body || contentLength !== file.byteSize) {
      await upstream.body?.cancel();
      return NextResponse.json(
        { error: "The source changed or returned an invalid download." },
        { status: 409 },
      );
    }

    return new NextResponse(upstream.body, {
      headers: {
        "cache-control": "no-store, private",
        "content-length": String(contentLength),
        "content-type": file.mimeType,
        vary: "Cookie",
      },
    });
  } catch {
    return NextResponse.json(
      { error: "The download is temporarily unavailable." },
      { status: 502 },
    );
  }
}

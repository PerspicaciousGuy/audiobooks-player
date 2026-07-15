import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { openDriveDownloadStream } from "@/features/streaming/driveStream";
import { getOwnedStreamFile } from "@/features/streaming/repository";
import { problemResponse } from "@/lib/api/problem";
import { authorizeRateLimitedRequest } from "@/lib/security/apiAccess";

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
  const access = await authorizeRateLimitedRequest("download");

  if (access.response) return access.response;

  const { audiobookId } = await context.params;
  const identifiers = identifiersSchema.safeParse({
    audiobookId,
    fileId: request.nextUrl.searchParams.get("fileId"),
  });

  if (!identifiers.success) {
    return problemResponse("Invalid audio source.", 400);
  }

  try {
    const file = await getOwnedStreamFile(
      identifiers.data.audiobookId,
      identifiers.data.fileId,
    );

    if (!file) {
      return problemResponse("Audio source not found.", 404);
    }

    const upstream = await openDriveDownloadStream(
      access.identity.id,
      file,
      request.signal,
    );

    if (upstream.status === 401 || upstream.status === 403) {
      await upstream.body?.cancel();
      return problemResponse("Google Drive access must be reconnected.", 409);
    }

    const contentLength = Number(upstream.headers.get("content-length"));

    if (!upstream.ok || !upstream.body || contentLength !== file.byteSize) {
      await upstream.body?.cancel();
      return problemResponse(
        "The source changed or returned an invalid download.",
        409,
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
    return problemResponse("The download is temporarily unavailable.", 502);
  }
}

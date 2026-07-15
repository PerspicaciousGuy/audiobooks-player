import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { openDriveRangeStream } from "@/features/streaming/driveStream";
import { parseBoundedRange } from "@/features/streaming/range";
import { getOwnedStreamFile } from "@/features/streaming/repository";
import { problemResponse } from "@/lib/api/problem";
import { authorizeRateLimitedRequest } from "@/lib/security/apiAccess";

const identifiersSchema = z.object({
  audiobookId: z.string().uuid(),
  fileId: z.string().uuid(),
});

interface StreamRouteContext {
  params: Promise<{ audiobookId: string }>;
}

function rangeNotSatisfiable(fileSize: number): NextResponse {
  return new NextResponse(null, {
    headers: {
      "accept-ranges": "bytes",
      "content-range": `bytes */${fileSize}`,
    },
    status: 416,
  });
}

export async function GET(
  request: NextRequest,
  context: StreamRouteContext,
): Promise<NextResponse> {
  const access = await authorizeRateLimitedRequest("stream");

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

    const range = parseBoundedRange(
      request.headers.get("range"),
      file.byteSize,
    );

    if (!range) return rangeNotSatisfiable(file.byteSize);
    const upstream = await openDriveRangeStream(
      access.identity.id,
      file,
      range,
      request.signal,
    );

    if (upstream.status === 404) {
      await upstream.body?.cancel();
      return problemResponse("Source file is missing.", 404);
    }

    if (upstream.status === 401 || upstream.status === 403) {
      await upstream.body?.cancel();
      return problemResponse("Google Drive access must be reconnected.", 409);
    }

    if (upstream.status === 416) {
      await upstream.body?.cancel();
      return problemResponse(
        "The source file changed and must be refreshed.",
        409,
      );
    }

    const contentLength = Number(upstream.headers.get("content-length"));
    const contentRange = upstream.headers.get("content-range");
    const expectedContentRange = `bytes ${range.start}-${range.end}/${file.byteSize}`;

    if (
      upstream.status !== 206 ||
      !upstream.body ||
      contentRange !== expectedContentRange ||
      !Number.isFinite(contentLength) ||
      contentLength !== range.length
    ) {
      await upstream.body?.cancel();
      return problemResponse(
        "Drive returned an invalid partial response.",
        502,
      );
    }

    return new NextResponse(upstream.body, {
      headers: {
        "accept-ranges": "bytes",
        "cache-control": "no-store, private",
        "content-length": String(contentLength),
        "content-range": contentRange,
        "content-type": file.mimeType,
        vary: "Cookie",
      },
      status: 206,
    });
  } catch {
    return problemResponse("The audio stream is temporarily unavailable.", 502);
  }
}

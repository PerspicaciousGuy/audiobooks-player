import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { updateAudiobookSchema } from "@/features/library/contracts";
import { getOwnedAudiobookWithClient } from "@/features/library/repository";
import { problemResponse } from "@/lib/api/problem";
import {
  authorizeMutation,
  authorizeRateLimitedRequest,
} from "@/lib/security/apiAccess";

const audiobookIdSchema = z.string().uuid();

interface AudiobookRouteContext {
  params: Promise<{ audiobookId: string }>;
}

export async function GET(
  _request: NextRequest,
  context: AudiobookRouteContext,
): Promise<NextResponse> {
  const access = await authorizeRateLimitedRequest("audiobook_read");

  if (access.response) return access.response;

  const { audiobookId: rawAudiobookId } = await context.params;
  const audiobookId = audiobookIdSchema.safeParse(rawAudiobookId);

  if (!audiobookId.success) {
    return problemResponse("Invalid audiobook.", 400);
  }

  try {
    const audiobook = await getOwnedAudiobookWithClient(
      access.supabase,
      audiobookId.data,
    );

    return audiobook
      ? NextResponse.json(audiobook, {
          headers: { "cache-control": "no-store, private" },
        })
      : problemResponse("Audiobook not found.", 404);
  } catch {
    return problemResponse("The audiobook could not be loaded.", 500);
  }
}

export async function PATCH(
  request: NextRequest,
  context: AudiobookRouteContext,
): Promise<NextResponse> {
  const access = await authorizeMutation(request, "audiobook_update");

  if (access.response) return access.response;

  const { audiobookId: rawAudiobookId } = await context.params;
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return problemResponse("Invalid JSON body.", 400);
  }

  const audiobookId = audiobookIdSchema.safeParse(rawAudiobookId);
  const update = updateAudiobookSchema.safeParse(body);

  if (!audiobookId.success || !update.success) {
    return problemResponse("Invalid audiobook correction.", 400);
  }

  const { data, error } = await access.supabase
    .from("audiobooks")
    .update(update.data)
    .eq("id", audiobookId.data)
    .select("id")
    .maybeSingle();

  if (error) {
    return problemResponse("The audiobook could not be updated.", 422);
  }

  if (!data) {
    return problemResponse("Audiobook not found.", 404);
  }

  const audiobook = await getOwnedAudiobookWithClient(
    access.supabase,
    audiobookId.data,
  );
  return NextResponse.json(audiobook, {
    headers: { "cache-control": "no-store, private" },
  });
}

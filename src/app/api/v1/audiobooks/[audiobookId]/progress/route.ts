import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import {
  progressCheckpointSchema,
  savedProgressSchema,
} from "@/features/progress/contracts";
import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";

const audiobookIdSchema = z.string().uuid();

interface ProgressRouteContext {
  params: Promise<{ audiobookId: string }>;
}

export async function PUT(
  request: NextRequest,
  context: ProgressRouteContext,
): Promise<NextResponse> {
  const access = await authorizeMutation(request, "progress");

  if (access.response) return access.response;

  const { audiobookId: rawAudiobookId } = await context.params;
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return problemResponse("Invalid JSON body.", 400);
  }

  const audiobookId = audiobookIdSchema.safeParse(rawAudiobookId);
  const checkpoint = progressCheckpointSchema.safeParse(requestBody);

  if (!audiobookId.success || !checkpoint.success) {
    return problemResponse("The progress checkpoint is invalid.", 400);
  }

  if (
    new Date(checkpoint.data.clientUpdatedAt).getTime() >
    Date.now() + 5 * 60_000
  ) {
    return problemResponse(
      "The checkpoint time is too far in the future.",
      400,
    );
  }

  const { data, error } = await access.supabase.rpc("save_playback_progress", {
    p_audiobook_file_id: checkpoint.data.audiobookFileId,
    p_audiobook_id: audiobookId.data,
    p_chapter_id: checkpoint.data.chapterId,
    p_client_updated_at: checkpoint.data.clientUpdatedAt,
    p_expected_version: checkpoint.data.expectedVersion,
    p_is_completed: checkpoint.data.isCompleted,
    p_playback_rate: checkpoint.data.playbackRate,
    p_position_ms: checkpoint.data.positionMs,
  });

  if (error) {
    return problemResponse("The progress checkpoint could not be saved.", 422);
  }

  const saved = savedProgressSchema.safeParse(data);

  if (!saved.success) {
    return problemResponse("The progress response was invalid.", 502);
  }

  return NextResponse.json(saved.data, {
    headers: { "cache-control": "no-store, private" },
    status: saved.data.accepted ? 200 : 409,
  });
}

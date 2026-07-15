import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { createBookmarkSchema } from "@/features/bookmarks/contracts";
import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";

const audiobookIdSchema = z.string().uuid();

interface BookmarkRouteContext {
  params: Promise<{ audiobookId: string }>;
}

export async function POST(
  request: NextRequest,
  context: BookmarkRouteContext,
): Promise<NextResponse> {
  const access = await authorizeMutation(request, "bookmark_create");

  if (access.response) return access.response;

  const { audiobookId: rawAudiobookId } = await context.params;
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return problemResponse("Invalid JSON body.", 400);
  }

  const audiobookId = audiobookIdSchema.safeParse(rawAudiobookId);
  const bookmark = createBookmarkSchema.safeParse(requestBody);

  if (!audiobookId.success || !bookmark.success) {
    return problemResponse("The bookmark is invalid.", 400);
  }

  const { data, error } = await access.supabase
    .from("bookmarks")
    .insert({
      audiobook_file_id: bookmark.data.audiobookFileId,
      audiobook_id: audiobookId.data,
      chapter_id: bookmark.data.chapterId,
      note: bookmark.data.note,
      position_ms: bookmark.data.positionMs,
      user_id: access.identity.id,
    })
    .select("id, position_ms, note, created_at")
    .single();

  if (error) {
    return problemResponse("The bookmark could not be saved.", 422);
  }

  return NextResponse.json(data, { status: 201 });
}

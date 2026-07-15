import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";

import { getAuthenticatedIdentity } from "@/features/auth/session";
import { createBookmarkSchema } from "@/features/bookmarks/contracts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const audiobookIdSchema = z.string().uuid();

interface BookmarkRouteContext {
  params: Promise<{ audiobookId: string }>;
}

export async function POST(
  request: NextRequest,
  context: BookmarkRouteContext,
): Promise<NextResponse> {
  const identity = await getAuthenticatedIdentity();
  const supabase = await createServerSupabaseClient();

  if (!identity || !supabase) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const { audiobookId: rawAudiobookId } = await context.params;
  let requestBody: unknown;

  try {
    requestBody = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const audiobookId = audiobookIdSchema.safeParse(rawAudiobookId);
  const bookmark = createBookmarkSchema.safeParse(requestBody);

  if (!audiobookId.success || !bookmark.success) {
    return NextResponse.json(
      { error: "The bookmark is invalid." },
      { status: 400 },
    );
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .insert({
      audiobook_file_id: bookmark.data.audiobookFileId,
      audiobook_id: audiobookId.data,
      chapter_id: bookmark.data.chapterId,
      note: bookmark.data.note,
      position_ms: bookmark.data.positionMs,
      user_id: identity.id,
    })
    .select("id, position_ms, note, created_at")
    .single();

  if (error) {
    return NextResponse.json(
      { error: "The bookmark could not be saved." },
      { status: 422 },
    );
  }

  return NextResponse.json(data, { status: 201 });
}

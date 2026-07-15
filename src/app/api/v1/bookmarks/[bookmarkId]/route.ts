import { NextResponse } from "next/server";
import { z } from "zod";

import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";

interface BookmarkRouteContext {
  params: Promise<{ bookmarkId: string }>;
}

export async function DELETE(
  request: Request,
  context: BookmarkRouteContext,
): Promise<NextResponse> {
  const access = await authorizeMutation(request, "bookmark_delete");

  if (access.response) return access.response;

  const { bookmarkId: rawBookmarkId } = await context.params;
  const bookmarkId = z.string().uuid().safeParse(rawBookmarkId);

  if (!bookmarkId.success) {
    return problemResponse("Invalid bookmark.", 400);
  }

  const { data, error } = await access.supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId.data)
    .eq("user_id", access.identity.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return problemResponse("The bookmark could not be deleted.", 500);
  }

  if (!data) {
    return problemResponse("Bookmark not found.", 404);
  }

  return new NextResponse(null, { status: 204 });
}

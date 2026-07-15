import { NextResponse } from "next/server";
import { z } from "zod";

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
    return NextResponse.json({ error: "Invalid bookmark." }, { status: 400 });
  }

  const { data, error } = await access.supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId.data)
    .eq("user_id", access.identity.id)
    .select("id")
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { error: "The bookmark could not be deleted." },
      { status: 500 },
    );
  }

  if (!data) {
    return NextResponse.json({ error: "Bookmark not found." }, { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}

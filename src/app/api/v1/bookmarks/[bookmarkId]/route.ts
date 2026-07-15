import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedIdentity } from "@/features/auth/session";
import { createServerSupabaseClient } from "@/lib/supabase/server";

interface BookmarkRouteContext {
  params: Promise<{ bookmarkId: string }>;
}

export async function DELETE(
  _request: Request,
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

  const { bookmarkId: rawBookmarkId } = await context.params;
  const bookmarkId = z.string().uuid().safeParse(rawBookmarkId);

  if (!bookmarkId.success) {
    return NextResponse.json({ error: "Invalid bookmark." }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("bookmarks")
    .delete()
    .eq("id", bookmarkId.data)
    .eq("user_id", identity.id)
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

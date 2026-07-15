import { NextResponse, type NextRequest } from "next/server";

import { userPreferencesSchema } from "@/features/preferences/contracts";
import { problemResponse } from "@/lib/api/problem";
import { authorizeMutation } from "@/lib/security/apiAccess";

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const access = await authorizeMutation(request, "preferences_update");

  if (access.response) return access.response;

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return problemResponse("Invalid JSON body.", 400);
  }

  const preferences = userPreferencesSchema.safeParse(body);

  if (!preferences.success) {
    return problemResponse("Invalid playback preferences.", 400);
  }

  const { error } = await access.supabase.from("user_preferences").upsert({
    default_playback_rate: preferences.data.defaultPlaybackRate,
    default_sleep_timer_minutes: preferences.data.defaultSleepTimerMinutes,
    skip_back_seconds: preferences.data.skipBackSeconds,
    skip_forward_seconds: preferences.data.skipForwardSeconds,
    theme: preferences.data.theme,
    user_id: access.identity.id,
  });

  if (error) {
    return problemResponse("Preferences could not be saved.", 422);
  }

  return NextResponse.json(preferences.data, {
    headers: { "cache-control": "no-store, private" },
  });
}

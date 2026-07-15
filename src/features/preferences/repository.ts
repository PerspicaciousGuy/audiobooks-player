import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { createServerSupabaseClient } from "@/lib/supabase/server";

import {
  DEFAULT_USER_PREFERENCES,
  userPreferencesRowSchema,
  type UserPreferences,
} from "./contracts";

export async function getUserPreferences(
  client?: SupabaseClient,
): Promise<UserPreferences> {
  const supabase = client ?? (await createServerSupabaseClient());

  if (!supabase) return DEFAULT_USER_PREFERENCES;

  const { data, error } = await supabase
    .from("user_preferences")
    .select(
      "default_playback_rate, default_sleep_timer_minutes, skip_back_seconds, skip_forward_seconds, theme",
    )
    .maybeSingle();

  if (error) throw new Error("Unable to load playback preferences.");
  if (!data) return DEFAULT_USER_PREFERENCES;

  const row = userPreferencesRowSchema.parse(data);
  return {
    defaultPlaybackRate: row.default_playback_rate,
    defaultSleepTimerMinutes: row.default_sleep_timer_minutes,
    skipBackSeconds: row.skip_back_seconds,
    skipForwardSeconds: row.skip_forward_seconds,
    theme: row.theme,
  };
}

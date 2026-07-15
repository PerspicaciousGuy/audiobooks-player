import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { getSupabaseRuntimeConfig } from "@/lib/config/environment";

export function createAdminSupabaseClient(): SupabaseClient | undefined {
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    return undefined;
  }

  return createClient(config.url, config.secretKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  });
}

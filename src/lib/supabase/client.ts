import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { getPublicSupabaseConfig } from "@/lib/config/publicEnvironment";

export function createBrowserSupabaseClient(): SupabaseClient {
  const config = getPublicSupabaseConfig();

  return createBrowserClient(config.url, config.publishableKey);
}

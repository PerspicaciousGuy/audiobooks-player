import "server-only";

import { createServerClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getSupabaseRuntimeConfig } from "@/lib/config/environment";

export async function createServerSupabaseClient(): Promise<
  SupabaseClient | undefined
> {
  const config = getSupabaseRuntimeConfig();

  if (!config) {
    return undefined;
  }

  const cookieStore = await cookies();

  return createServerClient(config.url, config.publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, options, value }) => {
            cookieStore.set(name, value, options);
          });
        } catch (error) {
          if (!(error instanceof Error)) {
            throw error;
          }

          if (!error.message.includes("Cookies can only be modified")) {
            throw error;
          }
        }
      },
    },
  });
}

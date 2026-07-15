import { z } from "zod";

const publicSupabaseSchema = z.object({
  publishableKey: z.string().min(1),
  url: z.string().url(),
});

export interface PublicSupabaseConfig {
  publishableKey: string;
  url: string;
}

export function getPublicSupabaseConfig(): PublicSupabaseConfig {
  return publicSupabaseSchema.parse({
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
  });
}

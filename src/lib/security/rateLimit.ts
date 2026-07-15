import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

const rateLimitDecisionSchema = z.object({
  allowed: z.boolean(),
  limit: z.number().int().positive(),
  remaining: z.number().int().nonnegative(),
  retryAfterSeconds: z.number().int().nonnegative(),
});

export type RateLimitBucket =
  | "account_delete"
  | "audiobook_read"
  | "audiobook_update"
  | "bookmark_create"
  | "bookmark_delete"
  | "download"
  | "import_confirm"
  | "import_preview"
  | "library_read"
  | "picker_token"
  | "progress"
  | "stream";

export type RateLimitDecision = z.infer<typeof rateLimitDecisionSchema>;

export async function consumeRequestQuota(
  supabase: SupabaseClient,
  bucket: RateLimitBucket,
): Promise<RateLimitDecision> {
  const { data, error } = await supabase.rpc("consume_request_quota", {
    p_bucket: bucket,
  });

  if (error) {
    throw new Error("Request quota is unavailable.", { cause: error });
  }

  return rateLimitDecisionSchema.parse(data);
}

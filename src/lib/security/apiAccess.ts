import "server-only";

import { NextResponse } from "next/server";

import {
  getAuthenticatedIdentity,
  type AuthenticatedIdentity,
} from "@/features/auth/session";
import { environment } from "@/lib/config/environment";
import { recordServerEvent } from "@/lib/observability/logger";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { consumeRequestQuota, type RateLimitBucket } from "./rateLimit";
import { isSameOriginMutation } from "./request";

interface AuthorizedRequest {
  identity: AuthenticatedIdentity;
  response?: never;
  supabase: NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;
}

interface RejectedRequest {
  identity?: never;
  response: NextResponse;
  supabase?: never;
}

export type ApiAccessResult = AuthorizedRequest | RejectedRequest;

function errorResponse(error: string, status: number): NextResponse {
  return NextResponse.json(
    { error },
    { headers: { "cache-control": "no-store" }, status },
  );
}

async function authorizeIdentity(): Promise<ApiAccessResult> {
  const supabase = await createServerSupabaseClient();
  const identity = supabase
    ? await getAuthenticatedIdentity(supabase)
    : undefined;

  if (!identity || !supabase) {
    return { response: errorResponse("Authentication required.", 401) };
  }

  return { identity, supabase };
}

async function applyQuota(
  access: AuthorizedRequest,
  bucket: RateLimitBucket,
): Promise<ApiAccessResult> {
  try {
    const quota = await consumeRequestQuota(access.supabase, bucket);

    if (!quota.allowed) {
      recordServerEvent("warn", "rate_limit_denied", {
        operation: bucket,
        outcome: "denied",
        status: 429,
      });
      return {
        response: NextResponse.json(
          { error: "Too many requests. Try again shortly." },
          {
            headers: {
              "cache-control": "no-store",
              "retry-after": String(quota.retryAfterSeconds),
            },
            status: 429,
          },
        ),
      };
    }
  } catch {
    recordServerEvent("error", "rate_limit_unavailable", {
      operation: bucket,
      outcome: "unavailable",
      status: 503,
    });
    return {
      response: errorResponse("Request protection is unavailable.", 503),
    };
  }

  return access;
}

export async function authorizeRateLimitedRequest(
  bucket: RateLimitBucket,
): Promise<ApiAccessResult> {
  const access = await authorizeIdentity();
  return access.response ? access : applyQuota(access, bucket);
}

export async function authorizeMutation(
  request: Request,
  bucket: RateLimitBucket,
): Promise<ApiAccessResult> {
  const access = await authorizeIdentity();

  if (access.response) return access;

  if (!isSameOriginMutation(request, environment.appUrl)) {
    return { response: errorResponse("Request origin is not allowed.", 403) };
  }

  return applyQuota(access, bucket);
}

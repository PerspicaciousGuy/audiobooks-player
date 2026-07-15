import "server-only";

import { redirect } from "next/navigation";

import { isSupabaseAuthEnabled } from "@/lib/config/environment";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export interface AuthenticatedIdentity {
  email?: string;
  id: string;
}

export async function getAuthenticatedIdentity(): Promise<
  AuthenticatedIdentity | undefined
> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return undefined;
  }

  const { data, error } = await supabase.auth.getClaims();
  const subject = data?.claims.sub;

  if (error || !subject) {
    return undefined;
  }

  const email = data.claims.email;

  return typeof email === "string" ? { email, id: subject } : { id: subject };
}

export async function requireAuthenticatedIdentity(
  nextPath: string,
): Promise<AuthenticatedIdentity | undefined> {
  const identity = await getAuthenticatedIdentity();

  if (isSupabaseAuthEnabled() && !identity) {
    redirect(`/auth/sign-in?next=${encodeURIComponent(nextPath)}`);
  }

  return identity;
}

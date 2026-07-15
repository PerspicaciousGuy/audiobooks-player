"use server";

import { redirect } from "next/navigation";

import { environment } from "@/lib/config/environment";
import { createServerSupabaseClient } from "@/lib/supabase/server";

import { getSafeRedirectPath } from "./redirects";

export async function signInWithGoogle(formData: FormData): Promise<never> {
  const requestedPath = formData.get("next");
  const nextPath = getSafeRedirectPath(
    typeof requestedPath === "string" ? requestedPath : undefined,
  );
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    redirect("/auth/error?reason=configuration");
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    options: {
      redirectTo: `${environment.appUrl}/auth/callback?next=${encodeURIComponent(nextPath)}`,
      scopes: "openid email profile",
    },
    provider: "google",
  });

  if (error || !data.url) {
    redirect("/auth/error?reason=provider");
  }

  redirect(data.url);
}

export async function signOut(): Promise<never> {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const { error } = await supabase.auth.signOut({ scope: "local" });

    if (error) {
      redirect("/auth/error?reason=sign-out");
    }
  }

  redirect("/");
}

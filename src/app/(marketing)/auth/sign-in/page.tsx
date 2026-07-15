import type { Metadata } from "next";

import BrandMark from "@/components/brand/BrandMark";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";
import { signInWithGoogle } from "@/features/auth/actions";
import { getSafeRedirectPath } from "@/features/auth/redirects";
import { isSupabaseAuthEnabled } from "@/lib/config/environment";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your private Quiet Library with Google.",
};

interface SignInPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { next } = await searchParams;
  const nextPath = getSafeRedirectPath(next);
  const isAuthEnabled = isSupabaseAuthEnabled();

  return (
    <main className="bg-paper px-page-gutter grid min-h-screen place-items-center py-12">
      <section className="border-border bg-paper-elevated shadow-card rounded-panel flex w-full max-w-xl flex-col items-center gap-7 border p-8 text-center sm:p-12">
        <BrandMark />
        <span className="bg-action-soft text-action-strong grid size-16 place-items-center rounded-full">
          <Icon className="size-7" name="shield" />
        </span>
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-4xl font-semibold">
            Enter your quiet library
          </h1>
          <p className="text-ink-muted leading-relaxed">
            Google sign-in confirms your identity. Access to audiobook files is
            requested separately, only when you choose to connect Drive.
          </p>
        </div>
        {isAuthEnabled ? (
          <form action={signInWithGoogle} className="w-full">
            <input name="next" type="hidden" value={nextPath} />
            <button
              className="bg-ink text-paper-elevated hover:bg-action-strong focus-visible:ring-focus rounded-control inline-flex min-h-12 w-full items-center justify-center gap-3 px-5 font-semibold focus-visible:ring-2 focus-visible:outline-none"
              type="submit"
            >
              <Icon className="size-5" name="arrow-right" />
              Continue with Google
            </button>
          </form>
        ) : (
          <div className="flex w-full flex-col gap-3">
            <p className="bg-action-soft rounded-control p-4 text-sm leading-relaxed">
              Supabase Auth is in preview mode. Add local or hosted credentials
              and set <code>NEXT_PUBLIC_AUTH_MODE=supabase</code> to enable real
              sign-in.
            </p>
            <ActionLink href={nextPath}>Continue to UI preview</ActionLink>
          </div>
        )}
        <p className="text-ink-muted text-xs">
          No Google Drive file permission is requested during identity sign-in.
        </p>
      </section>
    </main>
  );
}

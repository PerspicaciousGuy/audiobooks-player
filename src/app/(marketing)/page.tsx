import type { Metadata } from "next";

import HowItWorks from "@/components/marketing/HowItWorks";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import PrivacyPromise from "@/components/marketing/PrivacyPromise";
import ProductPreview from "@/components/marketing/ProductPreview";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";

export const metadata: Metadata = {
  title: "Your audiobooks. Your Drive. Your place.",
  description:
    "Quiet Library gives your personal Google Drive audiobooks a private, focused listening home.",
};

export default function LandingPage() {
  return (
    <div className="bg-paper text-ink min-h-screen">
      <MarketingHeader />
      <main>
        <section className="px-page-gutter mx-auto grid max-w-7xl items-center gap-10 pt-12 pb-20 lg:grid-cols-2 lg:pt-20 lg:pb-28">
          <div className="flex flex-col items-start gap-7">
            <p className="text-action-strong flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
              <Icon className="size-4" name="sparkles" />A calmer home for every
              story
            </p>
            <div className="flex flex-col gap-5">
              <h1 className="font-display text-5xl leading-none font-semibold tracking-tight sm:text-6xl lg:text-7xl">
                Your audiobooks.
                <br />
                Your Drive.
                <br />
                <span className="text-action-strong">Your place.</span>
              </h1>
              <p className="text-ink-muted max-w-xl text-lg leading-relaxed">
                Turn the audiobook files you already own into a beautiful,
                private library that remembers where every story left you.
              </p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <ActionLink
                href="/app/onboarding"
                icon={<Icon className="size-4" name="arrow-right" />}
              >
                Connect Google Drive
              </ActionLink>
              <ActionLink href="/app" variant="secondary">
                Preview the library
              </ActionLink>
            </div>
            <p className="text-ink-muted flex items-center gap-2 text-xs">
              <Icon className="text-success size-4" name="shield" />
              You choose each file. Quiet Library never scans your full Drive.
            </p>
          </div>
          <ProductPreview />
        </section>
        <HowItWorks />
        <PrivacyPromise />
        <section className="px-page-gutter mx-auto flex max-w-4xl flex-col items-center gap-6 py-24 text-center sm:py-32">
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            Ready when your next chapter is
          </p>
          <h2 className="font-display text-4xl leading-tight font-semibold sm:text-6xl">
            Bring your books. Keep your place.
          </h2>
          <p className="text-ink-muted max-w-xl leading-relaxed">
            Your personal listening library begins with the files you already
            own and the stories you already love.
          </p>
          <ActionLink href="/app/onboarding">Connect Google Drive</ActionLink>
        </section>
      </main>
      <MarketingFooter />
    </div>
  );
}

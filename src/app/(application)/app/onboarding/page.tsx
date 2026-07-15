import type { Metadata } from "next";

import BookCover from "@/components/library/BookCover";
import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";
import { environment } from "@/lib/config/environment";
import { MOCK_AUDIOBOOKS } from "@/lib/mock/library";

export const metadata: Metadata = {
  title: "Add audiobooks",
  description:
    "Connect Google Drive and choose audiobook files for your library.",
};

const ONBOARDING_STEPS = [
  { label: "Sign in", status: "complete" },
  { label: "Connect Drive", status: "current" },
  { label: "Choose books", status: "upcoming" },
] as const;

interface OnboardingPageProps {
  searchParams: Promise<{ drive?: string }>;
}

const DRIVE_STATUS_MESSAGES: Record<string, string> = {
  cancelled: "Drive authorization was cancelled. Nothing was imported.",
  connected: "Google Drive is connected. You can now choose audiobook files.",
  failed: "Drive could not be connected. Please try again.",
  "invalid-state":
    "That authorization attempt expired or could not be verified. Please retry.",
  "scope-denied":
    "The required file permission was not granted. No Drive access was saved.",
  unavailable: "Google Drive integration is not configured on this server.",
};

export default async function OnboardingPage({
  searchParams,
}: OnboardingPageProps) {
  const { drive } = await searchParams;
  const previewBook = MOCK_AUDIOBOOKS[1];
  const isDriveEnabled = environment.driveIntegrationMode === "google";

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-10 py-8 sm:py-12">
      <header className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
        <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
          Build your private library
        </p>
        <h1 className="font-display text-4xl font-semibold sm:text-6xl">
          Bring in the stories you own
        </h1>
        <p className="text-ink-muted leading-relaxed">
          Google Drive access is separate from sign-in. You choose individual
          files, and can disconnect that access whenever you want.
        </p>
      </header>

      <ol className="mx-auto grid w-full max-w-2xl grid-cols-3 gap-2">
        {ONBOARDING_STEPS.map((step, index) => {
          const isComplete = step.status === "complete";
          const isCurrent = step.status === "current";

          return (
            <li
              className="flex flex-col items-center gap-2 text-center"
              key={step.label}
            >
              <span
                aria-current={isCurrent ? "step" : undefined}
                className={`${isComplete || isCurrent ? "bg-action text-paper-elevated" : "bg-surface-muted text-ink-muted"} grid size-10 place-items-center rounded-full text-sm font-bold`}
              >
                {isComplete ? (
                  <Icon className="size-4" name="check" />
                ) : (
                  index + 1
                )}
              </span>
              <span className="text-xs font-semibold">{step.label}</span>
            </li>
          );
        })}
      </ol>

      {drive && DRIVE_STATUS_MESSAGES[drive] ? (
        <p
          className="border-border bg-paper-elevated rounded-control border px-4 py-3 text-center text-sm"
          role="status"
        >
          {DRIVE_STATUS_MESSAGES[drive]}
        </p>
      ) : null}

      <section className="border-border bg-paper-elevated shadow-card rounded-panel grid gap-8 border p-6 sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center">
        <div className="flex flex-col items-start gap-6">
          <span className="bg-action-soft text-action-strong grid size-14 place-items-center rounded-full">
            <Icon className="size-6" name="cloud" />
          </span>
          <div className="flex flex-col gap-3">
            <h2 className="font-display text-3xl font-semibold">
              Connect Google Drive
            </h2>
            <p className="text-ink-muted max-w-2xl leading-relaxed">
              Quiet Library will ask for permission to access only files you
              select through Google Picker. It cannot browse or change the rest
              of your Drive.
            </p>
          </div>
          <ul className="flex flex-col gap-3 text-sm">
            <li className="flex items-center gap-3">
              <Icon className="text-success size-4" name="check" />
              Select individual MP3, M4B, M4A, AAC, or OGG files
            </li>
            <li className="flex items-center gap-3">
              <Icon className="text-success size-4" name="check" />
              Revoke access without deleting your Drive files
            </li>
            <li className="flex items-center gap-3">
              <Icon className="text-success size-4" name="check" />
              Review detected books before anything enters your library
            </li>
          </ul>
          <ActionLink
            href={
              drive === "connected"
                ? "/app/import"
                : isDriveEnabled
                  ? "/auth/drive/start?next=/app/onboarding"
                  : "/app/library"
            }
          >
            {drive === "connected"
              ? "Choose audiobook files"
              : isDriveEnabled
                ? "Continue with Google Drive"
                : "Explore the UI preview"}
          </ActionLink>
          <p className="text-ink-muted text-xs">
            {drive === "connected"
              ? "Picker will load only after you choose to open it."
              : isDriveEnabled
                ? "You will be redirected to Google, then returned here."
                : "Enable Google Drive server configuration to test real authorization."}
          </p>
        </div>
        {previewBook ? (
          <div className="mx-auto hidden w-48 lg:block">
            <BookCover
              author={previewBook.author}
              size="hero"
              title={previewBook.title}
              tone={previewBook.coverTone}
            />
          </div>
        ) : null}
      </section>

      <aside className="bg-action-soft rounded-card flex items-start gap-4 p-5">
        <Icon
          className="text-action-strong mt-0.5 size-5 shrink-0"
          name="shield"
        />
        <p className="text-sm leading-relaxed">
          <strong>Cancel anytime.</strong> If you close Google consent or
          Picker, nothing is imported and you return here with a clear retry
          option.
        </p>
      </aside>
    </div>
  );
}

import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";

const PRIVACY_POINTS = [
  "Your audiobook audio remains in Google Drive.",
  "You choose the Audiobooks folder Quiet Library can scan.",
  "Disconnecting removes stored Drive credentials.",
] as const;

export default function PrivacyPromise() {
  return (
    <section className="px-page-gutter mx-auto max-w-7xl py-8 sm:py-16">
      <div className="bg-ink text-paper-elevated rounded-panel grid overflow-hidden lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-6 p-8 sm:p-12 lg:p-16">
          <span className="text-action flex items-center gap-2 text-xs font-bold tracking-widest uppercase">
            <Icon className="size-4" name="shield" />
            Private by design
          </span>
          <h2 className="font-display text-4xl leading-tight font-semibold sm:text-5xl">
            A listening room, not another file silo.
          </h2>
          <p className="text-paper-elevated/70 max-w-xl leading-relaxed">
            Quiet Library stores the small amount of metadata needed to keep
            your place. It does not upload your source audio to its own storage.
          </p>
          <div>
            <ActionLink href="/privacy" variant="secondary">
              Read the privacy approach
            </ActionLink>
          </div>
        </div>
        <div className="bg-paper-elevated/10 flex items-center p-8 sm:p-12 lg:p-16">
          <ul className="flex flex-col gap-5">
            {PRIVACY_POINTS.map((point) => (
              <li className="flex items-start gap-4" key={point}>
                <span className="bg-action text-ink mt-0.5 grid size-7 shrink-0 place-items-center rounded-full">
                  <Icon className="size-4" name="check" />
                </span>
                <span className="leading-relaxed">{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

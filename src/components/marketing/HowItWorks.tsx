import Icon, { type IconName } from "@/components/ui/Icon";
import SectionHeading from "@/components/ui/SectionHeading";

interface Step {
  description: string;
  icon: IconName;
  number: string;
  title: string;
}

const STEPS: readonly Step[] = [
  {
    description:
      "Sign in with Google, then grant Drive access separately. Identity and file access stay clearly separated.",
    icon: "cloud",
    number: "01",
    title: "Connect privately",
  },
  {
    description:
      "Create an Audiobooks folder, select it once with Google Picker, and scan only that folder and its subfolders.",
    icon: "upload",
    number: "02",
    title: "Choose your folder",
  },
  {
    description:
      "Listen across devices, keep your place, add bookmarks, and download selected titles for offline time.",
    icon: "headphones",
    number: "03",
    title: "Settle into the story",
  },
];

export default function HowItWorks() {
  return (
    <section
      className="px-page-gutter mx-auto flex max-w-7xl flex-col gap-10 py-20 sm:py-28"
      id="how-it-works"
    >
      <SectionHeading
        description="A small, deliberate path from your files to focused listening."
        eyebrow="Three quiet steps"
        title="Your own library, without the clutter"
      />
      <div className="grid gap-5 md:grid-cols-3">
        {STEPS.map((step) => (
          <article
            className="border-border bg-paper-elevated rounded-card flex flex-col gap-6 border p-6 shadow-sm sm:p-8"
            key={step.number}
          >
            <div className="flex items-center justify-between">
              <span className="bg-action-soft text-action-strong grid size-12 place-items-center rounded-full">
                <Icon className="size-5" name={step.icon} />
              </span>
              <span className="text-border font-display text-4xl font-semibold">
                {step.number}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-display text-2xl font-semibold">
                {step.title}
              </h3>
              <p className="text-ink-muted text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

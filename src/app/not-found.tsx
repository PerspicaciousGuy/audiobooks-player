import ActionLink from "@/components/ui/ActionLink";
import Icon from "@/components/ui/Icon";

export default function NotFoundPage() {
  return (
    <main className="bg-paper px-page-gutter grid min-h-screen place-items-center py-12">
      <section className="flex max-w-xl flex-col items-center gap-6 text-center">
        <span className="bg-action-soft text-action-strong grid size-16 place-items-center rounded-full">
          <Icon className="size-7" name="book-open" />
        </span>
        <div className="flex flex-col gap-3">
          <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
            Page not found
          </p>
          <h1 className="font-display text-5xl font-semibold">
            This chapter is missing
          </h1>
          <p className="text-ink-muted leading-relaxed">
            The page may have moved, or the selected audiobook is no longer in
            this preview library.
          </p>
        </div>
        <ActionLink href="/app/library">Return to your library</ActionLink>
      </section>
    </main>
  );
}

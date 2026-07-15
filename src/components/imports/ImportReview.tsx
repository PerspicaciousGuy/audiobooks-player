"use client";

import type { ImportPreviewGroup } from "@/features/imports/contracts";

interface ImportReviewProps {
  groups: ImportPreviewGroup[];
  isSubmitting: boolean;
  onChange: (groups: ImportPreviewGroup[]) => void;
  onSubmit: () => Promise<void>;
}

type EditableField = "author" | "narrator" | "series" | "title";

export default function ImportReview({
  groups,
  isSubmitting,
  onChange,
  onSubmit,
}: ImportReviewProps) {
  function updateGroup(
    index: number,
    field: EditableField,
    value: string,
  ): void {
    onChange(
      groups.map((group, groupIndex) =>
        groupIndex === index ? { ...group, [field]: value } : group,
      ),
    );
  }

  function splitGroup(index: number): void {
    const selected = groups[index];

    if (!selected || selected.files.length < 2) return;
    const splitGroups = selected.files.map((file) => ({
      ...selected,
      files: [file],
      title:
        file.detected.title ??
        file.name.replace(/\.[^.]+$/, "").replaceAll(/[._]+/g, " "),
    }));
    onChange([
      ...groups.slice(0, index),
      ...splitGroups,
      ...groups.slice(index + 1),
    ]);
  }

  function mergeAllGroups(): void {
    const first = groups[0];

    if (!first || groups.length < 2) return;
    onChange([
      {
        ...first,
        files: groups.flatMap(({ files }) => files),
      },
    ]);
  }

  return (
    <section className="flex flex-col gap-6">
      <div>
        <p className="text-action-strong text-xs font-bold tracking-widest uppercase">
          Review before importing
        </p>
        <h2 className="font-display mt-2 text-3xl font-semibold">
          Check grouping and book details
        </h2>
      </div>
      {groups.length > 1 ? (
        <button
          className="border-border hover:border-action rounded-control min-h-11 self-start border px-4 text-sm font-semibold"
          onClick={mergeAllGroups}
          type="button"
        >
          Combine all into one audiobook
        </button>
      ) : null}
      {groups.map((group, index) => (
        <article
          className="border-border bg-paper-elevated rounded-card flex flex-col gap-5 border p-5"
          key={group.files.map(({ driveFileId }) => driveFileId).join(":")}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {(["title", "author", "narrator", "series"] as const).map(
              (field) => (
                <label className="flex flex-col gap-2 text-sm" key={field}>
                  <span className="font-semibold capitalize">{field}</span>
                  <input
                    className="border-border focus:border-action rounded-control min-h-11 border bg-transparent px-3 outline-none"
                    onChange={(event) =>
                      updateGroup(index, field, event.currentTarget.value)
                    }
                    required={field === "title"}
                    value={group[field]}
                  />
                </label>
              ),
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold">
                {group.files.length} audio file
                {group.files.length === 1 ? "" : "s"}
              </p>
              {group.files.length > 1 ? (
                <button
                  className="text-action-strong hover:text-action text-xs font-bold"
                  onClick={() => splitGroup(index)}
                  type="button"
                >
                  Split into separate books
                </button>
              ) : null}
            </div>
            <ol className="text-ink-muted mt-2 flex list-decimal flex-col gap-1 pl-5 text-xs">
              {group.files.map((file) => (
                <li key={file.driveFileId}>{file.name}</li>
              ))}
            </ol>
          </div>
          <label className="flex max-w-44 flex-col gap-2 text-sm">
            <span className="font-semibold">Series position</span>
            <input
              className="border-border focus:border-action rounded-control min-h-11 border bg-transparent px-3 outline-none"
              min="0.01"
              onChange={(event) => {
                const value = event.currentTarget.valueAsNumber;
                onChange(
                  groups.map((candidate, groupIndex) =>
                    groupIndex === index
                      ? {
                          ...candidate,
                          seriesPosition: Number.isFinite(value) ? value : null,
                        }
                      : candidate,
                  ),
                );
              }}
              step="0.01"
              type="number"
              value={group.seriesPosition ?? ""}
            />
          </label>
        </article>
      ))}
      <button
        className="bg-ink text-paper-elevated hover:bg-action-strong focus-visible:ring-focus rounded-control min-h-12 self-start px-5 font-semibold focus-visible:ring-2 focus-visible:outline-none disabled:cursor-wait disabled:opacity-60"
        disabled={isSubmitting || groups.some(({ title }) => !title.trim())}
        onClick={() => void onSubmit()}
        type="button"
      >
        {isSubmitting ? "Importing securely…" : "Import into my library"}
      </button>
    </section>
  );
}
